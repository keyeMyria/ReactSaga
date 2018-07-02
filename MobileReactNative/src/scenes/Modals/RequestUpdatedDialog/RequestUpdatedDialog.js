// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Platform } from 'react-native';
import I18n from 'react-native-i18n';
import { TEXT, TINT, SNOW } from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import { NormalButton, Panel, OMButton } from 'AppComponents';
import { connectAppointment } from 'AppRedux';
import { SFMedium, SFRegular } from 'AppFonts';
import moment from 'moment';
import FA from 'react-native-vector-icons/FontAwesome';
import { get } from 'lodash';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent'
      },
      android: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }
    }),
  },
  panel: {
    alignItems: 'center'
  },
  button: {
    width: WINDOW_WIDTH / 2 - 40,
    marginTop: 10,
    marginBottom: 20
  },
  textStyle: {
    fontFamily: 'SFUIText-Bold',
  },
  normalTextStyle: {
    fontFamily: 'SFUIText-Bold',
    color: TINT
  },
  textDate: {
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: 'transparent'
  },
  textTime: {
    color: TINT,
    backgroundColor: 'transparent'
  },
  textAddress: {
    marginBottom: 5,
    backgroundColor: 'transparent'
  },
  lightText: {
    color: SNOW,
    backgroundColor: 'transparent'
  }
});

export class RequestUpdatedDialog extends PureComponent {

  render() {
    const { selectedAppointment: appointment, time, dismissLightBox } = this.props;
    const { practice } = appointment;
    const newTimes = get(appointment, 'proposed_new_conditions.new_times', []);

    return (
      <View style={styles.container}>
        <Panel title={I18n.t('appointmentConfirmedFor')} style={styles.panel}>
          {newTimes.map((newTime, index) => (
            <View key={newTime} style={index === 0 ? { marginTop: 15 } : {}}>
              <OMButton
                primary={newTime === time}
                width={WINDOW_WIDTH * 2 / 3}
              >
                <SFMedium
                  allowFontScaling={false}
                  style={[styles.textDate, newTime === time ? styles.lightText : null]}
                >
                  {moment.unix(newTime).format('DD/MM/YY')}&nbsp;&nbsp;
                  <SFMedium
                    allowFontScaling={false}
                    style={[styles.textTime, newTime === time ? styles.lightText : null]}
                  >
                    {moment.unix(newTime).format('hh:mm A')}
                  </SFMedium>
                </SFMedium>
                <SFRegular
                  allowFontScaling={false}
                  style={[styles.textAddress, newTime === time ? styles.lightText : null]}
                  numberOfLines={2}
                >
                  <FA
                    name={'location-arrow'}
                    size={15}
                    color={newTime === time ? SNOW : TEXT}
                  />
                  {' '}
                  {[practice.address,
                    practice.city,
                    practice.region,
                    practice.zip].filter(v => !!v).join(', ')}
                </SFRegular>
              </OMButton>
            </View>
          ))}
          <NormalButton
            text={I18n.t('ok').toUpperCase()}
            style={styles.button}
            textStyle={styles.normalTextStyle}
            onPress={() => dismissLightBox()}
            borderWidth={1}
          />
        </Panel>
      </View>
    );
  }
}

RequestUpdatedDialog.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  selectedAppointment: PropTypes.object,
  time: PropTypes.any
};

export default connectAppointment()(RequestUpdatedDialog);
