// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text, Platform } from 'react-native';
import I18n from 'react-native-i18n';
import { TEXT, FIRE, TINT, PLACEHOLDER } from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import { NormalButton, Panel, Loading } from 'AppComponents';
import { connectAppointment, connectPatient } from 'AppRedux';
import { SFMedium, SFRegular } from 'AppFonts';
import { promisify, AlertMessage } from 'AppUtilities';
import moment from 'moment';
import Picker from 'rmc-picker';
import { compose } from 'recompose';

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
  },
  smallLabel: {
    fontSize: 14,
    marginVertical: 5
  }
});

export class RequestProposeTimeDialog extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      firstAvailable: true,
      day: 0,
      hour: 12,
      minute: 0,
      time: moment().hour() >= 12 ? 'PM' : 'AM',
      isProposing: false
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
    const date = this.getDate();
    this.setState({ disabled: date.diff(moment()) < 0 });
  };

  getDate = () => {
    return moment()
      .startOf('day')
      .add(this.state.day, 'days')
      .add(this.state.hour, 'hours')
      .add(this.state.time === 'PM' ? 12 : 0, 'hours')
      .add(this.state.minute, 'minutes');
  };

  onFirstAvailable = () => {
    const {
      selectedAppointment,
      onProposeSuccess,
      proposeNewAppointment,
      patient
    } = this.props;

    if (!this.state.disabled) {
      this.setState({ isProposing: true });

      // @TODO : need to determine to use either unix or formatted string for `desired_time`
      promisify(proposeNewAppointment, {
        appointmentId: selectedAppointment.id,
        userId: patient.activePatient.id
      }).then(() => onProposeSuccess())
        .catch((error) => AlertMessage.fromRequest(error))
        .finally(() => this.setState({ isProposing: false }));
    }
  };

  onDecline = () => {
    this.props.dismissLightBox();
  };

  onPropose = () => {
    const {
      selectedAppointment,
      onProposeSuccess,
      proposeNewAppointment,
      patient
    } = this.props;

    if (!this.state.disabled) {
      const date = this.getDate();

      this.setState({ isProposing: true });

      // @TODO : need to determine to use either unix or formatted string for `desired_time`
      promisify(proposeNewAppointment, {
        appointmentId: selectedAppointment.id,
        desiredTime: moment(date).unix(),
        userId: patient.activePatient.id
      }).then(() => onProposeSuccess())
        .catch((error) => AlertMessage.fromRequest(error))
        .finally(() => this.setState({ isProposing: false }));
    }
  };

  render() {
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
        <Panel style={panelStyle}>
          <SFMedium allowFontScaling={false} style={styles.label}>
            {I18n.t('wouldYouLikeToProposeANewTime')}
          </SFMedium>
          <NormalButton
            text={I18n.t('firstAvailable').toUpperCase()}
            style={[styles.button, { width: WINDOW_WIDTH * 0.5, marginVertical: 15 }]}
            textStyle={styles.textStyle}
            pressed={true}
            onPress={() => this.onFirstAvailable()}
            dropShadow={true}
          />
          <SFRegular allowFontScaling={false} style={styles.smallLabel}>
            {I18n.t('or').toLowerCase()}
          </SFRegular>
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
              text={I18n.t('no').toUpperCase()}
              style={styles.button}
              textStyle={styles.normalTextStyle}
              onPress={() => this.onDecline()}
              borderWidth={1}
            />
            <NormalButton
              text={I18n.t('yes').toUpperCase()}
              style={styles.button}
              textStyle={styles.textStyle}
              pressed={!this.state.disabled}
              onPress={() => this.onPropose()}
              dropShadow={true}
              disabled={this.state.disabled}
            />
          </View>
        </Panel>
        {this.state.isProposing && <Loading showOverlay={true} />}
      </View>
    );
  }
}

RequestProposeTimeDialog.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  selectedAppointment: PropTypes.object.isRequired,
  onProposeSuccess: PropTypes.func.isRequired,
  declineAppointment: PropTypes.func.isRequired,
  proposeNewAppointment: PropTypes.func.isRequired,
  updateAppointment: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
};

export default compose(
  connectAppointment(),
  connectPatient(),
)(RequestProposeTimeDialog);
