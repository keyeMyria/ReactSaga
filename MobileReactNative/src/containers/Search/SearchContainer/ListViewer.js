// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { SFBold } from 'AppFonts';
import {
  WHITE, BACKGROUND_LIGHT_GRAY, TEXT,
  DARK_GRAY, PRIMARY_COLOR
} from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import {
  NormalButton,
  ProviderListTopNav,
  AdvancedSearchBar,
  ProviderListItem,
  PatientListModal,
  Loading
} from 'AppComponents';
import {
  connectAuth,
  connectProvider,
  connectPatient,
  connectAppointment,
  connectInsurance,
  connectLocation,
  connectSearch
} from 'AppRedux';
import { dismissKeyboard, promisify, AlertMessage } from 'AppUtilities';
import I18n from 'react-native-i18n';
import { compose } from 'recompose';
import moment from 'moment';
import { find, map, intersectionBy, get, flatten, isEqual, isEmpty } from 'lodash';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 11
  },
  searchbar: {
    margin: 10
  },
  listTitle: {
    color: TEXT,
    fontSize: 12,
    paddingLeft: 10,
    paddingTop: 5
  },
  providers: {
    flex: 1,
    marginBottom: 10,
    backgroundColor: BACKGROUND_LIGHT_GRAY
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

export class ListViewer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isNavBarExpanded: false,
      isRefreshing: false,
      providers: {
        data: [],
        total_count: 0
      },
      page: 0,
      isChecking: false,
      points: null,
    };
  }

  componentDidMount() {
    this.updateData(1, true);
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

  /**
   * Expand nav bar to select patient
   */
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

  /**
   * Function to add a new patient from top nav bar
   */
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

  /**
   * Active patient is changed
   * @param item
   */
  onPatientSelected = (item) => {
    const { patient, setCurrentPatient } = this.props;
    const { activePatient } = patient;

    if (activePatient.id === item.id) {
      return;
    }

    setCurrentPatient(item);
    this.expandNavBar();
  };

  /**
   * Show provider detail page
   * @param provider
   * @param practice
   */
  showProviderDetail = (selectedProvider) => {
    const { patient, updatePatientStatus } = this.props;

    if (!this.props.auth.user) {
      this.props.switchTab(3, true);
      return;
    }

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
      const validInsurances = patientInsurances.filter((insurance) => {
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
    activePatient.insurances.map((ins) => {
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

    const existingProviders = providers.filter(p => p.is_existing);

    if (existingProviders.length === providers.length) {
      processAppointment();
    } else {
      Alert.alert(
        'OpenMed',
        I18n.t('areYouExistingPatient'),
        [
          {
            text: I18n.t('no'),
            onPress: () => {
              const newProviders = providers.filter(p => !!p.provider.is_new_patients_enable);
              if (newProviders.length === providers.length) {
                processAppointment();
              } else {
                const noNewProvidersNames = providers
                  .filter(p => !p.provider.is_new_patients_enable)
                  .map(p => p.provider.full_name);
                AlertMessage.fromRequest(I18n.t('newPatientsUnavailable', {
                  patient_names: noNewProvidersNames.join(', ')
                }));
              }
            }
          },
          {
            text: I18n.t('yes'),
            onPress: () => processAppointment(true)
          }
        ]
      );
    }
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

    let apptTypes = get(providers[0].practice, 'appointment_types', []);
    // eslint-disable-next-line
    apptTypes = apptTypes.filter(type => !(type.is_direct_booking && type.booking_time_intervals.length === 0));
    const requestType = apptTypes.filter(appt => appt.is_appointment_request).pop();

    const appointmentDetails = {
      isFirstAvailable: !appointmentTime,
      directBookingTime: null,
      bookingTime: appointmentTime,
      appointmentType: requestType
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

  /**
   * Search providers based on map center location
   * @param nextPage
   * @param checking
   * @param filterOpts
   */
  updateData = (nextPage = 1, checking = false, filterOpts = null) => {
    const {
      provider,
      getProvidersRequest,
      currentLocation
    } = this.props;
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

      if (filterOpts) {
        if (filterOpts.specialtyId) {
          query.specialty_ids = [filterOpts.specialtyId];
        } else if (filterOpts.specialtyCategoryId) {
          query.specialty_category_ids = [filterOpts.specialtyCategoryId];
        }
      } else if (filter.specialtyId) {
        if (filter.specialtyId) {
          query.specialty_ids = [filter.specialtyId];
        } else if (filter.specialtyCategoryId) {
          query.specialty_category_ids = [filter.specialtyCategoryId];
        }
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

  render() {
    if (!this.props.isVisible) {
      return null;
    }

    const { isNavBarExpanded, isRefreshing, isChecking } = this.state;
    const { data: providers } = this.state.providers;
    const { auth, appointment, patient, resetAppointment, onClose, location, search } = this.props;
    const { providers: selectedProviders } = appointment;

    const getAvatar = (provider) => {
      return provider.has_photo ?
        { uri: provider.photo }
        : null;
    };

    return (
      <View
        ref={ref => this._providerListPage = ref}
        style={styles.container}
      >
        <ProviderListTopNav
          activePatient={patient.activePatient}
          onFilter={this.handlePressFilterButton}
          onBack={() => onClose()}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
        />
        <AdvancedSearchBar
          width={WINDOW_WIDTH - 20}
          height={40}
          text={search.searchText}
          style={styles.searchbar}
          textStyle={{ fontSize: 11 }}
          onPress={this.props.onSearchBarClick}
        />
        <AdvancedSearchBar
          width={WINDOW_WIDTH - 20}
          height={40}
          text={search.searchLocation.name}
          style={[styles.searchbar, { marginTop: -3 }]}
          textStyle={{ fontSize: 11 }}
          onPress={this.props.onSearchBarClick}
          isLocationBar={true}
        />
        <FlatList
          ref={ref => this.list = ref}
          style={[styles.providers,
            { paddingBottom: selectedProviders.length > 0 ? 10 : 50 }
          ]}
          keyExtractor={(item) => `${item.provider.id}:${item.practice.id}`}
          data={providers}
          extraData={this.props}
          refreshing={isRefreshing}
          onRefresh={() => this.updateData(1, false)}
          onEndReachedThreshold={1}
          onEndReached={() => {
            this.updateData(this.state.page + 1, false);
          }}
          ListFooterComponent={() => <View style={{ height: 40 }} />}
          ListHeaderComponent={() =>
            <SFBold allowFontScaling={false} style={styles.listTitle}>
              {I18n.t('nearByDoctors').toUpperCase()}
            </SFBold>
          }
          renderItem={({ item }) => {
            return (
              <ProviderListItem
                key={`${item.provider.id}:${item.practice.id}`}
                dataSource={item}
                avatar={getAvatar(item.provider)}
                userLocation={location.region}
                selectedProviders={selectedProviders}
                user={auth.user}
                onShowProvider={this.showProviderDetail}
                onMakeAppointment={this.makeAppointment}
                onDirectBooking={this.doDirectBooking}
                resetAppointment={resetAppointment}
              />
            );
          }}
        />
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

ListViewer.propTypes = {
  isVisible: PropTypes.bool,
  currentLocation: PropTypes.object,
  points: PropTypes.array,
  routeScene: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  onSearchBarClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  provider: PropTypes.object.isRequired,
  getProvidersRequest: PropTypes.func.isRequired,
  appointment: PropTypes.object.isRequired,
  resetAppointment: PropTypes.func.isRequired,
  createAppointment: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  insurance: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  search: PropTypes.object.isRequired,
};

ListViewer.defaultProps = {
  isVisible: false
};

export default compose(
  connectAuth(),
  connectAppointment(),
  connectProvider(),
  connectPatient(),
  connectInsurance(),
  connectLocation(),
  connectSearch(),
)(ListViewer);
