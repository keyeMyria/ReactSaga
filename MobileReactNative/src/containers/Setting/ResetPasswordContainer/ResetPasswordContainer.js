// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { AlertMessage, dismissKeyboard, promisify, withEmitter } from 'AppUtilities';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from 'AppConstants';
import { OMTextInput, Loading, NormalButton, SimpleTopNav } from 'AppComponents';
import { connectAuth } from 'AppRedux';
import I18n from 'react-native-i18n';
import { TINT, TEXT } from 'AppColors';
import Icon from 'react-native-vector-icons/Ionicons';
import { isEmpty } from 'lodash';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    height: WINDOW_HEIGHT,
    alignItems: 'center'
  },
  form: {
    marginTop: 30,
    marginBottom: 20
  },
  forgotLink: {
    width: WINDOW_WIDTH * 0.9,
    paddingLeft: 30,
    color: TINT
  },
  register: {
    color: TINT,
    fontWeight: 'bold'
  },
  boxLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  txtTitle: {
    fontSize: 18,
    textAlign: 'center'
  },
  button: {
    marginTop: 20,
    alignSelf: 'center',
    width: WINDOW_WIDTH * 0.9
  },
  buttonLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  },
  inputField: {
    fontSize: 14,
    fontFamily: 'SFUIText-Regular'
  }
});

@withEmitter('_emitter')
class ResetPasswordContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      showNewPassword: false,
      showConfirmPassword: false,
      newPassword: '',
      confirmPassword: '',
      errorNewPassword: '',
      errorConfirmPassword: '',
      isSending: false
    };
  }

  handleChangePassword = () => {
    const { routeBack, resetPassword, code, auth } = this.props;
    const { newPassword, confirmPassword } = this.state;

    let params = null;

    if (code) {
      params = {
        code,
        password: newPassword,
        password_confirm: confirmPassword
      };
    } else {
      params = {
        user_id: auth.user.id,
        password: newPassword
      };
    }

    this.setState({ isSending: true });

    promisify(resetPassword, params)
      .then(() => {
        Alert.alert('OpenMed', I18n.t('resetPasswordSuccess'),
          [
            {
              text: I18n.t('ok'),
              onPress: () => {
                routeBack();
              }
            }
          ]
        );
      })
      .catch(e => AlertMessage.fromRequest(e))
      .finally(() => this.setState({ isSending: false }));
  }

  onChangeNewPassword = (newPassword) => {
    const errorNewPassword = !newPassword || newPassword.length < 6
      ? I18n.t('errorPasswordRequired')
      : '';
    this.setState({ newPassword, errorNewPassword });
  }

  onChangeConfirmPassword = (confirmPassword) => {
    const errorConfirmPassword = !confirmPassword || confirmPassword.length < 6
      ? I18n.t('errorPasswordRequired')
      : confirmPassword !== this.state.newPassword
        ? I18n.t('passwordNotMatch')
        : '';
    this.setState({ confirmPassword, errorConfirmPassword });
  }

  render() {
    const {
      showConfirmPassword,
      errorNewPassword,
      newPassword,
      confirmPassword,
      errorConfirmPassword,
      showNewPassword,
      isSending
    } = this.state;

    const { code } = this.props;

    return (
      <TouchableWithoutFeedback onPress={() => dismissKeyboard()}>
        <KeyboardAvoidingView style={styles.flex} behavior={'position'}>
          <SimpleTopNav
            onBack={code ? () => this.props.routeBack() : null}
            title={I18n.t('resetPassword')}
          />
          <View style={styles.form}>
            <OMTextInput
              textInputStyle={styles.inputField}
              label={I18n.t('newPassword')}
              ref={'newPassword'}
              autoCorrect={false}
              autoCapitalize={'none'}
              secureTextEntry={!showNewPassword}
              placeholder={I18n.t('newPassword')}
              onChangeText={(text) => this.onChangeNewPassword(text)}
              onSubmitEditing={() => {
                this._confirmPassword.focus();
                this.setState({
                  errorNewPassword: !newPassword || newPassword.length < 6
                    ? I18n.t('errorPasswordRequired')
                    : ''
                });
              }}
              value={newPassword}
              error={errorNewPassword}
              icon={
                !newPassword ? null
                  : <Icon
                    size={30}
                    name={showNewPassword ? 'ios-eye-off' : 'ios-eye'}
                    color={TEXT}
                    onPress={() => this.setState({ showNewPassword: !showNewPassword })}
                  />
              }
            />
            <OMTextInput
              ref={ref => this._confirmPassword = ref}
              textInputStyle={styles.inputField}
              label={I18n.t('confirmPassword')}
              autoCorrect={false}
              autoCapitalize={'none'}
              secureTextEntry={!showConfirmPassword}
              placeholder={I18n.t('confirmPassword')}
              onChangeText={(text) => this.onChangeConfirmPassword(text)}
              onSubmitEditing={() => {
                this.setState({
                  errorConfirmPassword: !confirmPassword || confirmPassword.length < 6
                    ? I18n.t('errorPasswordRequired')
                    : confirmPassword !== newPassword
                    ? I18n.t('passwordNotMatch')
                    : ''
                });
              }}
              value={confirmPassword}
              error={errorConfirmPassword}
              icon={
                !confirmPassword ? null
                  : <Icon
                    size={30}
                    name={showConfirmPassword ? 'ios-eye-off' : 'ios-eye'}
                    color={TEXT}
                    onPress={() => this.setState({ showConfirmPassword: !showConfirmPassword })}
                  />
              }
            />
            <NormalButton
              text={I18n.t('changePassword').toUpperCase()}
              style={styles.button}
              textStyle={styles.buttonLabel}
              disabled={!isEmpty(errorNewPassword)
                || !isEmpty(errorConfirmPassword)
                || isEmpty(newPassword)
                || isEmpty(confirmPassword)
              }
              pressed={isEmpty(errorNewPassword)
                && isEmpty(errorConfirmPassword)
                && !isEmpty(newPassword)
                && !isEmpty(confirmPassword)
              }
              dropShadow={true}
              onPress={() => this.handleChangePassword()}
            />
          </View>
          {isSending && <Loading />}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }
}

ResetPasswordContainer.propTypes = {
  routeBack: PropTypes.func.isRequired,
  code: PropTypes.string,
  auth: PropTypes.object.isRequired,
  resetPassword: PropTypes.func.isRequired,
  resetPasswordSuccess: PropTypes.func.isRequired,
};

export default connectAuth()(ResetPasswordContainer);
