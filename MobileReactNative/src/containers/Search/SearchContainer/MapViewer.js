// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

import {
  connectProvider,
  connectLocation,
  connectAuth,
  connectPatient,
  connectSearch
} from 'AppRedux';
import { dismissKeyboard, promisify, requestLocationAccess, AlertMessage } from 'AppUtilities';
import { Map, AdvancedSearchBar, Loading } from 'AppComponents';
import { WINDOW_WIDTH, NAVBAR_HEIGHT, ROOT_PADDING_TOP } from 'AppConstants';
import { TINT } from 'AppColors';

import I18n from 'react-native-i18n';
import Icon from 'react-native-vector-icons/Ionicons';
import { isEqual } from 'lodash';
import { compose } from 'recompose';
import * as Progress from 'react-native-progress';
import Geolocation from 'react-native-geolocation-service';
import config from 'react-native-config';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchBar: {
    position: 'absolute',
    zIndex: 10,
    top: 30 + ROOT_PADDING_TOP,
    left: 10
  },
  searchLocationBar: {
    position: 'absolute',
    zIndex: 10,
    top: 75 + ROOT_PADDING_TOP,
    left: 10
  },
  currentLocation: {
    position: 'absolute',
    top: NAVBAR_HEIGHT + 80 + ROOT_PADDING_TOP,
    right: 10,
    backgroundColor: 'transparent',
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  progress: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  }
});

const GEO_CHANGE_TIME = 1000; // 0.5s

const initialRegion = {
  latitude: 38.138147150712115,
  longitude: -95.7154973139652,
  latitudeDelta: 79.18321033885749,
  longitudeDelta: 65.91797479679032
};

const geolocationErrors = {
  1: [I18n.t('permissionDenied'), I18n.t('haveNotPermission')],
  2: [I18n.t('positionUnavailable'), I18n.t('turnOnYourGPS')],
  3: [I18n.t('cannotLoadLocation'), I18n.t('cannotFindLocation')],
};

export class MapViewer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      region: {},
      isTracking: false,
      isLoadingPosition: true,
      isChecking: false,
    };

    this.timer = null;
  }

  componentDidMount() {
    /**
     * Load and focus user's current location on the map
     */
    this.getCurrentLocation(this.onGetCurrentLocationCompleted);
  }

  componentWillReceiveProps(nextProps) {
    if (!!this.props.auth.user && !nextProps.auth.user) { return; }

    /**
     * Re-search on map if search text is changed
     */
    const { searchText: oldSearchText } = this.props.search;
    const { searchText: newSearchText } = nextProps.search;

    if (oldSearchText !== newSearchText) {
      this.searchRegionProviders();
    }

    /**
     * Re-search if search location is changed
     */
    const { searchLocation: oldSearchLocation } = this.props.search;
    const { searchLocation: newSearchLocation } = nextProps.search;

    if (!isEqual(oldSearchLocation, newSearchLocation)
      && this.state.region.latitude !== newSearchLocation.latitude
      && this.state.region.longitude !== newSearchLocation.longitude
    ) {
      const payload = {
        latitude: newSearchLocation.latitude,
        longitude: newSearchLocation.longitude,
        latitudeDelta: !newSearchLocation.latitudeDelta
          ? 0.021099855122066487
          : newSearchLocation.latitudeDelta,
        longitudeDelta: !newSearchLocation.longitudeDelta
          ? 0.021116330444812775
          : newSearchLocation.longitudeDelta
      };

      this.map.animateToRegion(payload, 0);
    }

    const { regionProviders: oldRegionProviders } = this.props.provider;
    const { regionProviders: newRegionProviders } = nextProps.provider;

    /**
     * Update provider markers on the map
     * When provider redux state is updated
     */
    if (!isEqual(oldRegionProviders, newRegionProviders)) {
      if (!this.state.isLoadingPosition) {
        this.setMarkers(newRegionProviders);
      }

      this.setMarkers(newRegionProviders);
    }

    const { provider: oldProvider } = this.props;
    const { provider: newProvider } = nextProps;

    /**
     * Re-search region providers if filter option is changed
     */
    if (!isEqual(oldProvider.filter.specialtyId, newProvider.filter.specialtyId)
      || !isEqual(oldProvider.filter.specialtyCategoryId, newProvider.filter.specialtyCategoryId)
    ) {
      this.searchRegionProviders();
    }
  }

  /**
   * Get current user location
   * After get it, search providers around it
   * @param callback
   */
  getCurrentLocation = (callback) => {
    try {
      Geolocation.getCurrentPosition(
        ({ coords }) => {
          callback(coords);
        },
        (err) => {
          const errorMessage = typeof err === 'string'
            ? [err, I18n.t('tryAgain')]
            : geolocationErrors[err.code];
          this.setState({ isLoadingPosition: false });
          AlertMessage.showMessage(...errorMessage);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } catch (e) {
      this.setState({ isLoadingPosition: false });
      AlertMessage.fromRequest(e);
    }
  };

  /**
   * Move to user's location on map
   * Synchronously call an api to get providers around it
   * @param region
   */
  onGetCurrentLocationCompleted = (region) => {
    const { setLocation } = this.props;

    this.props.onRegionChanged(region);
    setLocation(region);

    /**
     * This makes sometimes map view sucks to move into new location
     * Especially for the first animating to user's current location
     * Set delay to wait until map view is fully loaded to be animated
     */
    setTimeout(() => {
      const payload = {
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: 0.021099855122066487,
        longitudeDelta: 0.021116330444812775
      };

      /**
       * Animate/Zoom map to user's location
       */
      this.map.animateToRegion(payload);
      const positionTimer = setTimeout(() => {
        this.setState({ isLoadingPosition: false });
        clearTimeout(positionTimer);
      }, 2500);

      const query = {
        region: payload,
        key: config.GOOGLE_PLACES_API_KEY
      };
      this.props.getPlaceDetailsFromCoordinates({ query });

      /**
       * Search providers around user's current location
       */
      this.setState({
        region: payload
      }, () => {
        this.searchRegionProviders(payload);
      });
    }, 500);
  };

  getActivePatientMedicare = () => {
    const { patient } = this.props;
    return patient.activePatient.insurances.filter(ins => ins.medicare || ins.medicaid);
  };

  getActivePatientInsurances = () => {
    const { patient } = this.props;
    const insurances = patient.activePatient.insurances.filter(ins =>
      ins.insurance_plan_id && ins.insurance_provider_id);
    return insurances.map(ins => ins.insurance_plan_id);
  };

  /**
   * Show user's current location on map
   */
  showCurrentLocation = () => {
    this.setState({ isLoadingPosition: true });

    requestLocationAccess()
      .then(() => this.getCurrentLocation(this.onGetCurrentLocationCompleted))
      .catch(() => console.log('Location Permission is not granted.'));
  };

  /**
   * Map is moved
   * @param newRegion
   */
  onChangeRegion = (newRegion) => {
    /**
     * If map loaded user's location ignore
     */
    if (this.state.isLoadingPosition) {
      return;
    }

    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      /**
       * Let parent know the changed region
       */
      this.props.onRegionChanged(newRegion);

      this.setState({ region: newRegion }, () => {
        /**
         * Search google place api to get address based on lat/lng
         * @type {{region: *, key: *}}
         */
        const query = {
          region: newRegion,
          key: config.GOOGLE_PLACES_API_KEY
        };
        this.props.getPlaceDetailsFromCoordinates({ query });
        this.searchRegionProviders();
      });
    }, GEO_CHANGE_TIME);
  };

  /**
   * Search region providers based on map location
   * @param newRegion
   */
  searchRegionProviders = () => {
    const { getRegionProvidersRequest } = this.props;
    const { isLoadingPosition, region } = this.state;

    this.setState({ isTracking: true });

    const query = { region };

    if (isLoadingPosition) {
      query.userLocation = region;
    }

    promisify(getRegionProvidersRequest, this.attachInsurancesToQuery(query))
      .then((providers) => this.setMarkers(providers))
      .finally(() => this.setState({ isTracking: false }));
  }

  /**
   * Attach active patient's insurance details to search query
   * @param query
   * @returns {*}
   */
  attachInsurancesToQuery = (query) => {
    if (!this.props.auth.user) {
      return query;
    }

    const newQuery = Object.assign({}, query);

    const insuranceIds = this.getActivePatientInsurances();
    if (insuranceIds.length > 0) {
      newQuery.insurance_plan_ids = this.getActivePatientInsurances();
    }

    const medicares = this.getActivePatientMedicare();
    if (medicares.length > 0) {
      newQuery.medicare = 1;
    }

    return newQuery;
  };

  /**
   * Render providers on the map
   * @param regionProviders
   */
  setMarkers = (regionProviders) => {
    if (!regionProviders.results) {
      return;
    }

    if (regionProviders.results.length > 0) {
      const mapPoints = regionProviders.results.map(regionProvider => {
        return {
          properties: {
            point_count: 1,
            id: regionProvider.practice_id,
            providers_ids: [regionProvider.id]
          },
          geometry: {
            type: 'Point',
            coordinates: [regionProvider.location.lon, regionProvider.location.lat]
          }
        };
      }).filter(m => m.properties.point_count > 0);

      this.map.setMarkers(mapPoints);
    } else {
      const mapPoints = regionProviders.geohashes.map(regionProvider => {
        return {
          properties: {
            point_count: regionProvider.doc_count,
            id: regionProvider.key
          },
          geometry: {
            type: 'Point',
            coordinates: [regionProvider.center_lon.value, regionProvider.center_lat.value]
          }
        };
      }).filter(m => m.properties.point_count > 0);

      this.map.setMarkers(mapPoints);
    }
  };

  render() {
    const { setLocation, onSearchClick, onPressMarker, search } = this.props;
    const {
      isTracking,
      isLoadingPosition,
      isChecking
    } = this.state;

    return (
      <View style={styles.container}>
        <Map
          ref={ref => this.map = ref}
          onPressMarker={onPressMarker}
          onChangeRegionComplete={this.onChangeRegion}
          showsUserLocation
          showsMyLocationButton={false}
          loadingEnabled={false}
          moveOnMarkerPress={false}
          rotateEnabled={false}
          showsCompass={false}
          onPress={dismissKeyboard}
          initialRegion={initialRegion}
          enableToLoadUserLocation={true}
          setLocation={setLocation}
        />
        <AdvancedSearchBar
          width={WINDOW_WIDTH - 20}
          height={40}
          text={search.searchText}
          style={styles.searchBar}
          textStyle={{ fontSize: 11 }}
          onPress={onSearchClick}
        />
        <AdvancedSearchBar
          width={WINDOW_WIDTH - 20}
          height={40}
          text={search.searchLocation.name}
          style={styles.searchLocationBar}
          textStyle={{ fontSize: 11 }}
          onPress={onSearchClick}
          isLocationBar={true}
        />
        <TouchableOpacity
          onPress={() => this.showCurrentLocation()}
          style={styles.currentLocation}
        >
          <Icon name={'md-locate'} size={30} color={TINT} />
        </TouchableOpacity>
        {isTracking &&
          <Progress.Bar
            style={styles.progress}
            progress={0.3}
            width={WINDOW_WIDTH}
            height={1}
            color={TINT}
            indeterminate={true}
          />
        }
        {(isChecking || isLoadingPosition) &&
          <Loading isTopLevel={true} />
        }
      </View>
    );
  }
}

MapViewer.propTypes = {
  setLocation: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  getRegionProvidersRequest: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  onSearchClick: PropTypes.func.isRequired,
  onRegionChanged: PropTypes.func.isRequired,
  onPressMarker: PropTypes.func.isRequired,
  search: PropTypes.object.isRequired,
  getPlaceDetailsFromCoordinates: PropTypes.func.isRequired,
};

export default compose(
  connectAuth(),
  connectLocation(),
  connectProvider(),
  connectPatient(),
  connectSearch(),
)(MapViewer);
