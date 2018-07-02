// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { SFMedium, SFSemiBold } from 'AppFonts';
import { get } from 'lodash';
import I18n from 'react-native-i18n';

const CALENDAR_TOPBAR_HEIGHT = 50;
const CALENDAR_ROW_HEIGHT = 40;
const WEEK_NAMES = I18n.t('dayHeadings'); // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  topBar: {
    height: CALENDAR_TOPBAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F6',
    paddingHorizontal: 10
  },
  title: {
    color: '#615B73',
    fontSize: 16
  },
  weekRow: {
    height: CALENDAR_ROW_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 5
  },
  weekNames: {
    fontSize: 12,
    color: '#9599B4'
  },
  dayView: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center'
  },
  day: {
    fontSize: 16,
    color: '#615B73'
  },
  event: {
    borderRadius: 21,
    borderWidth: 4,
  },
  outerCircle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    borderRadius: 21
  },
  innerCircle: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 34,
    height: 34,
    borderRadius: 17
  },
  leftWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 21,
    height: 42
  },
  halfCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    width: 21,
    height: 42,
    borderRadius: 21
  },
});

const STATUS_COLORS = {
  new: '#FFA500',
  accepted: '#03E010',
  waiting: '#7F48FB'
};

export class SimpleCalendar extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      currentDate: new Date()
    };
  }

  goToNextMonth = (offset) => {
    this.setState({ currentDate: moment(this.state.currentDate).subtract(offset, 'months') });
  };

  renderCalendarTopBar = () => {
    return (
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => this.goToNextMonth(1)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon
            name={'keyboard-arrow-left'}
            size={30}
            color={'#9599B4'}
          />
        </TouchableOpacity>
        <SFMedium style={styles.title}>
          {moment(this.state.currentDate).format('MMMM YYYY')}
        </SFMedium>
        <TouchableOpacity
          onPress={() => this.goToNextMonth(-1)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon
            name={'keyboard-arrow-right'}
            size={30}
            color={'#9599B4'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  renderWeekNames = () => {
    return (
      <View style={styles.weekRow}>
        {WEEK_NAMES.map(name => {
          return (
            <View key={name} style={styles.dayView}>
              <SFSemiBold style={styles.weekNames}>
                {name}
              </SFSemiBold>
            </View>
          );
        })}
      </View>
    );
  };

  getDaysByWeek = () => {
    const { currentDate } = this.state;

    const startDate = moment(currentDate).startOf('month');
    const endDate = moment(currentDate).endOf('month');

    let startOfFirstWeek = moment(startDate).startOf('week');

    if (moment(startOfFirstWeek).format('DD') === '02') {
      startOfFirstWeek = moment(startOfFirstWeek).add(-7, 'days');
    }

    const startOfLastWeek = moment(endDate).startOf('week').add(1, 'days');

    const weeks = [];

    do {
      const days = [];

      for (let i = 0; i < 7; i++) {
        days.push(moment(startOfFirstWeek).add(i, 'days'));
      }

      startOfFirstWeek = moment(startOfFirstWeek).add(7, 'days');
      weeks.push(days);
    } while (startOfFirstWeek.format('YYYY-MM-DD') <= startOfLastWeek.format('YYYY-MM-DD'));

    return weeks;
  };

  isInMonth = (day) => {
    return moment(this.state.currentDate).month() === moment(day).month();
  };

  renderSingleEventDay = (day, status) => {
    const eventColor = get(STATUS_COLORS, status, 'transparent');

    return (
      <TouchableOpacity
        key={moment(day).format('YYYY-MM-DD')}
        style={[styles.dayView, styles.event,
          { borderColor: eventColor }
        ]}
        onPress={() => this.props.onDateSelect(day)}
      >
        <SFSemiBold style={[styles.day, { opacity: this.isInMonth(day) ? 1 : 0.5 }]}>
          {parseInt(moment(day).format('DD'), 10)}
        </SFSemiBold>
      </TouchableOpacity>
    );
  };

  renderTwoEventDay = (day, statusArray) => {
    const eventColor1 = get(STATUS_COLORS, statusArray[0], 'transparent');
    const eventColor2 = get(STATUS_COLORS, statusArray[1], 'transparent');

    return (
      <TouchableOpacity
        key={moment(day).format('YYYY-MM-DD')}
        style={styles.dayView}
        onPress={() => this.props.onDateSelect(day)}
      >
        <View style={[styles.outerCircle, { backgroundColor: eventColor1 }]}>
          <View style={styles.leftWrap}>
            <View
              style={[
                styles.halfCircle,
                {
                  backgroundColor: eventColor2,
                  transform: [
                    { translateX: 21 / 2 },
                    { rotate: '180deg' },
                    { translateX: -21 / 2 },
                  ],
                },
              ]}
            />
          </View>
          <View style={styles.innerCircle}>
            <SFSemiBold style={[styles.day, { opacity: this.isInMonth(day) ? 1 : 0.5 }]}>
              {parseInt(moment(day).format('DD'), 10)}
            </SFSemiBold>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderThreeEventDay = (day, statusArray) => {
    const eventColor1 = get(STATUS_COLORS, statusArray[0], 'transparent');
    const eventColor2 = get(STATUS_COLORS, statusArray[1], 'transparent');
    const eventColor3 = get(STATUS_COLORS, statusArray[2], 'transparent');

    return (
      <TouchableOpacity
        key={moment(day).format('YYYY-MM-DD')}
        style={styles.dayView}
        onPress={() => this.props.onDateSelect(day)}
      >
        <View style={[styles.outerCircle, { backgroundColor: eventColor1 }]}>
          <View style={styles.leftWrap}>
            <View
              style={[
                styles.halfCircle,
                {
                  backgroundColor: eventColor2,
                  transform: [
                    { translateX: 21 / 2 },
                    { rotate: '180deg' },
                    { translateX: -21 / 2 },
                  ],
                },
              ]}
            />
          </View>
          <View style={styles.leftWrap}>
            <View
              style={[
                styles.halfCircle,
                {
                  backgroundColor: eventColor3,
                  transform: [
                    { translateX: 21 / 2 },
                    { rotate: '90deg' },
                    { translateX: -21 / 2 },
                  ],
                },
              ]}
            />
          </View>
          <View style={styles.innerCircle}>
            <SFSemiBold style={[styles.day, { opacity: this.isInMonth(day) ? 1 : 0.5 }]}>
              {parseInt(moment(day).format('DD'), 10)}
            </SFSemiBold>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderDay = (day) => {
    const { events, onDateSelect } = this.props;
    const eventOfDays = get(events, moment(day).format('YYYY-MM-DD'), []);

    if (eventOfDays.length === 1) {
      return this.renderSingleEventDay(day, eventOfDays[0]);
    } else if (eventOfDays.length === 2) {
      return this.renderTwoEventDay(day, eventOfDays);
    } else if (eventOfDays.length === 3) {
      return this.renderThreeEventDay(day, eventOfDays);
    }

    return (
      <TouchableOpacity
        key={moment(day).format('YYYY-MM-DD')}
        style={styles.dayView}
        onPress={() => onDateSelect(day)}
      >
        <SFSemiBold style={[styles.day, { opacity: this.isInMonth(day) ? 1 : 0.5 }]}>
          {parseInt(moment(day).format('DD'), 10)}
        </SFSemiBold>
      </TouchableOpacity>
    );
  };

  renderCalendar = () => {
    const weeks = this.getDaysByWeek();

    return (
      <View>
        {this.renderWeekNames()}
        {weeks.map((week, index) =>
          (
            <View key={index} style={styles.weekRow}>
              {week.map((day, i) => this.renderDay(day, i))}
            </View>
          )
        )}
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this.renderCalendarTopBar()}
        {this.renderCalendar()}
      </View>
    );
  }
}

SimpleCalendar.propTypes = {
  events: PropTypes.object.isRequired,
  onDateSelect: PropTypes.func.isRequired,
};
