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
  TEXT,
  BORDER
} from 'AppColors';
import { ImageUtils } from 'AppUtilities';
import { STATUSBAR_HEIGHT, NAVBAR_HEIGHT } from 'AppConstants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SFMedium, SFRegular, SFSemiBold } from 'AppFonts';
import { get, isEmpty } from 'lodash';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import I18n from 'react-native-i18n';
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

export class ProviderListTopNav extends PureComponent {

  render() {
    const {
      activePatient,
      onFilter,
      onBack,
      backTitle,
      onExpanded,
      isExpanded,
    } = this.props;

    return (
      <View style={styles.container}>
        {onBack &&
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ left: 5, right: 5, top: 5, bottom: 5 }}
          >
            <SFRegular style={styles.navButtonLabel}>{backTitle}</SFRegular>
          </TouchableOpacity>
        }
        {!onBack && <View style={styles.gap} />}
        <View>
          {!isEmpty(activePatient) &&
            <TouchableOpacity onPress={onExpanded}>
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
                <Icon
                  name={isExpanded ? 'expand-less' : 'expand-more'}
                  style={styles.expandIcon}
                />
              </View>
            </TouchableOpacity>
          }
          {isEmpty(activePatient) &&
            <SFSemiBold style={styles.title}>
              Find a doctor
            </SFSemiBold>
          }
        </View>
        {onFilter &&
          <TouchableOpacity
            onPress={onFilter}
            hitSlop={{ left: 5, right: 5, top: 5, bottom: 5 }}
          >
            <MIcon
              style={styles.rightButton}
              name={'sort'}
              size={24}
              color={PRIMARY_COLOR}
            />
          </TouchableOpacity>
        }
        {!onFilter && <View style={styles.gap} />}
      </View>
    );
  }
}

ProviderListTopNav.propTypes = {
  activePatient: PropTypes.object,
  onFilter: PropTypes.func,
  onBack: PropTypes.func,
  backTitle: PropTypes.string,
  onExpanded: PropTypes.func,
  isExpanded: PropTypes.bool,
};

ProviderListTopNav.defaultProps = {
  activePatient: {},
  onBack: null,
  onExpanded: () => {},
  isExpanded: false,
  backTitle: I18n.t('cancel')
};
