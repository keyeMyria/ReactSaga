// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  AsyncStorage,
} from 'react-native';
import I18n from 'react-native-i18n';
import { dismissKeyboard, withEmitter } from 'AppUtilities';
import {
  Notification,
  AdvancedSearchBar,
  ProviderListTopNav,
  PatientListModal,
  FavoriteProviderListItem,
  Loading
} from 'AppComponents';
import _ from 'lodash';
import {
  connectAuth, connectAppointment,
  connectPatient, connectLocation,
  connectProvider, connectInsurance
} from 'AppRedux';

import {
  BACKGROUND_GRAY, TEXT,
  SNOW, DARK_GRAY, BACKGROUND_LIGHT_GRAY,
  PRIMARY_COLOR, WHITE
} from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import { SFBold } from 'AppFonts';
import { PrivacyContainer, WelcomeContainer } from 'AppContainers';
import { compose } from 'recompose';
import moment from 'moment';

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND_GRAY,
    flexDirection: 'column',
    flex: 1
  },
  searchbar: {
    margin: 10
  },
  listTitle: {
    color: TEXT,
    fontSize: 14,
    paddingLeft: 10,
    paddingTop: 20
  },
  topView: {
    backgroundColor: SNOW
  },
  providers: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GRAY
  }
});

@withEmitter('emitter')
export class FavoriteContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isNavBarExpanded: false,
      isChecking: false,
      acceptedPrivacyPolicy: false,
    };
  }

  componentWillMount() {
    const { auth, camera } = this.props;

    if (auth.user) {
      this.updateData(auth.user.id);
    }

    this.emitter.on('AppRoot:TOKEN_EXPIRED', this.onLogoutEventListener);
    this.emitter.on('Notification:AcceptedPrivacyPolicy', this.onAcceptedPrivacyPolicy);

    AsyncStorage.getItem('@OPENMED:ACCEPT_PRIVACY')
      .then(value => value === 'ACCEPTED' && this.setState({ acceptedPrivacyPolicy: true }))
      .catch(() => this.setState({ acceptedPrivacyPolicy: false }));
  }

  componentWillUnmount() {
    this.emitter.removeListener('AppRoot:TOKEN_EXPIRED', this.onLogoutEventListener);
    this.emitter.removeListener('Notification:AcceptedPrivacyPolicy', this.onAcceptedPrivacyPolicy);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.auth.user && nextProps.auth.user) {
      this.updateData(nextProps.auth.user.id);
      this.props.popToRoot();
    }

    if (!_.isEqual(this.props.patient.activePatient, nextProps.patient.activePatient)
      && !_.isEmpty(nextProps.patient.activePatient)) {
      this.updateData(nextProps.patient.activePatient.id);
    }
  }

  onAcceptedPrivacyPolicy = () => {
    this.setState({ acceptedPrivacyPolicy: true });
  };

  onLogoutEventListener = () => {
    this.props.popToRoot();
  };

  updateData = (user_id) => {
    this.props.getServeProvidersRequest({ user_id });
  };

  showProvider = (selectedProvider) => {
    if (!this.props.auth.user) {
      this.props.switchTab(3, true);
      return;
    }

    const routeToDetailScene = (is_existing) => {
      this.props.routeScene(
        'ProviderDetailScene',
        {
          selectedProvider: {
            ...selectedProvider,
            is_existing,
          }
        },
        {
          navigatorStyle: {
            navBarHidden: true,
            tabBarHidden: false
          }
        }
      );
    };

    if (selectedProvider.is_existing !== null
      || _.isEmpty(_.get(selectedProvider.practice, 'appointment_types', []))
    ) {
      routeToDetailScene(selectedProvider.is_existing);
    } else {
      Alert.alert(
        'OpenMed',
        I18n.t('areYouExistingPatient'),
        [
          {
            text: I18n.t('no'),
            onPress: () => routeToDetailScene(false)
          },
          {
            text: I18n.t('yes'),
            onPress: () => routeToDetailScene(true)
          }
        ]
      );
    }
  };

  hasInsuranceDetails = () => {
    const { activePatient } = this.props.patient;
    const { insurances: patientInsurances } = activePatient;
    const { insurances } = this.props.insurance;

    if (patientInsurances) {
      const validInsurances = patientInsurances.filter((insurance) => {
        const insuranceData = insurance || {};
        const selectedInsurance = _.find(insurances, { id: insuranceData.insurance_provider_id });
        const plans = selectedInsurance ? selectedInsurance.insurance_plans : [];
        const plan = _.find(plans, { id: insuranceData.insurance_plan_id });

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
  }

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

    this.props.routeScene(
      'AppointmentPreviewScene',
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

  makeAppointment = (provider) => {
    const {
      resetAppointment,
      showLightBox,
      routeScene,
      patient,
      switchTab,
    } = this.props;

    const doRequestAppointment = () => {
      resetAppointment({
        time: undefined,
        providers: [provider]
      });

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

    if (_.isEmpty(patient.activePatient.birthday)) {
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
      const selectedInsurance = _.find(insurances, { id: insuranceData.insurance_provider_id });
      const plans = selectedInsurance ? selectedInsurance.insurance_plans : [];
      const plan = _.find(plans, { id: insuranceData.insurance_plan_id });

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

  sendAppointmentRequest = () => {
    const { providers, appointmentTime } = this.props.appointment;

    let apptTypes = _.get(providers[0].practice, 'appointment_types', []);
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

  onSearch = () => {
    this.props.switchTab(1);
    this.emitter.emit('AppRoot:LOAD_SEARCH', true);
  };

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

  handlePressFilterButton = () => {
    const { showLightBox } = this.props;

    showLightBox('ProviderFilterDialog', null,
      { backgroundColor: 'rgba(0, 0, 0, 0.3)',
        tapBackgroundToDismiss: true,
        animationIn: 'slideLeftIn',
        animationOut: 'slideRightOut'
      });
  };

  renderContent = () => {
    const { isNavBarExpanded, isChecking } = this.state;
    const { serveProviders } = this.props.provider;
    const { activePatient: patient } = this.props.patient;
    const { user } = this.props.auth;
    const { region } = this.props.location;
    const { patients } = this.props.patient;

    const getAvatar = (p) => {
      return p.provider.photo_url
        ? { uri: p.provider.photo_url }
        : null;
    };

    return (
      <View style={styles.container}>
        <ProviderListTopNav
          activePatient={patient}
          onFilter={this.handlePressFilterButton}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
        />
        <View style={styles.topView}>
          <AdvancedSearchBar
            width={WINDOW_WIDTH - 20}
            height={40}
            text={I18n.t('findMyProvider')}
            style={styles.searchbar}
            textStyle={{ fontSize: 11 }}
            onPress={() => this.onSearch()}
          />
        </View>
        <FlatList
          data={serveProviders}
          style={styles.providers}
          keyExtractor={(item, index) => `#${index}`}
          refreshing={false}
          onRefresh={() => this.updateData(patient.id)}
          ListHeaderComponent={() =>
            <SFBold allowFontScaling={false} style={styles.listTitle}>
              {I18n.t('favoriteProviders').toUpperCase()}
            </SFBold>
          }
          renderItem={({ item }) => {
            return (
              <FavoriteProviderListItem
                item={item}
                avatar={getAvatar(item)}
                region={region}
                user={user}
                onShowProvider={this.showProvider}
                onMakeAppointment={this.makeAppointment}
                onDirectBooking={this.doDirectBooking}
              />
            );
          }}
        />
        <Notification style={styles.notification} />
        <PatientListModal
          ref={ref => this.patientListModal = ref}
          patients={patients}
          onAddPatient={this.onAddPatient}
          onPatientSelected={this.onPatientSelected}
          onBackgroundClicked={this.expandNavBar}
        />
        {isChecking && <Loading />}
      </View>
    );
  };

  renderWelcomeScene = () => {
    if (!this.state.acceptedPrivacyPolicy) {
      return (
        <PrivacyContainer
          onAccept={() => this.emitter.emit('Notification:AcceptedPrivacyPolicy')}
        />
      );
    }

    return (
      <WelcomeContainer
        routeScene={this.props.routeScene}
      />
    );
  };

  render() {
    const { auth } = this.props;
    if (!auth.user) {
      return this.renderWelcomeScene();
    }

    return this.renderContent();
  }
}

FavoriteContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  provider: PropTypes.object.isRequired,
  insurance: PropTypes.object.isRequired,
  appointment: PropTypes.object.isRequired,
  setCurrentPatient: PropTypes.func.isRequired,
  resetAppointment: PropTypes.func.isRequired,
  getServeProvidersRequest: PropTypes.func.isRequired,
};

export default compose(
  connectAuth(),
  connectAppointment(),
  connectPatient(),
  connectLocation(),
  connectProvider(),
  connectInsurance(),
)(FavoriteContainer);

