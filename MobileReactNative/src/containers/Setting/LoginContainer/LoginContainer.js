// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { AlertMessage, dismissKeyboard, promisify, withEmitter } from 'AppUtilities';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from 'AppConstants';
import { OMTextInput, Loading, NormalButton } from 'AppComponents';
import { connectAuth } from 'AppRedux';
import { SFBold, SFMedium, SFRegular } from 'AppFonts';
import I18n from 'react-native-i18n';
import {
  WHITE,
  TINT,
  GREEN,
  FIRE,
  TEXT,
  DARK_GRAY,
  PRIMARY_COLOR
} from 'AppColors';
import Icon from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    height: WINDOW_HEIGHT
  },
  form: {
    marginTop: 10,
    marginBottom: 20
  },
  forgotLink: {
    fontSize: 12,
    width: WINDOW_WIDTH * 0.9,
    paddingLeft: 30,
    color: TINT
  },
  loginBlock: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    width: WINDOW_WIDTH,
    paddingLeft: 10,
    paddingRight: 10
  },
  register: {
    fontSize: 12,
    color: TINT,
    marginLeft: 5
  },
  signInButton: {
    width: 120
  },
  signInButtonLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  },
  noAccount: {
    fontSize: 12,
    color: DARK_GRAY
  },
  inputField: {
    fontSize: 14,
    fontFamily: 'SFUIText-Regular'
  }
});

@withEmitter('emitter')
class LoginContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      showPassword: false,
      email: '',
      password: '',
      errorEmail: '',
      errorPassword: '',
      isChecking: false
    };
  }

  componentWillMount() {
    this.emitter.on('routeBack:LoginScene', this.onBackButtonHandler);
  }

  componentWillUnmount() {
    this.emitter.removeListener('routeBack:LoginScene', this.onBackButtonHandler);
  }

  onBackButtonHandler = () => this.props.routeBack();

  goToForgotPassword = () => {
    const { routeScene } = this.props;

    routeScene('ForgotPasswordScene', null, {
      title: I18n.t('forgotYourPassword'),
      backButtonTitle: '',
      navigatorStyle: {
        navBarHidden: false,
        tabBarHidden: true,
        navBarBackgroundColor: WHITE,
        navBarTextColor: DARK_GRAY,
        navBarButtonColor: PRIMARY_COLOR,
      }
    });
  };

  register = () => {
    const { routeScene, fromHomeScreen, routeBack } = this.props;

    if (fromHomeScreen) {
      routeScene('RegisterScene', { fromHomeScreen: false }, {
        title: I18n.t('register'),
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

  handlePressLogin = () => {
    const { email, password } = this.state;
    const { login, popToRoot, auth } = this.props;

    dismissKeyboard();

    if (!email || !password) {
      // eslint-disable-next-line max-len
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      // eslint-disable-next-line max-len
      const errorEmail = !email ? I18n.t('errorEmailRequired') : !re.test(email) ? I18n.t('errorEmailFormat') : '';
      // eslint-disable-next-line max-len
      const errorPassword = !password || password.length < 6 ? I18n.t('errorPasswordRequired') : '';
      this.setState({ errorEmail, errorPassword });
      return;
    }

    this.setState({ isChecking: true });

    const params = {
      email,
      password,
      device_token: auth.device_token,
      device_type: Platform.OS
    };

    promisify(login, params)
      .then(() => popToRoot())
      .catch(e => AlertMessage.fromRequest(e))
      .finally(() => this.setState({ isChecking: false }));
  };

  onChangePassword = (password) => {
    const errorPassword = !password || password.length < 6
      ? I18n.t('errorPasswordRequired')
      : '';
    this.setState({ password, errorPassword });
  };

  onChangeEmail = (email) => {
    // eslint-disable-next-line max-len
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // eslint-disable-next-line max-len
    const errorEmail = !email ? I18n.t('errorEmailRequired') : !re.test(email) ? I18n.t('errorEmailFormat') : '';
    this.setState({ email, errorEmail });
  };

  render() {
    const { isChecking } = this.state;

    return (
      <TouchableWithoutFeedback onPress={() => dismissKeyboard()}>
        <KeyboardAvoidingView style={styles.flex} behavior={'position'}>
          <View style={styles.form}>
            <OMTextInput
              label={I18n.t('emailOrPhoneNumberLabel')}
              textInputStyle={styles.inputField}
              placeholder={I18n.t('emailOrPhoneNumberPlaceholder')}
              keyboardType={'email-address'}
              autoCorrect={false}
              autoCapitalize={'none'}
              onChangeText={text => this.onChangeEmail(text)}
              onSubmitEditing={() => {
                this.passwordField.focus();
                this.setState({
                  errorEmail: !this.state.email ? I18n.t('errorEmailRequired') : ''
                });
              }}
              value={this.state.email}
              error={this.state.errorEmail}
              icon={!this.state.email
                ? null
                : !this.state.errorEmail
                  ? <Icon size={40} name={'ios-checkmark-outline'} color={GREEN} />
                  : <EvilIcons size={25} name={'exclamation'} color={FIRE} />}
            />
            <OMTextInput
              ref={ref => this.passwordField = ref}
              textInputStyle={styles.inputField}
              autoCorrect={false}
              autoCapitalize={'none'}
              label={I18n.t('password')}
              secureTextEntry={!this.state.showPassword}
              placeholder={I18n.t('yourPassword')}
              value={this.state.password}
              onChangeText={text => this.onChangePassword(text)}
              onSubmitEditing={() => {
                this.handlePressLogin();
                this.setState({
                  errorPassword: !this.state.password || this.state.password.length < 6
                    ? I18n.t('errorPasswordRequired') : ''
                });
              }}
              icon={!this.state.password
                ? null :
                <Icon
                  size={30}
                  name={this.state.showPassword ? 'ios-eye-off' : 'ios-eye'}
                  color={TEXT}
                  onPress={() => this.setState({ showPassword: !this.state.showPassword })}
                />}
              error={this.state.errorPassword}
            />
          </View>
          <TouchableOpacity onPress={this.goToForgotPassword}>
            <SFMedium allowFontScaling={false} style={styles.forgotLink}>
              {I18n.t('forgotPassword')}
            </SFMedium>
          </TouchableOpacity>
          <View style={styles.loginBlock}>
            <View style={{ flexDirection: 'row' }}>
              <SFRegular allowFontScaling={false} style={styles.noAccount}>
                {I18n.t('dontHaveAnAccount')}
              </SFRegular>
              <TouchableOpacity onPress={this.register}>
                <SFBold allowFontScaling={false} style={styles.register}>
                  {I18n.t('register')}
                </SFBold>
              </TouchableOpacity>
            </View>
            <NormalButton
              text={I18n.t('signIn').toUpperCase()}
              style={styles.signInButton}
              textStyle={styles.signInButtonLabel}
              pressed={true}
              dropShadow={true}
              onPress={() => this.handlePressLogin()}
            />
          </View>
          {isChecking && <Loading />}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }
}

LoginContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  fromHomeScreen: PropTypes.bool.isRequired,
  login: PropTypes.func.isRequired,
  auth: PropTypes.shape({}).isRequired,
};

export default connectAuth()(LoginContainer);
