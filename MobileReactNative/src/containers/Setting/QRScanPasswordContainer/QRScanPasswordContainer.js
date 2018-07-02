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
import { Loading, Panel, RoundedInput, QRScanTopNav, RoundedButton } from 'AppComponents';
import { SFMedium, SFRegular } from 'AppFonts';
import { connectAuth, connectPatient } from 'AppRedux';
import I18n from 'react-native-i18n';
import {
  LINE,
  BACKGROUND_GRAY,
  BLACK,
  PRIMARY_COLOR,
  FIRE,
  TINT,
  DARK_GRAY
} from 'AppColors';
import Icon from 'react-native-vector-icons/Ionicons';
import { compose } from 'recompose';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_GRAY
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

@withEmitter('_emitter')
class QRScanPasswordContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isSending: false,
      newPassword: '',
      confirmPassword: ''
    };
  }

  handleChangePassword = () => {
    const { setPatientInviteCode, code, resetRouteStack } = this.props;
    const { confirmPassword, newPassword } = this.state;

    if (!newPassword || newPassword.length < 6) {
      const errorNewPassword = I18n.t('errorPasswordRequired');
      this.setState({ errorNewPassword });
    } else if (newPassword !== confirmPassword) {
      const errorConfirmPassword = I18n.t('errorPasswordConfirm');
      this.setState({ errorConfirmPassword });
    } else {
      if (!this.state.agree) {
        AlertMessage.fromRequest(I18n.t('tcError'));
        return false;
      }
      this.setState({ isSending: true });
      promisify(setPatientInviteCode, {
        code,
        password: newPassword,
        password_confirm: newPassword
      }).then(() => {
        resetRouteStack(0);
      })
        .catch(error => AlertMessage.fromRequest(error))
        .finally(() => this.setState({ isSending: false }));
    }
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

  render() {
    const {
      errorNewPassword,
      newPassword,
      confirmPassword,
      errorConfirmPassword,
      isSending
    } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <QRScanTopNav
          onBack={this.props.routeBack}
          title={'Register'}
          QR={true}
        />
        <ScrollView style={styles.container}>
          <TouchableWithoutFeedback onPress={() => dismissKeyboard()}>
            <KeyboardAvoidingView behavior={'position'}>
              <View>
                <Panel style={styles.panelStyle}>
                  <View style={styles.formGroup}>
                    <Text allowFontScaling={false} style={styles.txtLabel}>
                      {I18n.t('password')
                        .toUpperCase()}
                    </Text>
                    <RoundedInput width={WINDOW_WIDTH - 50}>
                      <TextInput
                        style={styles.textInput}
                        ref={ref => this.newPassword = ref}
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        secureTextEntry={true}
                        placeholder={'Password'}
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
                        placeholder={'Confirm Password'}
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
                    onPress={() => this.handleChangePassword()}
                  >
                    {I18n.t('register')}
                  </RoundedButton>
                </Panel>
              </View>
              {isSending && <Loading />}
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    );
  }
}

QRScanPasswordContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  resetRouteStack: PropTypes.func.isRequired,
  setPatientInviteCode: PropTypes.func.isRequired
};

export default compose(
  connectAuth(),
  connectPatient(),
)(QRScanPasswordContainer);
