// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Text,
  TextInput
} from 'react-native';
import { AlertMessage, dismissKeyboard, promisify, withEmitter } from 'AppUtilities';
import { WINDOW_WIDTH } from 'AppConstants';
import { Loading, Panel, RoundedInput } from 'AppComponents';
import { SFMedium } from 'AppFonts';
import { connectAuth } from 'AppRedux';
import I18n from 'react-native-i18n';
import {
  WHITE,
  LINE,
  BACKGROUND_GRAY,
  BLACK,
  PRIMARY_COLOR,
  FIRE,
  DARK_GRAY
} from 'AppColors';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_GRAY
  },
  txtTitle: {
    fontSize: 18,
    marginTop: 10,
    paddingHorizontal: 10
  },
  button: {
    borderRadius: 20,
    width: WINDOW_WIDTH * 0.9,
    height: 40,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.5,
    shadowColor: 'black',
    overflow: 'visible',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  buttonLabel: {
    color: WHITE,
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  panelStyle: {
    paddingHorizontal: 15,
    borderColor: LINE,
    borderWidth: 0.5,
    marginTop: 10,
    paddingBottom: 20
  },
  txtLabel: {
    paddingTop: 8,
    fontSize: 12,
    color: LINE
  },
  error: {
    color: '#ff0000',
    fontSize: 10,
  },
  textInput: {
    fontSize: 15,
    color: BLACK,
    width: WINDOW_WIDTH - 100,
    height: 50
  },
  forgotPassword: {
    fontSize: 10,
    color: PRIMARY_COLOR
  }
});

@withEmitter('_emitter')
class ChangePasswordContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isSending: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  componentWillMount() {
    this._emitter.on('routeBack:ChangePasswordScene', this.onBackButtonHandler);
  }

  componentWillUnmount() {
    this._emitter.removeListener('routeBack:ChangePasswordScene', this.onBackButtonHandler);
  }

  onBackButtonHandler = () => this.props.routeBack();

  handleChangePassword = () => {
    const { routeBack, changePassword } = this.props;

    const { confirmPassword, currentPassword, newPassword } = this.state;
    if (!currentPassword || currentPassword.length < 6) {
      const errorCurrentPassword = I18n.t('errorPasswordRequired');
      this.setState({ errorCurrentPassword });
    } else if (!newPassword || newPassword.length < 6) {
      const errorNewPassword = I18n.t('errorPasswordRequired');
      this.setState({ errorNewPassword });
    } else if (newPassword !== confirmPassword) {
      const errorConfirmPassword = I18n.t('errorPasswordConfirm');
      this.setState({ errorConfirmPassword });
    } else {
      this.setState({ isSending: true });
      promisify(changePassword, {
        password: newPassword,
        password_confirm: newPassword,
        password_current: currentPassword
      }).then(() => routeBack())
        .catch(error => AlertMessage.fromRequest(error))
        .finally(() => this.setState({ isSending: false }));
    }
  };

  onChangeCurrentPassword = (currentPassword) => {
    const errorCurrentPassword = !currentPassword || currentPassword.length < 6
      ? I18n.t('errorPasswordRequired') : '';
    this.setState({ currentPassword, errorCurrentPassword });
  };

  onChangeNewPassword = (newPassword) => {
    const errorNewPassword = !newPassword || newPassword.length < 6
      ? I18n.t('errorPasswordRequired') : '';
    this.setState({ newPassword, errorNewPassword });
  };

  onChangeConfirmPassword = (confirmPassword) => {
    const errorConfirmPassword = !confirmPassword || confirmPassword.length < 6
      ? I18n.t('errorPasswordRequired') : '';
    this.setState({ confirmPassword, errorConfirmPassword });
  };

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


  render() {
    const {
      errorNewPassword,
      currentPassword,
      errorCurrentPassword,
      newPassword,
      confirmPassword,
      errorConfirmPassword,
      isSending
    } = this.state;

    return (
      <ScrollView style={styles.container}>
        <TouchableWithoutFeedback onPress={() => dismissKeyboard()}>
          <KeyboardAvoidingView behavior={'position'}>
            <SFMedium allowFontScaling={false} style={styles.txtTitle}>
              {I18n.t('resetYourPassword')}
            </SFMedium>
            <View>
              <Panel style={styles.panelStyle}>
                <View style={styles.formGroup}>
                  <Text allowFontScaling={false} style={styles.txtLabel}>
                    {I18n.t('currentPassword')
                      .toUpperCase()}
                  </Text>
                  <RoundedInput width={WINDOW_WIDTH - 50}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={I18n.t('currentPassword')}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      onChangeText={text => this.onChangeCurrentPassword(text)}
                      onSubmitEditing={() => {
                        this.newPassword.focus();
                        this.setState({
                          errorCurrentPassword: !currentPassword
                            ? I18n.t('errorPasswordRequired') : ''
                        });
                      }}
                      value={currentPassword}
                      secureTextEntry={true}
                      underlineColorAndroid={'transparent'}
                    />
                    {this.state.currentPassword.length >= 6 &&
                    <Icon size={40} name={'ios-checkmark-outline'} color={PRIMARY_COLOR} />}
                    {this.state.currentPassword.length <= 5 &&
                    this.state.currentPassword.length !== 0 &&
                    <Icon size={25} name={'md-close'} color={FIRE} />}
                  </RoundedInput>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.error}>{errorCurrentPassword}</Text>
                    <TouchableOpacity onPress={this.goToForgotPassword} >
                      <Text style={styles.forgotPassword}>{I18n.t('forgotPassword')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text allowFontScaling={false} style={styles.txtLabel}>
                    {I18n.t('newPassword')
                      .toUpperCase()}
                  </Text>
                  <RoundedInput width={WINDOW_WIDTH - 50}>
                    <TextInput
                      style={styles.textInput}
                      ref={ref => this.newPassword = ref}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      secureTextEntry={true}
                      placeholder={'Your password'}
                      onChangeText={text => this.onChangeNewPassword(text)}
                      onSubmitEditing={() => {
                        this.confirmPassword.focus();
                        this.setState({
                          errorNewPassword: !newPassword || newPassword.length < 2
                            ? I18n.t('errorPasswordRequired') : ''
                        });
                      }}
                      value={newPassword}
                      underlineColorAndroid={'transparent'}
                    />
                    {this.state.newPassword.length >= 6 &&
                    <Icon size={40} name={'ios-checkmark-outline'} color={PRIMARY_COLOR} />}
                    {this.state.newPassword.length <= 5 &&
                    this.state.newPassword.length !== 0 &&
                    <Icon size={25} name={'md-close'} color={FIRE} />}
                  </RoundedInput>
                  <Text style={styles.error}>{errorNewPassword}</Text>
                </View>
                <View style={styles.formGroup}>
                  <Text allowFontScaling={false} style={styles.txtLabel}>
                    {I18n.t('confirmPassword')
                      .toUpperCase()}
                  </Text>
                  <RoundedInput width={WINDOW_WIDTH - 50}>
                    <TextInput
                      style={styles.textInput}
                      ref={ref => this.confirmPassword = ref}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      secureTextEntry={true}
                      placeholder={'Your password'}
                      onChangeText={text => this.onChangeConfirmPassword(text)}
                      onSubmitEditing={() => {
                        this.handleChangePassword();
                        this.setState({
                          errorConfirmPassword: !confirmPassword || confirmPassword.length < 2
                            ? I18n.t('errorPasswordRequired') : ''
                        });
                      }}
                      value={confirmPassword}
                      error={errorConfirmPassword}
                      underlineColorAndroid={'transparent'}
                    />
                    {(this.state.confirmPassword.length >= 6
                      && this.state.confirmPassword === this.state.newPassword) &&
                      <Icon size={40} name={'ios-checkmark-outline'} color={PRIMARY_COLOR} />}
                    {((this.state.confirmPassword.length <= 5 &&
                    this.state.confirmPassword.length !== 0) ||
                      (this.state.confirmPassword !== this.state.newPassword
                        && this.state.confirmPassword.length !== 0)) &&
                        <Icon size={25} name={'md-close'} color={FIRE} />}
                  </RoundedInput>
                  <Text style={styles.error}>{errorConfirmPassword}</Text>
                </View>
                <TouchableOpacity
                  style={{ marginTop: 5, alignItems: 'center' }}
                  onPress={this.handleChangePassword}
                >
                  <LinearGradient
                    colors={['#00E2E0', '#00D2D0']}
                    style={{
                      width: WINDOW_WIDTH * 0.85,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20
                    }}
                  >
                    <SFMedium style={styles.buttonLabel}>{I18n.t('changePassword')}</SFMedium>
                  </LinearGradient>
                </TouchableOpacity>
              </Panel>
            </View>
            {isSending && <Loading />}
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ScrollView>
    );
  }
}

ChangePasswordContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  changePassword: PropTypes.func.isRequired,
};

export default connectAuth()(ChangePasswordContainer);
