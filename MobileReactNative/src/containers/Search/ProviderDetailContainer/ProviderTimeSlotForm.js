// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  FlatList,
} from 'react-native';
import I18n from 'react-native-i18n';
import { NormalButton } from 'AppComponents';
import {
  TEXT,
  WHITE,
  PURPLISH_GREY
} from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import { SFMedium, SFRegular } from 'AppFonts';
import { ProviderTimeSlotItem } from './ProviderTimeSlotItem';
import { get, sortBy } from 'lodash';

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center'
  },
  requestButton: {
    width: WINDOW_WIDTH * 0.6,
    marginBottom: 50
  },
  requestButtonLabel: {
    fontFamily: 'SFUIText-Regular',
    fontSize: 14,
    color: WHITE
  },
  timeLabel: {
    fontSize: 14,
    color: TEXT,
    marginBottom: 10
  },
  slotsContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(242, 243, 247, 1)',
    paddingTop: 10,
    paddingBottom: 14,
    marginTop: 11
  },
  pickLabel: {
    fontSize: 14,
    marginBottom: 9
  },
  directSlots: {
    width: WINDOW_WIDTH
  },
  title: {
    fontSize: 16,
    color: PURPLISH_GREY,
    marginLeft: 42
  }
});

export class ProviderTimeSlotForm extends Component {

  renderRow = ({ item }) => {
    const { onSlotClicked, provider } = this.props;

    return (
      <ProviderTimeSlotItem
        time={item.datetime}
        timezone={get(provider.practice, 'timezone.code', '')}
        onClick={time => onSlotClicked(time)}
      />
    );
  }

  render() {
    const {
      slots: directSlots,
      onRequestDifferentTime,
      appointmentType
    } = this.props;

    return (
      <View>
        <SFRegular style={styles.title}>
          {I18n.t('appointmentTime')}
        </SFRegular>
        <View style={styles.slotsContainer}>
          <SFMedium allowFontScaling={false} style={styles.pickLabel}>
            {I18n.t('pickATime')}
          </SFMedium>
          <FlatList
            style={[styles.directSlots,
              { width: directSlots.length * 80 > WINDOW_WIDTH
                ? WINDOW_WIDTH
                : directSlots.length * 80 }
            ]}
            data={sortBy(directSlots, 'datetime')}
            extraData={this.state}
            horizontal={true}
            renderItem={this.renderRow}
            keyExtractor={(item) => `#${item.datetime}`}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={directSlots.length * 80 > WINDOW_WIDTH}
            bounces={false}
            automaticallyAdjustContentInsets={false}
          />
        </View>
        {!!appointmentType.is_appointment_request &&
          <View style={styles.buttonContainer}>
            <SFMedium style={styles.timeLabel}>
              {I18n.t('timesAboveDoNotWork')}
            </SFMedium>
            <NormalButton
              text={I18n.t('requestDifferentTime').toUpperCase()}
              style={styles.requestButton}
              textStyle={styles.requestButtonLabel}
              dropShadow={true}
              pressed={true}
              onPress={onRequestDifferentTime}
            />
          </View>
        }
      </View>
    );
  }
}

ProviderTimeSlotForm.propTypes = {
  appointmentType: PropTypes.object.isRequired,
  provider: PropTypes.object.isRequired,
  slots: PropTypes.array.isRequired,
  onSlotClicked: PropTypes.func.isRequired,
  onRequestDifferentTime: PropTypes.func.isRequired,
};
