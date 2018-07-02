// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Panel, GearButton } from 'AppComponents';
import {
  TINT, DARK_GRAY,
  FIRE, BLOODORANGE,
  LINE, GRAY_ICON
} from 'AppColors';
import { SFMedium, SFRegular, SFBold } from 'AppFonts';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WINDOW_WIDTH } from 'AppConstants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDistance } from 'AppUtilities';
import _ from 'lodash';
import I18n from 'react-native-i18n';
import moment from 'moment';
import moment_timezone from 'moment-timezone';

const styles = StyleSheet.create({
  avatar: {
    shadowOffset: { width: 0, height: 0 }
  },
  colInfo: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 15,
  },
  txtName: {
    fontSize: 16
  },
  date: {
    fontSize: 11,
    color: LINE
  },
  createdAt: {
    fontSize: 11,
    color: LINE,
    position: 'absolute',
    top: 7,
    right: 20,
    backgroundColor: 'transparent'
  },
  row: {
    flexDirection: 'row',
  },
  dateTimeView: {
    flexDirection: 'row',
    marginTop: 5
  },
  confirmButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropShadow: {
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowColor: 'black',
  },
  drawBorder: {
    borderWidth: 1,
    borderColor: BLOODORANGE
  },
  specialty: {
    flexDirection: 'row',
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: LINE,
    alignSelf: 'flex-end',
    marginLeft: 5
  },
});

export class CalendarProviderListItem extends PureComponent {

  getAvatar = (p) => {
    return p.photo_url
      ? { uri: p.photo_url }
      : null;
  };

  renderConfirmButton = () => {
    return (
      <LinearGradient
        colors={['#00E2E0', '#00D1CF']}
        style={[styles.confirmButton,
          styles.dropShadow
        ]}
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 0.0, y: 1.0 }}
      >
        <Ionicons
          name={'md-checkmark'}
          size={20}
          color={'white'}
          style={{ backgroundColor: 'transparent' }}
        />
      </LinearGradient>
    );
  };

  renderCancelButton = () => {
    return (
      <View style={[styles.confirmButton, styles.drawBorder]}>
        <Ionicons
          name={'md-close'}
          size={20}
          color={DARK_GRAY}
          style={{ backgroundColor: 'transparent' }}
        />
      </View>
    );
  };

  renderGearButton = (color) => {
    const { onGearIconClicked, item } = this.props;

    return (
      <GearButton
        onPress={() => onGearIconClicked(item)}
        size={40}
        color={color}
      />
    );
  };

  renderStatus = () => {
    const appointment = this.props.item;

    if (appointment.status === 2
      || appointment.status === 7) {
      return this.renderConfirmButton();
    } else if (appointment.status === 1
      || appointment.status === 6) {
      return this.renderGearButton(TINT);
    } else if (appointment.status === 10) {
      return this.renderGearButton(FIRE);
    }

    return this.renderCancelButton();
  };

  render() {
    const {
      style,
      item,
      region,
      onItemClicked
    } = this.props;

    const appointment = item;
    const { provider, practice } = appointment;

    const specialty = _.uniq(_.map(provider.specialties, 'name')).join(', ');

    let passDays = moment.unix(appointment.created_at).fromNow(true);
    passDays = passDays
      .replace('a few seconds', '1s')
      .replace('seconds', 's')
      .replace('second', 's')
      .replace('minutes', 'min')
      .replace('minute', 'min')
      .replace('hours', 'h')
      .replace('hour', 'h')
      .replace('days', 'd')
      .replace('day', 'd')
      .replace('weeks', 'w')
      .replace('week', 'w')
      .replace('months', 'm')
      .replace('month', 'm')
      .replace('years', 'y')
      .replace('year', 'y')
      .replace('an ', '1')
      .replace('a ', '1')
      .replace(' ', '');

    let desiredTime = appointment.selected_time
      ? appointment.selected_time
      : appointment.desired_time;

    const timezone = _.get(practice, 'timezone.code', '');
    const isoString = moment.unix(desiredTime);

    if (desiredTime === 0) {
      desiredTime = null;
    }

    const itemClickDisabled = appointment.status !== 2 && appointment.status !== 7
      && appointment.status !== 1 && appointment.status !== 6 && appointment.status !== 10;

    return (
      <TouchableOpacity onPress={() => onItemClicked(item)} disabled={itemClickDisabled}>
        <Panel key={appointment.id} style={style}>
          <SFRegular style={styles.createdAt} numberOfLines={1}>
            {passDays}
          </SFRegular>
          <View style={styles.row}>
            <Avatar
              source={this.getAvatar(provider)}
              placeholder={provider}
              style={styles.avatar}
            />
            <View style={styles.colInfo}>
              <View style={{ maxWidth: WINDOW_WIDTH - 160 }}>
                <SFMedium allowFontScaling={false} style={styles.txtName} numberOfLines={1}>
                  {provider.full_name}
                </SFMedium>
                <View style={[styles.specialty, { maxWidth: WINDOW_WIDTH - 180 }]}>
                  <Icon name={'near-me'} size={18} color={GRAY_ICON} />
                  <SFRegular style={styles.location} numberOfLines={1}>
                    {region
                      ? `${getDistance(practice, region)}, `
                      : ''}
                    {specialty}
                  </SFRegular>
                </View>
                <View style={styles.dateTimeView}>
                  {!desiredTime &&
                    <SFBold style={styles.date}>
                      {I18n.t('firstAvailableTime')}
                    </SFBold>
                  }
                  {desiredTime &&
                    <SFBold style={styles.date}>
                      {moment_timezone(isoString).tz(timezone).format('MM/DD/YY')}&nbsp;
                      {moment_timezone(isoString).tz(timezone).format('hh:mm A')}
                    </SFBold>
                  }
                </View>
              </View>
              {this.renderStatus()}
            </View>
          </View>
        </Panel>
      </TouchableOpacity>
    );
  }
}

CalendarProviderListItem.propTypes = {
  item: PropTypes.object.isRequired,
  style: PropTypes.any,
  user: PropTypes.object,
  onGearIconClicked: PropTypes.func,
  onItemClicked: PropTypes.func,
};
