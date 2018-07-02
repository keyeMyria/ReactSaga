// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image
} from 'react-native';
import {
  DARK_GRAY,
  PRIMARY_COLOR,
  WHITE,
  BORDER
} from 'AppColors';
import { STATUSBAR_HEIGHT, NAVBAR_HEIGHT } from 'AppConstants';
import { SFMedium,SFRegular } from 'AppFonts';
import I18n from 'react-native-i18n';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        paddingTop: STATUSBAR_HEIGHT,
        height: NAVBAR_HEIGHT + STATUSBAR_HEIGHT
      },
      android: {
        height: NAVBAR_HEIGHT,
        borderBottomColor: BORDER,
        borderBottomWidth: 0.5
      }
    }),
    backgroundColor: WHITE,
    overflow: 'visible',
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowColor: 'black',
    zIndex: 31
  },
  avatarName: {
    color: DARK_GRAY,
    fontSize: 18,
  },
  gap: {
    width: 50
  },
  backIcon: {
    height: 30,
    resizeMode: 'contain'
  },
  navButtonLabel: {
    color: PRIMARY_COLOR,
    fontSize: 14
  }
});

export class QRScanTopNav extends PureComponent {

  render() {
    const {
      onBack,
      title,
      rightButtonLabel,
      onPress,
      QR
    } = this.props;

    return (
      <View style={styles.container}>
        {onBack &&
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ left: 5, right: 5, top: 5, bottom: 5 }}
          >
            <Image source={require('img/icons/arrow_left.png')} style={styles.backIcon} />
          </TouchableOpacity>
        }
        {!onBack && <View style={styles.gap} />}
        <SFMedium style={styles.avatarName}>
          {title}
        </SFMedium>
        {QR && <View style={styles.gap} />}
        {rightButtonLabel &&
        <TouchableOpacity
          onPress={onPress}
          hitSlop={{
            left: 5, right: 5, top: 5, bottom: 5
          }}
        >
          <SFRegular style={styles.navButtonLabel}>{rightButtonLabel}</SFRegular>
        </TouchableOpacity>
        }
      </View>
    );
  }
}

QRScanTopNav.propTypes = {
  onBack: PropTypes.func,
  title: PropTypes.string
};

QRScanTopNav.defaultProps = {
  onBack: null,
  title: ''
};
