// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { AlertMessage, dismissKeyboard, promisify, withEmitter } from 'AppUtilities';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from 'AppConstants';
import { OMTextInput, Loading, NormalButton } from 'AppComponents';
import { connectAuth } from 'AppRedux';
import I18n from 'react-native-i18n';
import { GREEN, FIRE } from 'AppColors';
import Icon from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

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

@withEmitter('emitter')
class ForgotPasswordContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      isSending: false
    };
  }

  componentWillMount() {
    this.emitter.on('routeBack:ForgotPasswordScene', this.onBackButtonHandler);
  }

  componentWillUnmount() {
    this.emitter.removeListener('routeBack:ForgotPasswordScene', this.onBackButtonHandler);
  }

  onBackButtonHandler = () => this.props.routeBack();

  handlePressReset = () => {
    const { email } = this.state;
    const { forgotPassword } = this.props;

    dismissKeyboard();

    if (!email) {
      // eslint-disable-next-line max-len
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      // eslint-disable-next-line max-len
      const errorEmail = !email ? I18n.t('errorEmailRequired') : !re.test(email) ? I18n.t('errorEmailFormat') : '';
      this.setState({ errorEmail });
      return;
    }

    this.setState({ isSending: true });

    promisify(forgotPassword, { email })
      .then(() => {
        Alert.alert(
          'OpenMed',
          I18n.t('sentResetEmail', { email }),
          [
            {
              text: I18n.t('ok'),
              onPress: () => this.emitter.emit('routeBack:ForgotPasswordScene')
            }
          ]
        );
      })
      .catch(e => AlertMessage.fromRequest(e))
      .finally(() => this.setState({ isSending: false }));
  };

  onChangeEmail = (email) => {
    // eslint-disable-next-line max-len
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // eslint-disable-next-line max-len
    const errorEmail = !email ? I18n.t('errorEmailRequired') : !re.test(email) ? I18n.t('errorEmailFormat') : '';
    this.setState({ email, errorEmail });
  };

  render() {
    const { isSending } = this.state;

    return (
      <TouchableWithoutFeedback onPress={() => dismissKeyboard()}>
        <KeyboardAvoidingView style={styles.flex} behavior={'position'}>
          <View style={styles.form}>
            <OMTextInput
              label={I18n.t('email')}
              textInputStyle={styles.inputField}
              placeholder={I18n.t('emailExample')}
              keyboardType={'email-address'}
              autoCorrect={false}
              autoCapitalize={'none'}
              onChangeText={text => this.onChangeEmail(text)}
              onSubmitEditing={this.handlePressReset}
              value={this.state.email}
              error={this.state.errorEmail}
              icon={!this.state.email ? null : !this.state.errorEmail
                ? <Icon size={40} name={'ios-checkmark-outline'} color={GREEN} />
                : <EvilIcons size={25} name={'exclamation'} color={FIRE} />}
            />
            <NormalButton
              text={I18n.t('sendEmail').toUpperCase()}
              style={styles.button}
              textStyle={styles.buttonLabel}
              pressed={true}
              dropShadow={true}
              onPress={() => this.handlePressReset()}
            />
          </View>
          {isSending && <Loading />}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }
}

ForgotPasswordContainer.propTypes = {
  routeBack: PropTypes.func.isRequired,
  forgotPassword: PropTypes.func.isRequired,
};

export default connectAuth()(ForgotPasswordContainer);
