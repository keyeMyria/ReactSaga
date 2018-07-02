// flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { NormalButton } from 'AppComponents';
import I18n from 'react-native-i18n';
import { SFMedium } from 'AppFonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  signInButton: {
    width: 200,
    marginTop: 20
  },
  signInButtonLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  },
});

export class WelcomePlaceholder extends PureComponent {

  render() {
    return (
      <View style={styles.container}>
        <SFMedium>{I18n.t('not_signin')}</SFMedium>
        <NormalButton
          text={I18n.t('signIn').toUpperCase()}
          style={styles.signInButton}
          textStyle={styles.signInButtonLabel}
          dropShadow={true}
          pressed={true}
          onPress={this.props.onPress}
        />
      </View>
    );
  }
}

WelcomePlaceholder.propTypes = {
  onPress: PropTypes.func.isRequired
};
