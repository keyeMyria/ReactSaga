// @flow

import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
} from 'react-native';
import I18n from 'react-native-i18n';
import { NormalButton } from 'AppComponents';
import {
  PURPLISH_GREY,
  PRIMARY_COLOR
} from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import { SFRegular } from 'AppFonts';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 42,
    marginBottom: 30
  },
  buttonContainer: {
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    color: PURPLISH_GREY
  },
  requestButton: {
    width: WINDOW_WIDTH - 42 * 2,
    height: 50
  },
  requestButtonLabel: {
    fontSize: 14,
    color: PRIMARY_COLOR
  }
});

export function ProviderTimeActionForm({
  onSelectTime
}) {
  return (
    <View style={styles.container}>
      <SFRegular style={styles.title}>
        {I18n.t('appointmentTime')}
      </SFRegular>
      <View style={styles.buttonContainer}>
        <NormalButton
          text={I18n.t('firstAvailableTime').toUpperCase()}
          style={[styles.requestButton, { marginTop: 19 }]}
          textStyle={styles.requestButtonLabel}
          borderWidth={1}
          borderRadius={25}
          onPress={() => onSelectTime(true)}
          singleColorButton={true}
        />
        <NormalButton
          text={I18n.t('selectTime').toUpperCase()}
          style={[styles.requestButton, { marginVertical: 19 }]}
          textStyle={styles.requestButtonLabel}
          borderWidth={1}
          borderRadius={25}
          pressed={false}
          onPress={() => onSelectTime(false)}
          singleColorButton={true}
        />
      </View>
    </View>
  );
}

ProviderTimeActionForm.propTypes = {
  onSelectTime: PropTypes.func.isRequired,
};
