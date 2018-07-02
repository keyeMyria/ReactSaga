// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text, Platform } from 'react-native';
import I18n from 'react-native-i18n';
import { TEXT, FIRE, TINT, PLACEHOLDER } from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import { NormalButton, Panel } from 'AppComponents';
import { connectAppointment } from 'AppRedux';
import { SFRegular, SFMedium } from 'AppFonts';
import moment from 'moment';
import Picker from 'rmc-picker';
import { filter, find, isEmpty } from 'lodash';

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
  label: {
    fontSize: 16,
    color: TEXT,
    width: 250,
    textAlign: 'center',
    marginTop: 20
  },
  description: {
    fontSize: 12,
    width: WINDOW_WIDTH * 3 / 4,
    color: PLACEHOLDER,
    textAlign: 'center',
    marginVertical: 10
  },
  notAvailable: {
    fontSize: 14,
    width: WINDOW_WIDTH * 3 / 4,
    height: 40,
    color: FIRE,
    textAlign: 'center'
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  rowPickers: {
    flexDirection: 'row',
    justifyContent: 'space-around'

  },
  datePickerStyle: {
    width: WINDOW_WIDTH * 1 / 3,
    marginTop: 10
  },
  datePickerItemStyle: {
    textAlign: 'right'
  },
  colTimePicker: {
    flexDirection: 'row',
    width: WINDOW_WIDTH * 1 / 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  timePickerStyle: {
    width: 30,
    marginTop: 10
  },
  rowPickersIos: {
    flex: 1,
    flexDirection: 'row',
    borderColor: 'red',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    width: WINDOW_WIDTH / 2 - 40,
    marginHorizontal: 5
  },
  textStyle: {
    fontFamily: 'SFUIText-Bold',
  },
  normalTextStyle: {
    fontFamily: 'SFUIText-Bold',
    color: TINT
  }
});

export class SelectTimeDialog extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      error: '',
      firstAvailable: true,
      day: 0,
      hour: 12,
      minute: 0,
      time: moment().hour() >= 12 ? 'PM' : 'AM',
      disabled: false
    };
  }

  componentWillMount() {
    this.checkMinTime();
  }

  onChangeDay = (value) => {
    this.setState({ day: value }, this.checkMinTime.bind(this));
  };

  onChangeHour = (value) => {
    this.setState({ hour: value }, this.checkMinTime.bind(this));
  };

  onChangeMinute = (value) => {
    this.setState({ minute: value }, this.checkMinTime.bind(this));
  };

  onChangeTime = (value) => {
    this.setState({ time: value }, this.checkMinTime.bind(this));
  };

  checkMinTime = () => {
    const { providers } = this.props.appointment;

    const date = this.getDate();

    const disabled = date.diff(moment()) < 0;

    this.setState({ disabled, error: '' });

    if (disabled) {
      return;
    }

    let error = '';
    for (const provider of providers) {
      const workingHours = filter(provider.provider.working_time, { week_day_num: date.day() });

      if (!workingHours || !workingHours.length) {
        error = I18n.t('providerNotAvailable',
          { ...provider.provider, date: date.format('MMM/DD') }
        );
      }
      const workingHour = find(workingHours, (wh) => {
        return (date.format('HH:mm:ss') >= wh.start_time &&
          date.format('HH:mm:ss') < wh.end_time);
      });
      if (!workingHour) {
        error = I18n.t('providerAvailableTime', {
          ...provider.provider
        });
      }
    }

    this.setState({ error });
  };

  getDate = () => {
    return moment()
      .startOf('day')
      .add(this.state.day, 'days')
      .add(this.state.hour, 'hours')
      .add(this.state.time === 'PM' ? 12 : 0, 'hours')
      .add(this.state.minute, 'minutes');
  };

  confirm = () => {
    const { setAppointmentTime, onConfirmTimeRequest } = this.props;

    if (!this.state.disabled && isEmpty(this.state.error)) {
      const date = this.getDate();
      setAppointmentTime({ time: moment(date).unix() });
      onConfirmTimeRequest(moment(date).unix());
    }
  };

  onCancel = () => {
    this.props.dismissLightBox();
  };

  render() {
    const { providers } = this.props.appointment;

    const dates = [];
    const hours = [];
    const minutes = [];
    const timetable = ['AM', 'PM'];

    for (let day = 0; day < 30; day++) {
      dates.push(day);
    }
    for (let hour = 0; hour < 12; hour++) {
      hours.push(hour);
    }
    for (let minute = 0; minute < 60; minute += 5) {
      minutes.push(minute);
    }

    const panelStyle = {
      alignItems: 'center'
    };

    if (Platform.OS === 'android') {
      panelStyle.minHeight = 520;
    }

    return (
      <View style={styles.container}>
        <Panel
          title={providers.length === 1
            ? [providers[0].provider.pre_name,
              providers[0].provider.first_name,
              providers[0].provider.last_name].join(' ')
            : ''}
          style={panelStyle}
        >
          <SFMedium allowFontScaling={false} style={styles.label}>
            {I18n.t('pickDateTimeToRequest')}
          </SFMedium>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 10,
              paddingBottom: 10
            }}
          >
            <Picker
              style={{ flex: 1 }}
              pickerStyle={styles.datePickerStyle}
              selectedValue={this.state.day}
              onValueChange={this.onChangeDay}
            >
              {dates.map(date =>
                <Picker.Item
                  key={date}
                  value={date}
                  itemStyle={styles.timePickerItemStyle}
                >
                  {date === 0
                    ? I18n.t('today')
                    : moment().startOf('day').add(date, 'days').format('ddd MMM DD')}
                </Picker.Item>
              )}
            </Picker>
            <Picker
              style={{ width: 40 }}
              pickerStyle={styles.timePickerStyle}
              selectedValue={this.state.hour}
              onValueChange={this.onChangeHour}
            >
              {hours.map(hour =>
                <Picker.Item
                  key={hour}
                  value={hour}
                  itemStyle={styles.timePickerItemStyle}
                >
                  {moment().startOf('day').add(hour, 'hours').format('hh')}
                </Picker.Item>
              )}
            </Picker>
            <Text allowFontScaling={false}>:</Text>
            <Picker
              style={{ width: 40 }}
              pickerStyle={styles.timePickerStyle}
              selectedValue={this.state.minute}
              onValueChange={this.onChangeMinute}
            >
              {minutes.map(minute =>
                <Picker.Item
                  key={minute}
                  value={minute}
                  itemStyle={styles.timePickerItemStyle}
                >
                  {moment().startOf('day').add(minute, 'minutes').format('mm')}
                </Picker.Item>
              )}
            </Picker>
            <Picker
              style={{ width: 40 }}
              pickerStyle={styles.timePickerStyle}
              selectedValue={this.state.time}
              onValueChange={this.onChangeTime}
            >
              {timetable.map(time =>
                <Picker.Item
                  key={time}
                  value={time}
                  itemStyle={styles.timePickerItemStyle}
                >
                  {time}
                </Picker.Item>
              )
              }
            </Picker>
          </View>

          <View style={styles.buttons}>
            <NormalButton
              text={I18n.t('cancel').toUpperCase()}
              style={styles.button}
              textStyle={styles.normalTextStyle}
              onPress={() => this.onCancel()}
              borderWidth={1}
            />
            <NormalButton
              text={I18n.t('request').toUpperCase()}
              style={styles.button}
              textStyle={styles.textStyle}
              pressed={isEmpty(this.state.error) && !this.state.disabled}
              onPress={() => this.confirm()}
              dropShadow={true}
              disabled={!isEmpty(this.state.error) || this.state.disabled}
            />
          </View>
          <SFRegular allowFontScaling={false} style={styles.notAvailable}>
            {this.state.error}
          </SFRegular>
          <SFRegular allowFontScaling={false} style={styles.description}>
            {I18n.t('theProviderMustAcceptYourRequest')}
          </SFRegular>
        </Panel>
      </View>
    );
  }
}

SelectTimeDialog.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  onConfirmTimeRequest: PropTypes.func,
  dismissLightBox: PropTypes.func.isRequired,
  setAppointmentTime: PropTypes.func.isRequired,
  appointment: PropTypes.object.isRequired,
};

export default connectAppointment()(SelectTimeDialog);
