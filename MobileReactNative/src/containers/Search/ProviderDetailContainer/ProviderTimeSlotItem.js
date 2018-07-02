// @flow

import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  TEXT,
  TINT,
  WHITE,
} from 'AppColors';
import { SFMedium } from 'AppFonts';
import moment from 'moment-timezone';
import moment_timezone from 'moment-timezone';

const styles = StyleSheet.create({
  timeBlock: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    width: 70,
    height: 60,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: WHITE
  },
  textHour: {
    color: TINT,
    fontSize: 11
  },
  textDay: {
    color: TEXT,
    marginTop: 10,
    fontSize: 11
  }
});

export function ProviderTimeSlotItem({
  time,
  onClick,
  timezone
}) {
  const isoString = moment.unix(time);

  return (
    <TouchableOpacity
      onPress={() => onClick(time)}
      style={styles.timeBlock}
    >
      <SFMedium allowFontScaling={false} style={styles.textHour}>
        {moment_timezone(isoString).tz(timezone).format('hh:mm A')}
      </SFMedium>
      <SFMedium allowFontScaling={false} style={styles.textDay}>
        {moment_timezone(isoString).tz(timezone).format('MM/DD/YY')}
      </SFMedium>
    </TouchableOpacity>
  );
}

ProviderTimeSlotItem.propTypes = {
  time: PropTypes.number.isRequired,
  timezone: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};
