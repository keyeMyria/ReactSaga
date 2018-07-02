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
  TEXT,
  BORDER
} from 'AppColors';
import { STATUSBAR_HEIGHT, NAVBAR_HEIGHT } from 'AppConstants';
import { SFMedium } from 'AppFonts';

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
  detail: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarView: {
    width: 30,
    height: 30,
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  avatarName: {
    color: DARK_GRAY,
    fontSize: 18,
    marginLeft: 10
  },
  expandIcon: {
    fontSize: 28,
    color: DARK_GRAY
  },
  gap: {
    width: 50
  },
  menuIcon: {
    fontSize: 28,
    color: DARK_GRAY
  },
  avatarList: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    backgroundColor: 'red',
    height: 50,
    zIndex: 9,
  },
  navButtonLabel: {
    color: PRIMARY_COLOR,
    fontSize: 16
  },
  backIcon: {
    height: 30,
    resizeMode: 'contain',
    marginRight: 20
  },
  title: {
    color: TEXT,
    fontSize: 16
  }
});

export class SimpleTopNav extends PureComponent {

  render() {
    const {
      onBack,
      title
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
        <View style={styles.gap} />
      </View>
    );
  }
}

SimpleTopNav.propTypes = {
  onBack: PropTypes.func,
  title: PropTypes.string
};

SimpleTopNav.defaultProps = {
  onBack: null,
  title: ''
};
