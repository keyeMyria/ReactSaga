// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Text
} from 'react-native';
import {
  DARK_GRAY,
  PRIMARY_COLOR,
  WHITE,
  BORDER
} from 'AppColors';
import { ImageUtils } from 'AppUtilities';
import { STATUSBAR_HEIGHT, NAVBAR_HEIGHT } from 'AppConstants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SFMedium, SFRegular } from 'AppFonts';
import { get } from 'lodash';
import I18n from 'react-native-i18n';
import { OMImage } from 'AppComponents';
import * as Progress from 'react-native-progress';

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
  navButtonLabel: {
    color: PRIMARY_COLOR,
    fontSize: 14
  },
  backIcon: {
    height: 30,
    resizeMode: 'contain',
    marginRight: 20
  },
  title: {
    color: DARK_GRAY,
    fontSize: 18,
  }
});

export class PaymentMethodTopNav extends PureComponent {

  render() {
    const {
      title,
      activePatient,
      onSave,
      onBack,
      onExpanded,
      isExpanded,
      isViewable,
      rightButtonLabel,
      isDirect,
      isActive
    } = this.props;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{
            left: 5, right: 5, top: 5, bottom: 5
          }}
        >
          {isDirect && <Text style={styles.navButtonLabel}>Cancel</Text>}
          {!isDirect && <Image source={require('img/icons/arrow_left.png')} style={styles.backIcon} />}
        </TouchableOpacity>
        {isViewable && isDirect &&
          <TouchableOpacity onPress={onExpanded} disabled={!isViewable}>
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
              <SFMedium style={styles.avatarName}>{get(activePatient, 'first_name', '')}</SFMedium>
              {isViewable &&
                <Icon name={isExpanded ? 'expand-less' : 'expand-more'} style={styles.expandIcon} />
              }
            </View>
          </TouchableOpacity>
        }
        {!isViewable && !isDirect &&
          <SFMedium style={styles.title}>{title}</SFMedium>
        }
        {rightButtonLabel !== I18n.t('add') &&
          <TouchableOpacity
            onPress={onSave}
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

PaymentMethodTopNav.propTypes = {
  title: PropTypes.string,
  activePatient: PropTypes.object,
  onSave: PropTypes.func,
  onBack: PropTypes.func,
  onExpanded: PropTypes.func,
  isExpanded: PropTypes.bool,
  isViewable: PropTypes.bool,
  rightButtonLabel: PropTypes.string,
};

PaymentMethodTopNav.defaultProps = {
  activePatient: {},
  onSave: () => {},
  onBack: () => {},
  onExpanded: () => {},
  isExpanded: false,
  isViewable: true,
  rightButtonLabel: I18n.t('save'),
};
