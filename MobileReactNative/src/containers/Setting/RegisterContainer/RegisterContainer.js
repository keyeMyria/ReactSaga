// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform, Alert
} from 'react-native';
import {
  AlertMessage,
  dismissKeyboard,
  promisify,
  withEmitter,
  requestCameraAccess
} from 'AppUtilities';
import { WINDOW_WIDTH } from 'AppConstants';
import { OMTextInput, RoundedButton, Loading, QRScanTopNav } from 'AppComponents';
import { SFMedium, SFRegular, SFBold } from 'AppFonts';
import { connectAuth } from 'AppRedux';
import I18n from 'react-native-i18n';
import { WHITE, TINT, GREEN, FIRE, TEXT, DARK_GRAY, PRIMARY_COLOR } from 'AppColors';
import Icon from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import config from 'react-native-config';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DeviceInfo from 'react-native-device-info';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  containerStyle: {
    paddingBottom: 20
  },
  form: {
    marginTop: 10,
    marginBottom: 20
  },
  loginBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center'
  },
  register: {
    fontSize: 12,
    color: TINT,
    marginLeft: 5
  },
  noAccount: {
    fontSize: 12,
    color: DARK_GRAY
  },
  inputField: {
    fontSize: 14,
    fontFamily: 'SFUIText-Regular'
  },
  termView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  agreement: {
    marginLeft: 10
  },
  termLink: {
    color: TINT
  },
  checkBoxAgreement: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

@withEmitter('emitter')
class RegisterContainer extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: DeviceInfo.getPhoneNumber(),
      errorEmail: '',
      errorPassword: '',
      errorLastName: '',
      errorPhoneNumber: '',
      referralCode: this.props.promoCode,
      isSending: false
    };
  }

  componentWillMount() {
    this.emitter.on('routeBack:RegisterScene', this.onBackButtonHandler);
  }

  componentWillUnmount() {
    this.emitter.removeListener('routeBack:RegisterScene', this.onBackButtonHandler);
  }

  onBackButtonHandler = () => this.props.routeBack();

  handlePressRegister = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      agree,
      referralCode
    } = this.state;

    const { registerUser, auth, popToRoot } = this.props;

    dismissKeyboard();

    if (!agree) {
      return;
    }

    // eslint-disable-next-line max-len
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      // eslint-disable-next-line max-len
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const rePhone = /[\d]{10}/;
      // eslint-disable-next-line max-len
      const errorEmail = !email ? I18n.t('errorEmailRequired') : !re.test(email) ? I18n.t('errorEmailFormat') : '';
      const errorPassword = !password ? I18n.t('errorPasswordRequired') : '';
      const errorFirstName = !firstName ? I18n.t('errorFirstNameRequired') : '';
      const errorLastName = !lastName ? I18n.t('errorLastNameRequired') : '';
      // eslint-disable-next-line max-len
      const errorPhoneNumber = !phoneNumber ? I18n.t('errorPhoneNumberRequired') : !rePhone.test(phoneNumber) ? I18n.t('errorPhoneNumberFormat') : '';
      this.setState({
        errorEmail,
        errorPassword,
        errorFirstName,
        errorLastName,
        errorPhoneNumber
      });
      return;
    }

    this.setState({ isSending: true });

    const user = {
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      password_confirm: password,
      phone: phoneNumber,
      device_token: auth.device_token,
      device_type: Platform.OS,
      terms: true,
      code: referralCode
    };

    promisify(registerUser, user)
      .then(() => popToRoot())
      .catch(e => AlertMessage.fromRequest(e))
      .finally(() => this.setState({ isSending: false }));
  };

  onChangeFistName = (text) => {
    const { firstName } = this.state;
    const errorFirstName = !firstName || firstName.length < 1
      ? I18n.t('errorFirstNameRequired')
      : '';
    this.setState({ firstName: text, errorFirstName });
  };

  onChangeLastName = (text) => {
    const { lastName } = this.state;
    const errorLastName = !lastName || lastName.length < 1
      ? I18n.t('errorLastNameRequired')
      : '';
    this.setState({ lastName: text, errorLastName });
  };

  onChangeEmail = (text) => {
    const { email } = this.state;
    // eslint-disable-next-line max-len
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // eslint-disable-next-line max-len
    const errorEmail = !email ? I18n.t('errorEmailRequired') : !re.test(email) ? I18n.t('errorEmailFormat') : '';
    this.setState({ email: text, errorEmail });
  };

  onChangePhoneNumber = (text) => {
    const { phoneNumber } = this.state;
    const rePhone = /[\d]{9}/;
    // eslint-disable-next-line max-len
    const errorPhoneNumber = !phoneNumber ? I18n.t('errorPhoneNumberRequired') : !rePhone.test(phoneNumber) ? I18n.t('errorPhoneNumberFormat') : '';
    this.setState({ phoneNumber: text, errorPhoneNumber });
  };

  onChangePassword = (text) => {
    const { password } = this.state;
    const errorPassword = !password || password.length < 5
      ? I18n.t('errorPasswordRequired')
      : '';
    this.setState({ password: text, errorPassword });
  };

  openTerms = () => {
    Linking.openURL(config.TERM_URL)
      .catch(err => console.error('An error occurred', err));
  };

  signIn = () => {
    const { fromHomeScreen, routeScene, routeBack } = this.props;

    if (fromHomeScreen) {
      routeScene('LoginScene', { fromHomeScreen: false }, {
        title: I18n.t('signIn'),
        backButtonTitle: '',
        navigatorStyle: {
          navBarHidden: false,
          tabBarHidden: true,
          navBarBackgroundColor: WHITE,
          navBarTextColor: DARK_GRAY,
          navBarButtonColor: PRIMARY_COLOR,
        }
      });
    } else {
      routeBack();
    }
  };

  signUpWithQRCode = () => {
    const { routeScene } = this.props;
    requestCameraAccess('camera', I18n.t('accessCamera'))
      .then(() => {
        routeScene('QRScanScene', null, {
          title: I18n.t('qrCode'),
          backButtonTitle: '',
          navigatorStyle: {
            navBarHidden: true,
            tabBarHidden: true
          }
        });
      })
      .catch(() => {
        this.openModal();
      });
  };

  openModal = () => {
    const { showLightBox } = this.props;
    showLightBox(
      'QRCodeEnterDialog',
      {
        onCodeEnterSuccess: this.onCodeEnterSuccess,
        onPressCancel: this.onPressCancel
      },
      {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        tapBackgroundToDismiss: false,
        animationIn: 'slideUp',
        animationOut: 'slideDown',
      }
    );
  }

  checkValidQRCode = (code) => {
    const { dismissLightBox, routeScene, getPatientInviteCode } = this.props;
    promisify(getPatientInviteCode, {
      code
    }).then(() => {
      dismissLightBox();
      this.setState({ isSending: false });
      routeScene('QRScanPasswordScene', { code }, {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: true,
          animationIn: 'slideUp',
          animationOut: 'slideDown',
        }
      });
    })
      .catch((error) => {
        dismissLightBox();
        this.setState({ isSending: false });
        Alert.alert(
          'OpenMed',
          error,
          [
            {
              text: I18n.t('tryAgain'),
              onPress: () => {
                this.openModal();
              }
            }
          ]
        );
      })
      .finally();
  }

  onCodeEnterSuccess = (code) => {
    this.setState({ isSending: true });
    this.checkValidQRCode(code);
  }

  onPressCancel = () => {
    const { dismissLightBox } = this.props;
    dismissLightBox();
  }

  render() {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      referralCode,
      errorFirstName,
      errorLastName,
      errorEmail,
      errorPhoneNumber,
      errorPassword,
      showPassword,
      isSending,
    } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <QRScanTopNav
          onBack={this.props.routeBack}
          title={'Register'}
          onPress={() => this.signUpWithQRCode()}
          rightButtonLabel={'QR Code'}
        />
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.containerStyle}
        >
          <View style={styles.form}>
            <OMTextInput
              label={I18n.t('firstName')}
              textInputStyle={styles.inputField}
              placeholder={I18n.t('firstName')}
              error={errorFirstName}
              autoCorrect={false}
              autoCapitalize={'words'}
              onChangeText={text => this.onChangeFistName(text)}
              onSubmitEditing={() => {
                this.lastNameField.focus();
                this.setState({
                  errorFirstName: !firstName || firstName.length < 1
                    ? I18n.t('errorFirstNameRequired')
                    : ''
                });
              }}
              value={firstName}
              icon={!firstName ? null : !errorFirstName
                ? <Icon size={40} name={'ios-checkmark-outline'} color={GREEN} />
                : <EvilIcons size={25} name={'exclamation'} color={FIRE} />}
            />
            <OMTextInput
              ref={ref => this.lastNameField = ref}
              textInputStyle={styles.inputField}
              label={I18n.t('lastName')}
              placeholder={I18n.t('lastName')}
              error={errorLastName}
              autoCorrect={false}
              autoCapitalize={'words'}
              onChangeText={text => this.onChangeLastName(text)}
              onSubmitEditing={() => {
                this.emailField.focus();
                this.setState({
                  errorLastName: !lastName || lastName.length < 1
                    ? I18n.t('errorLastNameRequired')
                    : ''
                });
              }}
              value={lastName}
              icon={!lastName ? null : !errorLastName
                ? <Icon size={40} name={'ios-checkmark-outline'} color={GREEN} />
                : <EvilIcons size={25} name={'exclamation'} color={FIRE} />}
            />
            <OMTextInput
              ref={ref => this.emailField = ref}
              textInputStyle={styles.inputField}
              label={I18n.t('email')}
              placeholder={'Your-email@domain.com'}
              error={errorEmail}
              keyboardType={'email-address'}
              autoCorrect={false}
              autoCapitalize={'none'}
              onChangeText={text => this.onChangeEmail(text)}
              onSubmitEditing={() => {
                this.phoneNumberField.focus();
                this.setState({
                  errorEmail: !email ? I18n.t('errorEmailRequired') : ''
                });
              }}
              value={email}
              icon={!email ? null : !errorEmail
                ? <Icon size={40} name={'ios-checkmark-outline'} color={GREEN} />
                : <EvilIcons size={25} name={'exclamation'} color={FIRE} />}
            />
            <OMTextInput
              ref={ref => this.phoneNumberField = ref}
              textInputStyle={styles.inputField}
              label={I18n.t('phoneNumber')}
              placeholder={I18n.t('phoneNumber')}
              error={errorPhoneNumber}
              keyboardType={'phone-pad'}
              autoCorrect={false}
              autoCapitalize={'none'}
              onChangeText={text => this.onChangePhoneNumber(text)}
              onSubmitEditing={() => {
                this.passwordField.focus();
                this.setState({
                  errorPhoneNumber: !phoneNumber ? I18n.t('errorPhoneNumberRequired') : ''
                });
              }}
              value={phoneNumber}
              icon={!phoneNumber ? null : !errorPhoneNumber
                ? <Icon size={40} name={'ios-checkmark-outline'} color={GREEN} />
                : <EvilIcons size={25} name={'exclamation'} color={FIRE} />}
            />
            <OMTextInput
              textInputStyle={styles.inputField}
              label={I18n.t('password')}
              ref={ref => this.passwordField = ref}
              autoCorrect={false}
              autoCapitalize={'none'}
              secureTextEntry={!showPassword}
              placeholder={I18n.t('password')}
              onChangeText={text => this.onChangePassword(text)}
              onSubmitEditing={() => {
                this.setState({
                  errorPassword: !password || password.length < 2
                    ? I18n.t('errorPasswordRequired')
                    : ''
                });
              }}
              value={password}
              error={errorPassword}
              icon={!password
                ? null
                : <Icon
                  size={30}
                  name={showPassword ? 'ios-eye-off' : 'ios-eye'}
                  color={TEXT}
                  onPress={() => this.setState({ showPassword: !showPassword })}
                />}
            />
            <OMTextInput
              ref={ref => this.referralField = ref}
              textInputStyle={[styles.inputField]}
              label={I18n.t('referralCode')}
              placeholder={I18n.t('referralCode')}
              keyboardType={'default'}
              autoCorrect={false}
              autoCapitalize={'none'}
              onChangeText={text => this.setState({ referralCode: text })}
              value={referralCode}
            />
          </View>
          <View style={styles.termView}>
            <TouchableOpacity
              style={styles.checkBoxAgreement}
              onPress={() => this.setState({ agree: !this.state.agree })}
            >
              <Icon
                name={this.state.agree ? 'md-checkbox-outline' : 'md-square-outline'}
                size={30}
                color={DARK_GRAY}
              />
              <SFRegular allowFontScaling={false} style={styles.agreement}>
                {I18n.t('agreement')}
              </SFRegular>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.openTerms}
            >
              <SFMedium allowFontScaling={false} style={styles.termLink}>
                {I18n.t('termAndConditions')}
              </SFMedium>
            </TouchableOpacity>
          </View>
          <RoundedButton
            primary={this.state.agree}
            width={WINDOW_WIDTH * 0.8}
            buttonStyle={{ alignSelf: 'center' }}
            onPress={() => this.handlePressRegister()}
          >
            {I18n.t('register')}
          </RoundedButton>
          <View style={styles.loginBlock}>
            <SFRegular allowFontScaling={false} style={styles.noAccount}>
              {I18n.t('alreadyHaveAnOpenMedAccount')}
            </SFRegular>
            <TouchableOpacity onPress={this.signIn}>
              <SFBold allowFontScaling={false} style={styles.register}>
                {I18n.t('signIn')}
              </SFBold>
            </TouchableOpacity>
          </View>
          {isSending && <Loading />}
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

RegisterContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  fromHomeScreen: PropTypes.bool.isRequired,
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.shape({}).isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired
};

export default connectAuth()(RegisterContainer);
