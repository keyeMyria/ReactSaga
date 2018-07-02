// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  TouchableWithoutFeedback
} from 'react-native';
import I18n from 'react-native-i18n';
import {
  TEXT,
  WHITE,
  PRIMARY_COLOR,
  PURPLISH_GREY,
  BACKGROUND_GRAY,
  DARK_GRAY,
  PLACEHOLDER
} from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import {
  connectPatient,
  connectAppointment,
  connectAuth,
  connectInsurance,
  connectProvider
} from 'AppRedux';
import { SFRegular } from 'AppFonts';
import { dismissKeyboard, promisify, AlertMessage } from 'AppUtilities';
import {
  NormalButton,
  Avatar,
  ProviderDetailTopNav,
  PatientListModal,
  Loading,
  MarkerInfo
} from 'AppComponents';
import { compose } from 'recompose';
import MapView from 'react-native-maps';
import moment from 'moment';
import _ from 'lodash';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment_timezone from 'moment-timezone';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_GRAY
  },
  noteInput: {
    color: PLACEHOLDER,
    textAlignVertical: 'top',
    fontSize: 12,
    justifyContent: 'flex-start'
  },
  bookButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0
  },
  bookButtonTextStyle: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  },
  panel: {
    height: 80,
    marginTop: 26,
    backgroundColor: WHITE,
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderRadius: 5,
    overflow: 'hidden'
  },
  content: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20
  },
  avatar: {
    marginHorizontal: 10
  },
  info: {
    flex: 1,
    marginLeft: 10
  },
  textName: {
    color: PURPLISH_GREY,
    fontSize: 16
  },
  textAddress: {
    color: PURPLISH_GREY,
    fontSize: 12
  },
  details: {
    backgroundColor: WHITE,
    borderRadius: 5,
    overflow: 'hidden'
  },
  mapView: {
    width: WINDOW_WIDTH,
    height: 152
  },
  appointments: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 31,
    paddingBottom: 20
  },
  keyItem: {
    alignItems: 'center',
    maxWidth: (WINDOW_WIDTH - 90) / 3
  },
  keyIcon: {
    width: 21,
    height: 23,
    resizeMode: 'contain'
  },
  keyTitle: {
    marginTop: 13,
    fontSize: 12,
    color: PURPLISH_GREY,
    minWidth: 75,
    textAlign: 'center'
  }
});

export class AppointmentPreviewContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isNavBarExpanded: false,
      isChecking: false,
      note: ''
    };
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
  };

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

  sendAppointmentRequest = () => {
    const { appointmentDetails, selectedProvider, insurance } = this.props;
    const {
      directBookingTime,
      bookingTime,
      appointmentType
    } = appointmentDetails;

    const { createAppointment, replaceCurrentScene, switchTab } = this.props;
    const { filter } = this.props.provider;
    const { activePatient } = this.props.patient;

    if (_.isEmpty(activePatient.birthday)) {
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
      return;
    }

    const providers = [selectedProvider.provider];
    const popularSpecialties = insurance.specialties.popular_specialties;

    let { specialtyId } = filter;
    if (!specialtyId) {
      const providersSpecialties = _.map(providers, 'specialties');
      const specialties = _.intersectionBy(...providersSpecialties, 'id');
      specialtyId = specialties.length
        ? specialties[0].id
        : popularSpecialties.length > 0
          ? popularSpecialties[0].id
          : undefined;
    }

    // Set appointment type
    const typeId = _.get(appointmentType, 'id');

    const appointment = {
      appointment_to_practices: [{
        provider_id: selectedProvider.provider.id,
        practice_id: selectedProvider.practice.id,
        appointment_type_id: typeId
      }],
      reason: this.state.note || ' ',
      user_id: activePatient.id,
    };

    // Set specialty id
    if (specialtyId) {
      appointment.specialty_id = specialtyId;
    }

    // Set direct booking
    if (directBookingTime) {
      appointment.is_direct_booking = true;
      appointment.desired_time = directBookingTime;
    }

    // Set booking time
    if (bookingTime) {
      appointment.desired_time = bookingTime;
    }

    this.setState({ isChecking: true });

    promisify(createAppointment, { appointment })
      .then((appt) => {
        replaceCurrentScene(
          'AppointmentDetailScene',
          {
            fromCalendar: false,
            selectedAppointment: {
              ...appt.appointment_to_practices[0],
              providers: [{ ...selectedProvider.provider, practice: selectedProvider.practice }]
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

  setPaymentMethod() {
    const { routeScene, selectedProvider } = this.props;
    routeScene(
      'PaymentMethodScene',
      {
        isDirect: true,
        onPaymentDone: this.onPaymentDone,
        first_name: selectedProvider.provider.first_name,
        cancellationMessage: selectedProvider.practice.cancellation_message
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        }
      }
    );
  }

  checkCardRequest = () => {
    const { selectedProvider } = this.props;
    if (selectedProvider.provider.request_credit_card) {
      this.setPaymentMethod();
    } else {
      this.requestAppointment();
    }
  }

  onPaymentDone = () => {
    this.requestAppointment();
  }

  requestAppointment = () => {
    const {
      switchTab,
      auth,
      routeScene,
      patient
    } = this.props;

    if (!auth.user) {
      switchTab(3, true);
    } else if (_.isEmpty(patient.activePatient.birthday)) {
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

      /!*eslint-disable*!/
      const alertMessage = selectedInsurance && plan
        ? I18n.t('hasInsuranceChanged', { insurance: selectedInsurance.name, insurance_plan: plan.name, member_id: insuranceData.group_id ? insuranceData.group_id : '-', subscriber_id: insuranceData.subscriber_id ? insuranceData.subscriber_id : '-' })
        : insuranceData.medicaid
          ? I18n.t('hasInsuranceMedicareChanged', { insurance: I18n.t('medicaid'), member_id: insuranceData.group_id ? insuranceData.group_id : '-', subscriber_id: insuranceData.subscriber_id ? insuranceData.subscriber_id : '-' })
          : insuranceData.medicare
            ? I18n.t('hasInsuranceMedicareChanged', { insurance: I18n.t('medicare'), member_id: insuranceData.group_id ? insuranceData.group_id : '-', subscriber_id: insuranceData.subscriber_id ? insuranceData.subscriber_id : '-' })
            : I18n.t('hasInsuranceSelfPayingChanged');
      /!*eslint-disable*!/

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
            onPress: () => this.sendAppointmentRequest()
          }
        ]
      );
    } else {
      this.sendAppointmentRequest();
    }
  };

  renderProviderDetails = () => {
    const { selectedProvider } = this.props;

    const getAvatar = (p) => {
      return p.photo_url ? { uri: p.photo_url } : null;
    };

    return (
      <View style={styles.row}>
        <Avatar
          source={getAvatar(selectedProvider.provider)}
          placeholder={selectedProvider.provider}
          style={styles.avatar}
          size={70}
        />
        <View style={styles.info}>
          <SFRegular allowFontScaling={false} style={styles.textName}>
            {selectedProvider.provider.full_name}
          </SFRegular>
          <SFRegular
            allowFontScaling={false}
            style={[styles.textAddress, { marginTop: 12 }]}
            numberOfLines={1}
          >
            {selectedProvider.practice.address}
          </SFRegular>
          <SFRegular
            allowFontScaling={false}
            style={styles.textAddress}
            numberOfLines={1}
          >
            {[selectedProvider.practice.address_2,
              selectedProvider.practice.address_3].filter(v => !!v).join(', ')}
            {` ${selectedProvider.practice.zip}`}
          </SFRegular>
        </View>
      </View>
    );
  };

  getAppointmentTime = (isTime = false) => {
    const { appointmentDetails, selectedProvider } = this.props;

    const timezone = _.get(selectedProvider.practice, 'timezone.code', '');

    const {
      isFirstAvailable,
      directBookingTime,
      bookingTime
    } = appointmentDetails;

    if (isFirstAvailable) {
      return I18n.t('firstAvailable');
    }

    const desiredTime = !bookingTime
      ? directBookingTime
      : bookingTime
    const isoString = moment.unix(desiredTime);

    if (isTime) {
      return moment_timezone(isoString).tz(timezone).format('hh:mm A');
    }
    return moment_timezone(isoString).tz(timezone).format('dddd, MMM D');
  };

  renderAppointmentDetails = () => {
    const { appointmentDetails } = this.props;
    const { appointmentType } = appointmentDetails;

    return (
      <View style={styles.appointments}>
        <View style={styles.keyItem}>
          <Image
            source={require('img/icons/ic_dmac.png')}
            style={styles.keyIcon}
          />
          <SFRegular style={styles.keyTitle}>
            {_.get(appointmentType, 'title', 'Consult')}
          </SFRegular>
        </View>
        <View style={styles.keyItem}>
          <Image
            source={require('img/icons/ic_calendar.png')}
            style={styles.keyIcon}
          />
          <SFRegular style={styles.keyTitle}>
            {this.getAppointmentTime()}
          </SFRegular>
        </View>
        <View style={styles.keyItem}>
          <Image
            source={require('img/icons/ic_clock.png')}
            style={styles.keyIcon}
          />
          <SFRegular style={styles.keyTitle}>
            {this.getAppointmentTime(true)}
          </SFRegular>
        </View>
      </View>
    );
  };

  render() {
    const { isChecking, isNavBarExpanded } = this.state;
    const { routeBack, patient, selectedProvider, appointmentDetails } = this.props;

    const initRegion = {
      latitude: selectedProvider.practice.latitude,
      longitude: selectedProvider.practice.longitude,
      latitudeDelta: 0.00322,
      longitudeDelta: 0.00121
    };

    return (
      <View style={styles.container}>
        <ProviderDetailTopNav
          activePatient={patient.activePatient}
          onBack={routeBack}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
        />
        <KeyboardAwareScrollView style={styles.content}>
          <View style={styles.details}>
            {this.renderProviderDetails()}
            {this.renderAppointmentDetails()}
            <MapView
              ref={ref => this.map = ref}
              style={styles.mapView}
              region={initRegion}
              showsMyLocationButton={false}
              rotateEnabled={false}
              showsCompass={false}
            >
              <MarkerInfo region={initRegion} text={selectedProvider.practice.address} />
            </MapView>
          </View>
          <TouchableWithoutFeedback onPress={() => this._reasonField.focus()}>
            <View style={styles.panel}>
              <TextInput
                ref={ref => this._reasonField = ref}
                placeholder={I18n.t('typeTheReasonForVisitNotRequired')}
                value={this.state.note}
                onChangeText={text => this.setState({ note: text })}
                placeholderTextColor={TEXT}
                style={styles.noteInput}
                underlineColorAndroid={'transparent'}
                onSubmitEditing={dismissKeyboard}
                numberOfLines={3}
                returnKeyType={'done'}
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
        <NormalButton
          text={appointmentDetails.directBookingTime
            ? I18n.t('book').toUpperCase()
            : I18n.t('requestAppointment').toUpperCase()
          }
          style={styles.bookButton}
          textStyle={styles.bookButtonTextStyle}
          pressed={true}
          borderRadius={0}
          onPress={this.checkCardRequest}
        />
        <PatientListModal
          ref={ref => this.patientListModal = ref}
          patients={patient.patients}
          onAddPatient={this.onAddPatient}
          onPatientSelected={this.onPatientSelected}
          onBackgroundClicked={this.expandNavBar}
        />
        {isChecking && <Loading />}
      </View>
    );
  }
}

AppointmentPreviewContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  replaceCurrentScene: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  selectedProvider: PropTypes.object.isRequired,
  appointmentDetails: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  insurance: PropTypes.object.isRequired,
  provider: PropTypes.object.isRequired,
  createAppointment: PropTypes.func.isRequired,
};

export default compose(
  connectAuth(),
  connectInsurance(),
  connectPatient(),
  connectAppointment(),
  connectProvider()
)(AppointmentPreviewContainer);
