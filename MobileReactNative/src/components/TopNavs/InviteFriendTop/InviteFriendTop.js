// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import {
  WHITE,
  BORDER,
  LINE
} from 'AppColors';
import { STATUSBAR_HEIGHT, NAVBAR_HEIGHT } from 'AppConstants';
import { SFMedium, SFRegular } from 'AppFonts';

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
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
    overflow: 'visible',
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowColor: 'black',
    zIndex: 31
  },
  cancelText: {
    color: LINE,
    fontSize: 14,
  },
  titleText: {
    color: LINE,
    fontSize: 16,
  }
});

export class InviteFriendTop extends PureComponent {

  render() {
    const {
      onInvite,
      onBack,
      title,
      onRightText,
      color
    } = this.props;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{
            left: 5, right: 5, top: 5, bottom: 5
          }}
        >
          <SFRegular style={styles.cancelText}>Cancel</SFRegular>
        </TouchableOpacity>
        <SFRegular style={styles.titleText}>{title}</SFRegular>
        <TouchableOpacity
          onPress={onInvite}
          hitSlop={{
            left: 5, right: 5, top: 5, bottom: 5
          }}
        >
          <SFMedium
            style={{
              fontSize: 14,
              color: color ? 'rgba(127,72,251,0.5)' : 'rgb(127,72,251)'
            }}
          >
            {onRightText}
          </SFMedium>
        </TouchableOpacity>
      </View>
    );
  }
}

InviteFriendTop.propTypes = {
  onInvite: PropTypes.func,
  onBack: PropTypes.func
};

InviteFriendTop.defaultProps = {
  onInvite: () => {},
  onBack: () => {},
};
