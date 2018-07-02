// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { withEmitter } from 'AppUtilities';
import { connectLocation, connectAppointment, connectAuth } from 'AppRedux';
import I18n from 'react-native-i18n';
import _ from 'lodash';
import { compose } from 'recompose';

import MapView from './MapViewer';
import ListView from './ListViewer';
import SearchView from './SearchViewer';
import FloatingBar from './FloatingBar';

const moment = require('moment');
const esLocale = require('moment/locale/es');
const enLocale = require('moment/locale/en-nz');

if (_.includes(I18n.currentLocale(), 'es')) {
  moment.locale('es', esLocale);
} else {
  moment.locale('en', enLocale);
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});

@withEmitter('eventEmitter')
export class SearchContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      scene: 'map',
      currentLocation: null,
      points: null,
      fromFavorite: false
    };
  }

  componentWillMount() {
    this.eventEmitter.on('AppRoot:TOKEN_EXPIRED', this.onLogoutEventListener);
    this.eventEmitter.on('AppRoot:LOAD_SEARCH', this.onLoadSearchPageListener);
  }

  componentWillUnmount() {
    this.eventEmitter.removeListener('AppRoot:TOKEN_EXPIRED', this.onLogoutEventListener);
    this.eventEmitter.removeListener('AppRoot:LOAD_SEARCH', this.onLoadSearchPageListener);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.auth.user && nextProps.auth.user) {
      this.props.popToRoot();
    }
  }

  loadSearchPage = (fromFavorite = false) => {
    this.setState({
      scene: 'search',
      fromFavorite
    });
  };

  onLoadSearchPageListener = (fromFavorite = false) => {
    this.props.popToRoot();

    if (fromFavorite) {
      this.loadSearchPage();
      return;
    }

    setTimeout(() => {
      this.loadSearchPage();
    }, 500);
  };

  /**
   * Show map view on logout
   */
  onLogoutEventListener = () => {
    this.props.popToRoot();

    this.setState({ scene: 'map' });
  };

  /**
   * Show filter option dialog
   */
  handlePressFilterButton = () => {
    const { showLightBox } = this.props;

    showLightBox(
      'ProviderFilterDialog',
      null,
      {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        tapBackgroundToDismiss: true,
        animationIn: 'slideLeftIn',
        animationOut: 'slideRightOut'
      }
    );
  };

  /**
   * Handle tap events on markers
   * @param points
   * @param isGeohash
   */
  handlePressMarker = (points, isGeohash) => {
    const { resetAppointment } = this.props;

    resetAppointment({ providers: [] });

    this.setState({
      scene: 'list',
      points: isGeohash ? null : points,
    });
  };

  handlePressMap = () => {
    this.props.resetAppointment({ providers: [] });
    this.setState({ scene: 'map' });
  }

  handlePressSearch = () => {
    this.props.resetAppointment({ providers: [] });
    this.setState({ scene: 'search' });
  }

  render() {
    const {
      scene,
      currentLocation,
      points,
      fromFavorite
    } = this.state;

    const {
      routeScene,
      switchTab,
      showLightBox,
      dismissLightBox,
      location
    } = this.props;

    return (
      <View style={styles.container}>
        <MapView
          onRegionChanged={loc => this.setState({ currentLocation: loc })}
          onSearchClick={this.handlePressSearch}
          onPressMarker={this.handlePressMarker}
        />
        <ListView
          isVisible={scene === 'list'}
          currentLocation={currentLocation}
          userLocation={location.region}
          points={points}
          routeScene={routeScene}
          switchTab={switchTab}
          showLightBox={showLightBox}
          dismissLightBox={dismissLightBox}
          onSearchBarClick={this.handlePressSearch}
          onClose={this.handlePressMap}
        />
        <SearchView
          isVisible={scene === 'search'}
          routeScene={routeScene}
          switchTab={switchTab}
          showLightBox={showLightBox}
          dismissLightBox={dismissLightBox}
          onClose={this.handlePressMap}
          fromFavorite={fromFavorite}
        />
        <FloatingBar
          viewerName={this.state.scene}
          onMapClick={this.handlePressMap}
          onFilterClick={() => this.handlePressFilterButton()}
          onListClick={() => this.handlePressMarker(null, true)}
        />
      </View>
    );
  }
}

SearchContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  auth: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({}).isRequired,
  resetAppointment: PropTypes.func.isRequired
};

export default compose(
  connectAuth(),
  connectLocation(),
  connectAppointment(),
)(SearchContainer);
