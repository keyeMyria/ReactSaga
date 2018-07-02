// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  FlatList
} from 'react-native';
import { compose } from 'recompose';
import { withEmitter, promisify, AlertMessage } from 'AppUtilities';
import {
  SimpleTopNav,
  SearchBar,
  PrimaryCareDoctorList,
  Loading,
  ActivePrimaryCareDoctor
} from 'AppComponents';
import { SFRegular } from 'AppFonts';
import { connectPatient, connectAuth, connectProvider, connectLocation } from 'AppRedux';
import {
  WHITE,
  BACKGROUND_GRAY,
  SILVER,
  TEXT,
  DARK_GRAY,
  PRIMARY_COLOR
} from 'AppColors';
import I18n from 'react-native-i18n';
import { flatten, isEqual, map, filter } from 'lodash';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SILVER,
  },
  mainContainer: {
    marginTop: 15,
  },
  searchBarContainer: {
    backgroundColor: WHITE,
    height: 70
  },
  searchbar: {
    margin: 10,
    backgroundColor: BACKGROUND_GRAY
  },
  title: {
    color: TEXT,
    fontSize: 14,
    marginLeft: 10
  }
});

@withEmitter('_emitter')
class PrimaryCareDoctorContainer extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      isRefreshing: false,
      providers: {
        data: [],
        total_count: 0
      },
      page: 1,
      isChecking: false,
      points: null
    };
  }

  componentDidMount() {
    const { patient } = this.props;
    const activeProvider = filter(patient.primaryCareDoctors, p =>
      p === patient.activePatient.id);
    if (activeProvider.length === 0) {
      this.updateData(this.state.page, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!!this.props.auth.user && !nextProps.auth.user) { return; }

    /**
     * Fetch providers when list view is shown up
     */
    if (!this.props.isVisible && nextProps.isVisible) {
      this.setState({ points: nextProps.points }, () => {
        this.updateData(1, true);
      });
    }

    const { provider: oldProvider } = this.props;
    const { provider: newProvider } = nextProps;

    if (!isEqual(oldProvider.filter.specialtyId, newProvider.filter.specialtyId)
      || !isEqual(oldProvider.filter.specialtyCategoryId, newProvider.filter.specialtyCategoryId)
    ) {
      this.updateData(1, true, newProvider.filter);
    }
  }


  onProviderSelect = (selectedProvider) => {
    this.props.routeScene(
      'PrimaryCareDoctorDetailScene',
      {
        selectedProvider
      },
      {
        title: '',
        backButtonTitle: '',
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: true,
          navBarBackgroundColor: WHITE,
          navBarTextColor: DARK_GRAY,
          navBarButtonColor: PRIMARY_COLOR,
        }
      }
    );
  }

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

  onPressDeleteProvider = () => {
    const { patient, removePrimaryCareDoctor } = this.props;
    this.setState({ isChecking: true });
    promisify(removePrimaryCareDoctor, {
      user_id: patient.activePatient.id
    }).then(() => {
      this.setState({ isChecking: false });
    }).catch(error => AlertMessage.fromRequest(error))
      .finally(() => {
        this.setState({ isChecking: false });
      });
  }


  updateData = (nextPage = 1, checking = false, filterOpts = null) => {
    const {
      provider,
      getProvidersRequest,
      location
    } = this.props;
    const currentLocation = location.region;
    const { filter } = provider;
    const { providers, points } = this.state;

    const total = providers.total_count || 0;

    if (nextPage > 1 && providers.data.length >= total) {
      return;
    }

    const query = {};

    let practiceIds = [];
    if (points && points.length) {
      query.ids = flatten(map(points, point => point.properties.providers_ids));
      practiceIds = map(points, point => point.properties.id);
    } else if (currentLocation) {
      query.page_size = 20;
      query.page = nextPage;
      query.specialty_ids = [6, 55, 116];
      query.q = this.state.searchText;
      if (filterOpts) {
        query.sort_type = filterOpts.sortBy === 'closest'
          ? 'distance'
          : filterOpts.sortBy;
        query.sort_direction = 'asc';
      } else if (filter.sortBy) {
        query.sort_type = filter.sortBy === 'closest'
          ? 'distance'
          : filter.sortBy;
        query.sort_direction = 'asc';
      }

      query.center = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      };
    }

    if (query.ids || currentLocation) {
      if (points && points.length) {
        this.setState({
          practiceIds
        });
      }

      this.setState({
        page: nextPage
      });

      if (checking) {
        this.setState({ isChecking: true });
      }
      promisify(getProvidersRequest, { query: this.attachInsurancesToQuery(query) })
        .then((result) => {
          const newProviders = nextPage > 1
            ? {
              total_count: result.pagination.total,
              data: [
                ...providers.data,
                ...result.rows
              ]
            }
            : {
              total_count: result.pagination.total,
              data: result.rows
            };
          this.setState({ providers: newProviders });
        })
        .finally(() => this.setState({ isChecking: false }));
    }
  };

  searchProvider = (searchText) => {
    this.setState({ searchText, isChecking: true }, () => {
      this.updateData(1, true);
    });
  }

  render() {
    const { routeBack, patient, location } = this.props;
    const { data: providers } = this.state.providers;

    const activeProvider = filter(patient.primaryCareDoctors, p =>
      p.user_id === patient.activePatient.id);

    let title;
    if (providers.length === 0 && activeProvider.length === 0) {
      this.setState({ isChecking: true });
    } else {
      this.setState({ isChecking: false });
    }

    if (activeProvider.length !== 0) {
      title = I18n.t('primaryDoctorHeader');
    } else {
      title = I18n.t('findPrimaryDoctorHeader');
    }
    return (
      <View style={styles.container}>
        <SimpleTopNav
          onBack={routeBack}
          title={title}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.searchBarContainer}>
            <SearchBar
              onChangeText={(text) => { this.searchProvider(text); }}
              onSearch={() => null}
              onCancel={() => this.searchProvider}
              style={styles.searchbar}
              placeholder={I18n.t('searchExample')}
            />
          </View>
          <View style={styles.mainContainer}>
            {(!activeProvider.length === 0 && this.state.searchText === '') &&
            <SFRegular style={styles.title}>
              {I18n.t('primaryCareDoctor').toUpperCase()}
            </SFRegular>}
            {(activeProvider.length === 0 && this.state.searchText === '') &&
            <SFRegular style={styles.title}>
              {I18n.t('searchPrimaryCareDoctor').toUpperCase()}
            </SFRegular>}
            {(providers.length >= 1 || activeProvider.length !== 0) &&
            <FlatList
              ref={ref => this.list = ref}
              style={styles.providers}
              keyExtractor={item => `${item.provider.id}:${item.practice.id}`}
              data={(activeProvider.length !== 0 && this.state.searchText === '')
                ? activeProvider : providers}
              refreshing={this.state.isRefreshing}
              onRefresh={() => ((activeProvider.length === 0 && this.state.searchText === '')
                ? this.updateData(1, false) : '')}
              onEndReachedThreshold={1}
              onEndReached={() => {
                (activeProvider.length === 0 && this.state.searchText === '')
                  ? this.updateData(this.state.page + 1, false) : '';
              }}
              renderItem={({ item }) => {
                if (activeProvider.length !== 0 && this.state.searchText === '') {
                  return (
                    <ActivePrimaryCareDoctor
                      provider={item}
                      onProviderSelect={this.onProviderSelect}
                      onPressDeleteProvider={this.onPressDeleteProvider}
                    />
                  );
                }
                return (
                  <PrimaryCareDoctorList
                    provider={item}
                    onProviderSelect={this.onProviderSelect}
                    location={location.region}
                  />
                );
              }}
            />}
          </View>
        </View>
        {(this.state.isChecking) &&
        <Loading />}
      </View>
    );
  }
}

PrimaryCareDoctorContainer.propTypes = {
  routeBack: PropTypes.func.isRequired,
  routeScene: PropTypes.func.isRequired,
  primaryCareDoctors: PropTypes.func,
  getProvidersRequest: PropTypes.func.isRequired,
  removePrimaryCareDoctor: PropTypes.func.isRequired,
  provider: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default compose(
  connectPatient(),
  connectAuth(),
  connectLocation(),
  connectProvider()
)(PrimaryCareDoctorContainer);
