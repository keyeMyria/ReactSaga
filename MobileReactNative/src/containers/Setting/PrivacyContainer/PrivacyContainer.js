// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';
import { WINDOW_HEIGHT } from 'AppConstants';
import { SFRegular, SFMedium } from 'AppFonts';
import I18n from 'react-native-i18n';
import { PRIMARY_COLOR } from 'AppColors';
import config from 'react-native-config';

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
  logoView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 100
  },
  logo: {
    height: WINDOW_HEIGHT / 5,
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  bottomView: {
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    marginBottom: 20
  },
  description: {
    fontSize: 14,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: PRIMARY_COLOR,
    fontSize: 18
  }
});

class PrivacyContainer extends PureComponent {

  openTerms = () => {
    Linking.openURL(config.TERM_URL)
      .catch(err => console.error('An error occurred', err));
  };

  openPrivacy = () => {
    Linking.openURL(config.PRIVACY_URL)
      .catch(err => console.error('An error occurred', err));
  };

  agreeAndContinue = () => {
    AsyncStorage.setItem('@OPENMED:ACCEPT_PRIVACY', 'ACCEPTED')
      .then(() => this.props.onAccept())
      .catch(error => console.log(error));
  };

  render() {
    return (
      <View style={styles.flex}>
        <Image source={require('img/images/background.png')} style={styles.background} />
        <View style={styles.container}>
          <View style={styles.logoView}>
            <Image
              source={require('img/images/logo.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.bottomView}>
            <SFMedium style={styles.title}>
              {I18n.t('welcomeToOpenMed')}
            </SFMedium>
            <SFRegular style={styles.description}>
              {I18n.t('privacyPolicyDescription')}
            </SFRegular>
            <View style={{ flexDirection: 'row', marginBottom: 40 }}>
              <SFRegular style={styles.description}>OpenMed&nbsp;</SFRegular>
              <TouchableOpacity onPress={() => this.openTerms()}>
                <SFRegular style={[styles.description, { color: PRIMARY_COLOR }]}>
                  {I18n.t('termAndConditions')}
                </SFRegular>
              </TouchableOpacity>
              <SFRegular style={styles.description}>
                &nbsp;{I18n.t('and')}&nbsp;
              </SFRegular>
              <TouchableOpacity onPress={() => this.openPrivacy()}>
                <SFRegular style={[styles.description, { color: PRIMARY_COLOR }]}>
                  {I18n.t('privacyPolicy')}
                </SFRegular>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => this.agreeAndContinue()}
            >
              <SFMedium style={styles.buttonText}>
                Agree & Continue
              </SFMedium>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

PrivacyContainer.propTypes = {
  onAccept: PropTypes.func.isRequired
};

export default PrivacyContainer;
