// @flow

import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { compose } from 'recompose';
import {
  connectAuth,
  connectPatient,
  connectProvider,
  connectLocation,
  connectActivity,
  connectSearch,
  connectAppointment,
  connectInsurance
} from 'AppRedux';
import { dismissKeyboard, promisify, AlertMessage } from 'AppUtilities';
import I18n from 'react-native-i18n';
import {
  DoubleSearchBar,
  ProviderListTopNav,
  PatientListModal,
  ProviderListItem,
  NormalButton,
  Loading,
} from 'AppComponents';
import { WINDOW_WIDTH } from 'AppConstants';
import {
  WHITE,
  DARK_GRAY,
  PRIMARY_COLOR,
  GRAY,
  LIGHT_GRAY,
  BACKGROUND_LIGHT_GRAY,
  TEXT,
  BORDER_COLOR,
  PLACEHOLDER
} from 'AppColors';
import { SFBold, SFRegular } from 'AppFonts';
import config from 'react-native-config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { get, isEqual, intersectionBy, find, map, isEmpty } from 'lodash';
import moment from 'moment';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: WHITE,
    zIndex: 11
  },
  searchbar: {
    margin: 10,
    marginBottom: 5
  },
  searchListHeaderStyle: {
    fontSize: 12,
    color: TEXT,
    paddingLeft: 10,
    paddingVertical: 10,
    backgroundColor: BORDER_COLOR
  },
  searchIcon: {
    color: GRAY,
    backgroundColor: 'transparent',
    paddingLeft: 10,
    paddingVertical: 10
  },
  placeName: {
    alignSelf: 'center',
    fontSize: 14,
    paddingLeft: 10,
    paddingRight: 25,
    paddingVertical: 10,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    borderBottomColor: LIGHT_GRAY,
    borderBottomWidth: 0.5
  },
  providers: {
    flex: 1,
    marginBottom: 10,
    backgroundColor: BACKGROUND_LIGHT_GRAY
  },
  tab: {
    backgroundColor: WHITE,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
    marginTop: 5
  },
  tabItem: {
    paddingHorizontal: 15,
    height: 30,
    flexDirection: 'row',
    borderBottomColor: WHITE,
    borderBottomWidth: 2,
    paddingBottom: 5,
    marginHorizontal: 10,
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  requestButton: {
    width: WINDOW_WIDTH,
    height: 40,
    borderRadius: 0,
    zIndex: 9999
  },
  requestButtonLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14,
    color: WHITE
  }
});

const LAT_DELTA = 30.0;
const LON_DELTA = 30.0;

export class SearchViewer extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isNavBarExpanded: false,
      isSearchingLocation: false,
      selectedRegion: {
        lat: get(props.location, 'region.latitude', 38.138147150712115),
        lng: get(props.location, 'region.longitude', -95.7154973139652)
      },
      selectedText: '',
      selectedTab: 0,
      isChecking: false,
      providers: {
        data: [],
        total_count: 0
      },
      page: 0
    };

    this.searchTimer = null;
  }

  componentDidMount() {
    this.doSearch();
  }

  componentWillReceiveProps(nextProps) {
    if (!!this.props.auth.user && !nextProps.auth.user) { return; }

    /**
     * Re-search if search text is changed
     */
    const { searchText: oldSearchText } = this.props.search;
    const { searchText: newSearchText } = nextProps.search;

    if (oldSearchText !== newSearchText) {
      this.doSearch();
    }

    /**
     * Re-search if search location is changed
     */
    const { searchLocation: oldSearchLocation } = this.props.search;
    const { searchLocation: newSearchLocation } = nextProps.search;

    if (!isEqual(oldSearchLocation, newSearchLocation)) {
      this.setState({
        selectedLocation: newSearchLocation.name,
        selectedRegion: {
          lat: newSearchLocation.latitude,
          lng: newSearchLocation.longitude
        }
      }, () => this.doSearch());
    }

    /**
     * Format nav bar status
     */
    if (!this.props.isVisible && nextProps.isVisible) {
      this.setState({ isNavBarExpanded: false });
    }

    /**
     * Re-search if search location is changed
     */
    if (!isEqual(this.props.provider.filter.specialtyId, nextProps.provider.filter.specialtyId)) {
      this.doSearch(1, nextProps.provider.filter);
    }
  }

  expandNavBar = () => {
    const { isNavBarExpanded } = this.state;
    this.setState({ isNavBarExpanded: !isNavBarExpanded });

    if (isNavBarExpanded) {
      this.patientListModal.hide();
    } else {
      dismissKeyboard();
      this.patientListModal.show();
    }
  };

  onAddPatient = () => {
    this.expandNavBar();

    this.props.routeScene('AddProfileScene', null, {
      title: I18n.t('addMember'),
      backButtonTitle: '',
      navigatorStyle: {
        navBarHidden: false,
        tabBarHidden: false,
        navBarBackgroundColor: WHITE,
        navBarTextColor: DARK_GRAY,
        navBarButtonColor: PRIMARY_COLOR,
      },
      overrideBackPress: true
    });
  };

  onPatientSelected = (item) => {
    const { patient, setCurrentPatient } = this.props;
    const { activePatient } = patient;

    if (activePatient.id === item.id) {
      return;
    }

    setCurrentPatient(item);
    this.expandNavBar();
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

  doSearch = (nextPage = 1, filterOpts = null) => {
    const { searchProviders, provider } = this.props;
    const { selectedRegion } = this.state;
    const { filter } = provider;

    const { providers } = this.state;
    const total = providers.total_count || 0;
    if (nextPage > 1 && providers.data.length >= total) {
      return;
    }

    const query = {
      page_size: 10,
      page: nextPage
    };

    if (filterOpts) {
      query.specialty_category_ids = [filterOpts.specialtyId];
    } else if (filter.specialtyId) {
      query.specialty_category_ids = [filter.specialtyId];
    }

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

    if (selectedRegion.lat && selectedRegion.lng) {
      query.top_left = {
        latitude: selectedRegion.lat + LAT_DELTA,
        longitude: selectedRegion.lng - LON_DELTA
      };
      query.bottom_right = {
        latitude: selectedRegion.lat - LAT_DELTA,
        longitude: selectedRegion.lng + LON_DELTA
      };
    }

    this.setState({ isChecking: true });

    promisify(searchProviders, { query: this.attachInsurancesToQuery(query) })
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

        this.setState({ providers: newProviders, page: nextPage });
      })
      .catch(e => this.setState({ providers: e }))
      .finally(() => this.setState({ isChecking: false }));
  };

  onSearchTextChanged = (e) => {
    /**
     * Save search text in redux state
     */
    this.setState({ selectedText: e }, () => {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.props.setSearchText({ searchText: e });
      }, 500);
    });
  };

  onSearchLocationChanged = (loc) => {
    const { searchPlaces, location } = this.props;

    this.setState({ selectedLocation: loc });

    if (!loc || loc === '') {
      const userLocation = {
        lat: location.region.latitude,
        lng: location.region.longitude
      };

      this.setState({ selectedRegion: userLocation }, () => {
        this.doSearch();
      });
      return;
    }

    const query = {
      key: config.GOOGLE_PLACES_API_KEY,
      language: 'en',
      name: loc
    };

    searchPlaces({ query });
  };

  onNewLocationClicked = (id, name) => {
    const { getPlaceDetails } = this.props;

    this.setState({
      selectedLocation: name,
      isSearchingLocation: false
    });

    promisify(getPlaceDetails, { id, key: config.GOOGLE_PLACES_API_KEY })
      .then((data) => {
        /**
         * Save search location in redux state
         */
        this.props.setSearchLocation({
          searchLocation: {
            name,
            latitude: data.result.geometry.location.lat,
            longitude: data.result.geometry.location.lng,
            latitudeDelta: 8.839974735351948,
            longitudeDelta: 6.274371059982798
          }
        });
      })
      .catch(() => {});
  };

  handlePressFilterButton = () => {
    const { showLightBox } = this.props;

    showLightBox(
      'ProviderFilterDialog', null,
      {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        tapBackgroundToDismiss: true,
        animationIn: 'slideLeftIn',
        animationOut: 'slideRightOut'
      }
    );
  };

  renderLocations = () => {
    const { searchedPlaces } = this.props.search;

    return (
      <FlatList
        style={styles.providers}
        keyExtractor={item => JSON.stringify(item)}
        onScroll={() => dismissKeyboard()}
        data={searchedPlaces}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => this.onNewLocationClicked(item.place_id, item.description)}
              style={styles.placeItem}
            >
              <Icon
                name={'location-on'}
                size={20}
                style={styles.searchIcon}
              />
              <SFRegular
                numberOfLines={1}
                style={styles.placeName}
              >
                {item.description}
              </SFRegular>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  getAvatar = (provider) => {
    return provider.photo_url ?
      { uri: provider.photo_url }
      : null;
  };

  /**
   * Send appointment requests to multi providers
   */
  makeMultiAppointments = () => {
    const { createAppointment, routeScene } = this.props;
    const { providers, appointmentTime } = this.props.appointment;
    const { filter } = this.props.provider;
    const { activePatient } = this.props.patient;

    const appointmentToPractices = providers.map((provider) => {
      let apptTypes = get(provider.practice, 'appointment_types', []);
      // eslint-disable-next-line
      apptTypes = apptTypes.filter(type => !(type.is_direct_booking && type.booking_time_intervals.length === 0));
      const requestType = apptTypes.filter(appt => appt.is_appointment_request).pop();
      if (requestType) {
        return {
          provider_id: provider.provider.id,
          practice_id: provider.practice.id,
          appointment_type_id: requestType.id
        };
      }

      return {
        provider_id: provider.provider.id,
        practice_id: provider.practice.id
      };
    });
    let { specialtyId } = filter;
    if (!specialtyId) {
      const providersSpecialties = map(providers, 'specialties');
      const specialties = intersectionBy(...providersSpecialties, 'id');
      specialtyId = specialties.length
        ? specialties[0].id
        : get(this.props.insurance, 'specialties.popular_specialties[0].id');
    }
    const appointment = {
      specialty_id: specialtyId,
      appointment_to_practices: appointmentToPractices,
      reason: this.state.note || ' ',
      user_id: activePatient.id
    };
    if (appointmentTime) {
      appointment.desired_time = appointmentTime;
    }

    const processAppointment = () => {
      this.setState({ isChecking: true });

      promisify(createAppointment, { appointment })
        .then((appt) => {
          routeScene(
            'AppointmentDetailScene',
            {
              fromCalendar: false,
              selectedAppointment: {
                ...appt.appointment_to_practices[0],
                providers
              }
            },
            {
              navigatorStyle: {
                navBarHidden: true,
                tabBarHidden: false
              }
            }
          );
        })
        .catch((error) => {
          if (error.number) {
            this.showError(error.message, error.number);
          } else {
            AlertMessage.fromRequest(error);
          }
        })
        .finally(() => this.setState({ isChecking: false }));
    };

    processAppointment();
  };

  makeAppointment = (provider) => {
    const {
      auth,
      switchTab,
      resetAppointment,
      showLightBox,
      routeScene,
      patient
    } = this.props;

    const doRequestAppointment = () => {
      if (provider) {
        resetAppointment({
          time: undefined,
          providers: [provider]
        });
      }

      showLightBox(
        'ConfirmTimeDialog',
        { onChangeTime: this.onChanageTime, onFirstAvailable: this.onFirstAvailable },
        {
          backgroundBlur: 'light',
          backgroundColor: 'transparent',
          tapBackgroundToDismiss: true
        }
      );
    };

    if (!auth.user) {
      switchTab(3, true);
    } else if (isEmpty(patient.activePatient.birthday)) {
      Alert.alert(
        'OpenMed',
        I18n.t('birthdayRequired'),
        [
          {
            text: I18n.t('ok'),
            onPress: () => switchTab(3)
          }
        ]
      );
    } else if (!this.hasInsuranceDetails()) {
      Alert.alert(
        'OpenMed',
        I18n.t('inputInsuranceCardDetails'),
        [
          {
            text: I18n.t('ok'),
            onPress: () => {
              routeScene(
                'EditInsuranceScene',
                {
                  patientInsurance: patient.activePatient.insurances[0],
                  mode: 2
                },
                {
                  navigatorStyle: {
                    navBarHidden: true,
                    tabBarHidden: false
                  }
                }
              );
            }
          }
        ]
      );
    } else if (!this.hasActivityInMonth()) {
      const { insurance } = this.props;
      const { activePatient } = patient;
      const { insurances } = insurance;

      const insuranceData = activePatient.insurances[0];
      const selectedInsurance = find(insurances, { id: insuranceData.insurance_provider_id });
      const plans = selectedInsurance ? selectedInsurance.insurance_plans : [];
      const plan = find(plans, { id: insuranceData.insurance_plan_id });

      /*eslint-disable*/
      const alertMessage = selectedInsurance && plan
        ? I18n.t('hasInsuranceChanged', { insurance: selectedInsurance.name, insurance_plan: plan.name, member_id: insuranceData.group_id ? insuranceData.group_id : '-', subscriber_id: insuranceData.subscriber_id ? insuranceData.subscriber_id : '-' })
        : insuranceData.medicaid
          ? I18n.t('hasInsuranceMedicareChanged', { insurance: I18n.t('medicaid'), member_id: insuranceData.group_id ? insuranceData.group_id : '-', subscriber_id: insuranceData.subscriber_id ? insuranceData.subscriber_id : '-' })
          : insuranceData.medicare
            ? I18n.t('hasInsuranceMedicareChanged', { insurance: I18n.t('medicare'), member_id: insuranceData.group_id ? insuranceData.group_id : '-', subscriber_id: insuranceData.subscriber_id ? insuranceData.subscriber_id : '-' })
            : I18n.t('hasInsuranceSelfPayingChanged');
      /*eslint-disable*/

      Alert.alert(
        'OpenMed',
        alertMessage,
        [
          {
            text: activePatient.insurances.length > 1 ? I18n.t('seeAll') : I18n.t('no'),
            onPress: () => switchTab(3)
          },
          {
            text: I18n.t('yes'),
            onPress: () => doRequestAppointment()
          }
        ]
      );
    } else {
      doRequestAppointment();
    }
  };

  onChanageTime = () => {
    const { dismissLightBox, showLightBox } = this.props;

    dismissLightBox();
    setTimeout(() => {
      showLightBox('SelectTimeDialog', { onConfirmTimeRequest: this.onConfirmTimeRequest }, {
        backgroundBlur: 'light',
        backgroundColor: 'transparent',
        tapBackgroundToDismiss: true
      });
    }, 500);
  };

  showError = (error, code) => {
    const { resendEmail, resendPhone, patient } = this.props;

    if (code === 1004) {
      Alert.alert(
        'OpenMed',
        I18n.t(`error_${code}`),
        [
          {
            text: I18n.t('resendEmail'),
            onPress: () => {
              resendEmail({ user_id: patient.activePatient.id, type: 0 });
              Alert.alert('OpenMed', I18n.t('pleaseConfirmEmail'));
            }
          },
          { text: I18n.t('cancel') }
        ]
      );
    } else if (code === 1005) {
      Alert.alert(
        'OpenMed',
        I18n.t(`error_${code}`),
        [
          {
            text: I18n.t('resendSms'),
            onPress: () => {
              resendPhone({ user_id: patient.activePatient.id, type: 1 });
              Alert.alert('OpenMed', I18n.t('pleaseConfirmSms'));
            }
          },
          { text: I18n.t('cancel') }
        ]
      );
    } else {
      Alert.alert(
        'OpenMed',
        error
      );
    }
  };

  sendAppointmentRequest = () => {
    const { providers, appointmentTime } = this.props.appointment;

    if (providers.length > 1) {
      this.makeMultiAppointments();
      return;
    }

    const appointmentDetails = {
      isFirstAvailable: !appointmentTime,
      directBookingTime: null,
      bookingTime: appointmentTime,
      appointmentType: get(providers[0].practice, 'appointment_types[0]')
    };

    this.props.routeScene('AppointmentPreviewScene',
      {
        selectedProvider: providers[0],
        appointmentDetails
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        },
      }
    );
  };

  onFirstAvailable = () => {
    const { dismissLightBox } = this.props;
    dismissLightBox();

    setTimeout(() => {
      this.sendAppointmentRequest();
    }, 500);
  };

  onConfirmTimeRequest = () => {
    const { dismissLightBox } = this.props;
    dismissLightBox();

    setTimeout(() => {
      this.sendAppointmentRequest();
    }, 500);
  };

  /**
   * Process direct booking
   * @param provider
   * @param practice
   * @param directBookingTime
   */
  doDirectBooking = (provider, directBookingTime, appointmentType) => {
    const appointmentDetails = {
      isFirstAvailable: false,
      directBookingTime,
      bookingTime: null,
      appointmentType
    };

    this.props.routeScene('AppointmentPreviewScene',
      {
        selectedProvider: provider,
        appointmentDetails
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        },
      }
    );
  };

  /**
   * Show provider detail page
   * @param provider
   * @param practice
   */
  showProviderDetail = (selectedProvider) => {
    const { patient, addRecentSearch, updatePatientStatus } = this.props;

    if (!this.props.auth.user) {
      this.props.switchTab(3, true);
      return;
    }

    addRecentSearch(selectedProvider);

    const routeToDetailScene = () => {
      this.props.routeScene(
        'ProviderDetailScene',
        {
          selectedProvider
        },
        {
          navigatorStyle: {
            navBarHidden: true,
            tabBarHidden: false
          }
        }
      );
    };

    const updateExistingStatus = (is_existing) => {
      const params = {
        user_id: patient.activePatient.id,
        provider_id: selectedProvider.provider.id,
        practice_id: selectedProvider.practice.id,
        state: is_existing
      };

      this.setState({ isChecking: true });
      promisify(updatePatientStatus, params)
        .then(() => {
          const newProviders = this.state.providers.data.map((p) => {
            if (p.provider.id === selectedProvider.provider.id
              && p.practice.id === selectedProvider.practice.id) {
              return {
                ...p,
                is_existing
              };
            }
            return p;
          });
          this.setState({ providers: { ...this.state.providers, data: newProviders } });
          routeToDetailScene();
        })
        .catch(error => AlertMessage.fromRequest(error))
        .finally(() => this.setState({ isChecking: false }));
    };

    if (selectedProvider.is_existing !== null || !this.props.auth.user) {
      routeToDetailScene();
    } else {
      Alert.alert(
        'OpenMed',
        I18n.t('areYouExistingPatient'),
        [
          {
            text: I18n.t('no'),
            onPress: () => updateExistingStatus(false)
          },
          {
            text: I18n.t('yes'),
            onPress: () => updateExistingStatus(true)
          }
        ]
      );
    }
  };

  /**
   * Check if active patient has insurance
   * @returns {boolean}
   */
  hasInsuranceDetails = () => {
    const { activePatient } = this.props.patient;
    const { insurances: patientInsurances } = activePatient;
    const { insurances } = this.props.insurance;

    if (patientInsurances) {
      const validInsurances = patientInsurances.filter(insurance => {
        const insuranceData = insurance || {};
        const selectedInsurance = find(insurances, { id: insuranceData.insurance_provider_id });
        const plans = selectedInsurance ? selectedInsurance.insurance_plans : [];
        const plan = find(plans, { id: insuranceData.insurance_plan_id });

        return (selectedInsurance && plan)
          || insuranceData.medicaid
          || insuranceData.medicare
          || insuranceData.self_pay;
      });

      if (validInsurances.length > 0) {
        return true;
      }
    }

    return false;
  };

  /**
   * Check if patient has no activity for a month
   * If there isn't any activity with in a month
   * Ask to check insurance details
   * @returns {boolean}
   */
  hasActivityInMonth = () => {
    const { activePatient } = this.props.patient;

    const currentDate = moment(new Date());
    let lastUpdatedAt = activePatient.last_appointment_at ? activePatient.last_appointment_at : 0;

    // calculate days passed from the last updated date of insurance details
    activePatient.insurances.map(ins => {
      lastUpdatedAt = ins.updated_at && ins.updated_at > lastUpdatedAt
        ? ins.updated_at
        : lastUpdatedAt;
      return ins;
    });

    // calculate different time as days
    const lastUpdatedDate = moment.unix(lastUpdatedAt);
    const duration = moment.duration(currentDate.diff(lastUpdatedDate));
    const passedDays = duration.asDays();

    return passedDays <= 31;
  };

  renderSearchResult = () => {
    const { auth, location, appointment, resetAppointment } = this.props;
    const { providers: selectedProviders } = appointment;
    const { providers, isChecking } = this.state;

    return (
      <FlatList
        style={styles.providers}
        keyExtractor={(item) => `${item.provider.id}:${item.practice.id}`}
        onScroll={() => dismissKeyboard()}
        data={providers.data}
        onEndReachedThreshold={1}
        onEndReached={() => {
          if (!isChecking) {
            this.doSearch(this.state.page + 1);
          }
        }}
        ListFooterComponent={() => {
          return (
            <View
              style={{ height: 40 }}
            />
          );
        }}
        renderItem={({ item }) => {
          return (
            <ProviderListItem
              key={`${item.provider.id}:${item.practice.id}`}
              dataSource={item}
              avatar={this.getAvatar(item.provider)}
              userLocation={location.region}
              selectedProviders={selectedProviders}
              user={auth.user}
              onShowProvider={() => this.showProviderDetail(item)}
              onMakeAppointment={this.makeAppointment}
              onDirectBooking={this.doDirectBooking}
              resetAppointment={resetAppointment}
            />
          );
        }}
      />
    );
  };

  renderTab = () => {
    const { selectedTab } = this.state;

    return (
      <View style={styles.tab}>
        <TouchableOpacity onPress={() => {
          dismissKeyboard();
          this.setState({ selectedTab: 0 });
        }}
        >
          <View
            style={[styles.tabItem,
              { borderBottomColor: selectedTab === 0 ? PRIMARY_COLOR : WHITE }
            ]}
          >
            <Icon
              name={'favorite-border'}
              size={20}
              color={selectedTab === 0 ? PRIMARY_COLOR : PLACEHOLDER}
            />
            <SFBold
              style={{ marginLeft: 10, color: selectedTab === 0 ? PRIMARY_COLOR : PLACEHOLDER }}
            >
              {I18n.t('results').toUpperCase()}
            </SFBold>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          dismissKeyboard();
          this.setState({ selectedTab: 1 });
        }}
        >
          <View
            style={[styles.tabItem,
              { borderBottomColor: selectedTab === 1 ? PRIMARY_COLOR : WHITE }
            ]}
          >
            <Icon
              name={'schedule'}
              size={20}
              color={selectedTab === 1 ? PRIMARY_COLOR : PLACEHOLDER}
            />
            <SFBold
              style={{ marginLeft: 10, color: selectedTab === 1 ? PRIMARY_COLOR : PLACEHOLDER }}
            >
              {I18n.t('recentSearch').toUpperCase()}
            </SFBold>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderFavoriteTab = () => {
    const { isSearchingLocation } = this.state;

    if (isSearchingLocation) {
      return this.renderLocations();
    }

    return this.renderSearchResult();
  };

  renderRecentTab = () => {
    const { auth, location, appointment, resetAppointment } = this.props;
    const { recentSearches } = auth;
    const { providers: selectedProviders } = appointment;

    return (
      <FlatList
        style={styles.providers}
        keyExtractor={(item) => `${item.provider.id}:${item.practice.id}`}
        data={recentSearches}
        onScroll={() => dismissKeyboard()}
        renderItem={({ item }) => {
          return (
            <ProviderListItem
              key={`${item.provider.id}:${item.practice.id}`}
              dataSource={item}
              avatar={this.getAvatar(item.provider)}
              userLocation={location.region}
              selectedProviders={selectedProviders}
              user={auth.user}
              onShowProvider={() => this.showProviderDetail(item)}
              onMakeAppointment={this.makeAppointment}
              onDirectBooking={this.doDirectBooking}
              resetAppointment={resetAppointment}
            />
          );
        }}
      />
    );
  };

  renderContent = () => {
    const { selectedTab } = this.state;

    if (selectedTab === 0) {
      return this.renderFavoriteTab();
    }

    return this.renderRecentTab();
  };

  renderContentHeader = () => {
    const { isSearchingLocation, selectedTab } = this.state;

    if (selectedTab === 1) {
      return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <SFBold
            allowFontScaling={false}
            style={styles.searchListHeaderStyle}
          >
            RECENT SEARCH
          </SFBold>
        </TouchableWithoutFeedback>
      );
    }

    return (
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <SFBold
          allowFontScaling={false}
          style={styles.searchListHeaderStyle}
        >
          {isSearchingLocation
            ? I18n.t('location').toUpperCase()
            : I18n.t('searchResult').toUpperCase()}
        </SFBold>
      </TouchableWithoutFeedback>
    );
  };

  render() {
    if (!this.props.isVisible) {
      return null;
    }

    const { onClose, patient, appointment } = this.props;
    const { isNavBarExpanded, selectedText, selectedLocation, isChecking } = this.state;
    const { providers: selectedProviders } = appointment;

    return (
      <View style={styles.container}>
        <ProviderListTopNav
          activePatient={patient.activePatient}
          onBack={onClose}
          onFilter={this.handlePressFilterButton}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
        />
        <DoubleSearchBar
          ref={ref => this.searchBar = ref}
          width={WINDOW_WIDTH - 20}
          height={36}
          style={styles.searchbar}
          value={selectedText}
          initialLocation={selectedLocation}
          onSearchTextChanged={(e) => this.onSearchTextChanged(e)}
          onSearchTextFieldFocused={() => this.setState({ isSearchingLocation: false })}
          onSearchLocationChanged={(l) => this.onSearchLocationChanged(l)}
          onSearchLocationFieldFocused={() => this.setState({ isSearchingLocation: true })}
        />
        {this.renderTab()}
        {this.renderContentHeader()}
        {this.renderContent()}
        {selectedProviders.length > 0 &&
          <View>
            <NormalButton
              text={I18n.t('sendRequest').toUpperCase()}
              style={styles.requestButton}
              textStyle={styles.requestButtonLabel}
              pressed={true}
              singleColorButton={true}
              borderRadius={0}
              onPress={() => this.makeAppointment()}
            />
            <View style={{ height: 45 }} />
          </View>
        }
        <PatientListModal
          ref={ref => this.patientListModal = ref}
          patients={patient.patients}
          onAddPatient={this.onAddPatient}
          onPatientSelected={this.onPatientSelected}
          onBackgroundClicked={this.expandNavBar}
        />
        {isChecking &&
          <Loading showOverlay={true} isTopLevel={true} />
        }
      </View>
    );
  }
}

SearchViewer.propTypes = {
  isVisible: PropTypes.bool,
  routeScene: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
  provider: PropTypes.object.isRequired,
  getRegionProvidersRequest: PropTypes.func.isRequired,
  activity: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  addRecentSearch: PropTypes.func.isRequired,
  search: PropTypes.object.isRequired,
  setSearchText: PropTypes.func.isRequired,
  setSearchLocation: PropTypes.func.isRequired,
  searchProviders: PropTypes.func.isRequired,
  searchPlaces: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  setCurrentPatient: PropTypes.func.isRequired,
  updatePatientStatus: PropTypes.func.isRequired,
  getPlaceDetails: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  appointment: PropTypes.object.isRequired,
  resetAppointment: PropTypes.func.isRequired,
  insurance: PropTypes.object.isRequired,
  fromFavorite: PropTypes.bool.isRequired,
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectActivity(),
  connectLocation(),
  connectProvider(),
  connectSearch(),
  connectAppointment(),
  connectInsurance(),
)(SearchViewer);
