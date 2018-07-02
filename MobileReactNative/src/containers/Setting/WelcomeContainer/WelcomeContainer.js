// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  Platform
} from 'react-native';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from 'AppConstants';
import { SFRegular } from 'AppFonts';
import { AlertMessage, promisify } from 'AppUtilities';
import { NormalButton, Loading } from 'AppComponents';
import { connectAuth } from 'AppRedux';
import I18n from 'react-native-i18n';
import {
  WHITE,
  DARK_GRAY,
  PRIMARY_COLOR,
  TABBAR_ITEM_COLOR,
  FACEBOOK
} from 'AppColors';
import { LoginManager, AccessToken } from 'react-native-fbsdk';

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 50
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  logo: {
    height: WINDOW_HEIGHT / 5,
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  buttonContainer: {
    alignItems: 'center'
  },
  button: {
    width: WINDOW_WIDTH * 0.9,
    marginBottom: 20
  },
  normalButton: {
    width: WINDOW_WIDTH * 0.9,
    marginBottom: 20
  },
  buttonLabel: {
    color: WHITE,
    fontSize: 12,
    fontFamily: 'SFUIText-Bold'
  },
  facebookButton: {
    width: WINDOW_WIDTH * 0.9,
    marginBottom: 20,
    backgroundColor: FACEBOOK
  },
  registerButton: {
    width: WINDOW_WIDTH * 0.9,
    marginBottom: 20,
    backgroundColor: TABBAR_ITEM_COLOR
  },
  spaceLabel: {
    fontSize: 12,
    color: DARK_GRAY,
    marginBottom: 20
  }
});

class WelcomeContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isChecking: false
    };
  }

  signInWithOpenMed = () => {
    const { routeScene } = this.props;

    routeScene('LoginScene', null, {
      title: I18n.t('signIn'),
      backButtonTitle: '',
      navigatorStyle: {
        navBarHidden: false,
        tabBarHidden: true,
        navBarBackgroundColor: WHITE,
        navBarTextColor: DARK_GRAY,
        navBarButtonColor: PRIMARY_COLOR
      },
      overrideBackPress: true
    });
  };

  register = () => {
    const { routeScene } = this.props;

    routeScene('RegisterScene', null, {
      navigatorStyle: {
        navBarHidden: true,
        tabBarHidden: true,
      },
      overrideBackPress: true
    });
  };

  continueWithFacebook = () => {
    const { socialLogin, auth } = this.props;

    LoginManager
      .logInWithReadPermissions(
        ['public_profile', 'user_birthday', 'email'])
      .then((result) => {
        if (result.isCancelled) {
          return Promise.reject(I18n.t('facebook_cancelled'));
        }
        return AccessToken.getCurrentAccessToken();
      })
      .then((data) => {
        if (data.accessToken) {
          this.setState({ isChecking: true });
          return promisify(socialLogin,
            { token: data.accessToken,
              device_token: auth.device_token, device_type: Platform.OS
            });
        }
        return Promise.reject(I18n.t('facebook_token_error'));
      })
      .catch((error) => {
        AlertMessage.fromRequest(error);
      })
      .finally(() => this.setState({ isChecking: false }));
  };

  render() {
    return (
      <View style={styles.flex}>
        <Image source={require('img/images/background.png')} style={styles.background} />
        <View style={styles.container}>
          <Image
            source={require('img/images/logo.png')}
            style={styles.logo}
          />
          <View style={styles.buttonContainer}>
            <NormalButton
              text={I18n.t('signInWithOpenMed').toUpperCase()}
              style={styles.button}
              textStyle={styles.buttonLabel}
              pressed={true}
              dropShadow={true}
              onPress={() => this.signInWithOpenMed()}
            />
            <NormalButton
              text={I18n.t('continueWithFacebook').toUpperCase()}
              style={styles.facebookButton}
              textStyle={styles.buttonLabel}
              pressed={false}
              dropShadow={true}
              onPress={() => this.continueWithFacebook()}
              singleColorButton={true}
            />
            <SFRegular style={styles.spaceLabel}>
              {I18n.t('or').toUpperCase()}
            </SFRegular>
            <NormalButton
              text={I18n.t('register').toUpperCase()}
              style={styles.registerButton}
              textStyle={styles.buttonLabel}
              pressed={false}
              dropShadow={true}
              onPress={() => this.register()}
              singleColorButton={true}
            />
          </View>
        </View>
        {this.state.isChecking && <Loading />}
      </View>
    );
  }
}

WelcomeContainer.propTypes = {
  auth: PropTypes.object.isRequired,
  routeScene: PropTypes.func.isRequired,
  socialLogin: PropTypes.func.isRequired,
};

export default connectAuth()(WelcomeContainer);
