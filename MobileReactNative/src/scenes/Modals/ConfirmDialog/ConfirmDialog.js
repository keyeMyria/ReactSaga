// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  Alert,
  TextInput,
  Platform
} from 'react-native';
import I18n from 'react-native-i18n';
import {
  TEXT,
  BORDERLINE,
  BACKGROUND_GRAY,
  BACKGROUND,
  TINT,
  GREEN,
  SNOW,
  BORDER,
  FIRE,
  WHITE,
  DARK_GRAY,
  PRIMARY_COLOR,
  PLACEHOLDER
} from 'AppColors';
import { NAVBAR_HEIGHT, WINDOW_WIDTH } from 'AppConstants';
import { SFMedium, SFRegular } from 'AppFonts';
import {
  Panel,
  NormalButton,
  Avatar,
  Loading,
  RequestConfirmTopNav,
  PatientListModal,
  CheckButton
} from 'AppComponents';
import {
  connectAppointment,
  connectAuth,
  connectInsurance,
  connectProvider,
  connectPatient,
  connectLocation
} from 'AppRedux';
import {
  AlertMessage,
  promisify,
  dismissKeyboard
} from 'AppUtilities';
import moment from 'moment';
import { filter } from 'lodash';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Swipeout from 'react-native-swipeout';
import { compose } from 'recompose';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BACKGROUND_GRAY
  },
  body: {
    flex: 1,
    marginBottom: 60,
    marginTop: 10
  },
  containerStyle: {
    paddingBottom: 10
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    height: NAVBAR_HEIGHT,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: WINDOW_WIDTH,
    zIndex: 1
  },
  navButton: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 10 : 0,
    justifyContent: 'center',
    height: NAVBAR_HEIGHT
  },
  navButtonText: {
    fontSize: 12,
    color: TINT,
    marginLeft: 10
  },
  panel: {
    alignItems: 'center',
    marginBottom: 20
  },
  label: {
    color: TEXT,
    textAlign: 'center',
    fontSize: 16
  },
  firstAvailableLabel: {
    color: PLACEHOLDER,
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 10
  },
  patientAvatar: {
    marginVertical: 25,
    backgroundColor: 'transparent'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: WINDOW_WIDTH - 20,
    borderTopColor: BORDERLINE,
    borderTopWidth: 1,
    paddingVertical: 20,
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
    color: TEXT,
    fontSize: 16,
    marginBottom: 3
  },
  textAddress: {
    color: TEXT,
    fontSize: 12
  },
  noteInput: {
    color: PLACEHOLDER,
    width: WINDOW_WIDTH - 10 * 2,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
    textAlignVertical: 'top',
    height: 80,
    fontSize: 12
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
  timeRow: {
    width: WINDOW_WIDTH - 20 * 4,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  timeBlock: {
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  timeText: {
  },
  rowSlots: {
    width: WINDOW_WIDTH - 10 * 2,
    marginTop: 10
  },
  directSlots: {
    paddingVertical: 10
  },
  rowBottom: {
    marginTop: 10
  },
  directTimeBlock: {
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER,
    width: 80,
    height: 60
  },
  blockSelected: {
    backgroundColor: GREEN
  },
  textSelected: {
    color: SNOW
  },
  textHour: {
    color: TINT
  },
  textDay: {
    color: TEXT,
    marginTop: 5
  }
});

export class ConfirmDialog extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      appointmentTime: this.props.appointment.appointmentTime,
      isChecking: false,
      isNavBarExpanded: false,
      note: ''
    };
  }

  onConfirm = () => {
    const { updateAppointment, appointment, patient } = this.props;
    const { note } = this.state;

    this.setState({ isChecking: true });

    promisify(updateAppointment, {
      appointment_request_id: appointment.appointment.id,
      reason: note,
      patientId: patient.activePatient.id
    }).then(() => AlertMessage.showMessage(null, I18n.t('thanks_for_updating')))
      .catch(error => {
        if (error.number) {
          this.showError(error.message, error.number);
        } else {
          AlertMessage.fromRequest(error);
        }
      })
      // .catch(() => AlertMessage.showMessage(null, I18n.t('thanks_for_updating')))
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

  onCancel = () => {
    const { setProviders, routeBack, switchTab } = this.props;
    setProviders({ providers: [] });
    routeBack();
    switchTab(2, true);
  };

  removeProvider = (provider) => {
    const { appointment, setProviders } = this.props;
    const providers = filter(appointment.providers, oldProvider => oldProvider.id !== provider.id);
    setProviders({ providers });
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

  render() {
    const { activePatient: patient, patients } = this.props.patient;
    const { providers, appointment: selectedAppointment } = this.props.appointment;
    const { isChecking, isNavBarExpanded } = this.state;

    const getAvatar = (provider) => {
      return provider.photo_url ? { uri: provider.photo_url } : null;
    };

    let confirmMessage = I18n.t('appointment_confirmed_with');

    if (selectedAppointment
      && selectedAppointment.appointment_to_practices
      && selectedAppointment.appointment_to_practices.length >= 1
    ) {
      const firstAppt = selectedAppointment.appointment_to_practices[0];
      const desiredTime = firstAppt.desired_time;
      if (desiredTime === 0) {
        confirmMessage = I18n.t('appointment_confirmed_for', {
          date: I18n.t('firstAvailableTime')
        });
      } else {
        confirmMessage = I18n.t('appointment_confirmed_at', {
          date: moment.unix(desiredTime).format('MM/DD/YY hh:mm A')
        });
      }
    }

    return (
      <View style={styles.container}>
        <RequestConfirmTopNav
          activePatient={patient}
          onBack={this.onCancel}
          onDone={this.onCancel}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
        />
        <KeyboardAwareScrollView style={styles.body} contentContainerStyle={styles.containerStyle}>
          <Panel style={styles.panel}>
            <CheckButton
              size={80}
              style={styles.patientAvatar}
            />
            <SFMedium allowFontScaling={false} style={styles.label}>
              {I18n.t('congrats')},
            </SFMedium>
            <SFMedium
              allowFontScaling={false}
              style={[styles.label, { marginBottom: 10 }]}
            >
              {confirmMessage}
            </SFMedium>
            {false &&
              <SFMedium allowFontScaling={false} style={styles.firstAvailableLabel}>
                {I18n.t('firstAvailableAppointmentWith')}
              </SFMedium>
            }
            {providers.map((provider, key) => (
              <Swipeout
                autoClose
                backgroundColor={'#fff'}
                key={key}
                right={providers.length < 2
                  ? null
                  : [{
                    text: I18n.t('remove'),
                    backgroundColor: FIRE,
                    onPress: () => this.removeProvider(provider)
                  }]}
              >
                <View style={styles.row}>
                  <Avatar
                    source={getAvatar(provider)}
                    placeholder={provider}
                    style={styles.avatar}
                  />
                  <View style={styles.info}>
                    <SFMedium allowFontScaling={false} style={styles.textName}>
                      {provider.full_name}
                    </SFMedium>
                    <SFRegular
                      allowFontScaling={false}
                      style={styles.textAddress}
                      numberOfLines={2}
                    >
                      {[provider.practice.address,
                        provider.practice.city].filter(v => !!v).join(', ')}
                    </SFRegular>
                    <SFRegular
                      allowFontScaling={false}
                      style={styles.textAddress}
                      numberOfLines={2}
                    >
                      {[provider.practice.region,
                        provider.practice.zip].filter(v => !!v).join(', ')}
                    </SFRegular>
                  </View>
                </View>
              </Swipeout>
            ))}
          </Panel>
          <Panel style={styles.panel}>
            <TextInput
              placeholder={I18n.t('typeTheReasonForVisitNotRequired')}
              value={this.state.note}
              onChangeText={text => this.setState({ note: text })}
              placeholderTextColor={TEXT}
              style={styles.noteInput}
              underlineColorAndroid={'transparent'}
              onSubmitEditing={dismissKeyboard}
              returnKeyType={'done'}
            />
          </Panel>
        </KeyboardAwareScrollView>
        <NormalButton
          text={I18n.t('update_request').toUpperCase()}
          style={styles.bookButton}
          textStyle={styles.bookButtonTextStyle}
          pressed={true}
          borderRadius={0}
          onPress={() => this.onConfirm()}
        />
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
  }
}

ConfirmDialog.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  appointment: PropTypes.object.isRequired,
  createAppointment: PropTypes.func.isRequired,
  resetAppointment: PropTypes.func.isRequired,
  setProviders: PropTypes.func.isRequired,
  provider: PropTypes.object.isRequired,
  insurance: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  resendEmail: PropTypes.func.isRequired,
  resendPhone: PropTypes.func.isRequired,
  setCurrentPatient: PropTypes.func.isRequired,
  directBooking: PropTypes.bool,
};

export default compose(
  connectAuth(),
  connectLocation(),
  connectPatient(),
  connectInsurance(),
  connectProvider(),
  connectAppointment()
)(ConfirmDialog);
