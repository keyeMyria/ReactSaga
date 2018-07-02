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
  DARK_GRAY,
  PRIMARY_COLOR,
  WHITE,
  BORDER,
  TINT
} from 'AppColors';
import { ImageUtils } from 'AppUtilities';
import { STATUSBAR_HEIGHT, NAVBAR_HEIGHT } from 'AppConstants';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { SFMedium } from 'AppFonts';
import { get } from 'lodash';
import { OMImage } from 'AppComponents';
import * as Progress from 'react-native-progress';

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
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowColor: 'black',
    zIndex: 31,
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
    width: 30
  }
});

export class SettingTopNav extends PureComponent {

  render() {
    const {
      activePatient,
      onBack,
      onExpanded,
      isExpanded,
    } = this.props;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{
            left: 5, right: 5, top: 5, bottom: 5
          }}
        >
          <OMImage
            resizeMode={'contain'}
            placeholder={require('img/icons/arrow_left.png')}
          />
        </TouchableOpacity>
        <View>
          {activePatient &&
          <TouchableOpacity disabled={!onExpanded} onPress={onExpanded}>
            <View style={styles.detail}>
              <View style={styles.avatarView}>
                <OMImage
                  style={styles.avatar}
                  resizeMode={'cover'}
                  borderRadius={15}
                  indicator={Progress.Circle}
                  indicatorProps={{
                    size: 10,
                    thickness: 0.5,
                    borderWidth: 0,
                    color: PRIMARY_COLOR,
                  }}
                  source={{ uri: activePatient.image_url }}
                  placeholder={ImageUtils.getUnknownImage(activePatient.gender)}
                  threshold={50}
                />
              </View>
              <SFMedium style={styles.avatarName}>
                {get(activePatient, 'first_name', '')}
              </SFMedium>
              {onExpanded &&
              <MaterialIcon
                name={isExpanded ? 'expand-less' : 'expand-more'}
                style={styles.expandIcon}
              />
              }
            </View>
          </TouchableOpacity>
          }
        </View>
        <View style={styles.gap} />
      </View>
    );
  }
}

SettingTopNav.propTypes = {
  activePatient: PropTypes.object,
  onBack: PropTypes.func,
  onExpanded: PropTypes.func,
  isExpanded: PropTypes.bool,
};

SettingTopNav.defaultProps = {
  activePatient: {},
  onBack: () => {},
  isExpanded: false,
};
