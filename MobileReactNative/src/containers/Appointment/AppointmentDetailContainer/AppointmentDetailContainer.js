// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import I18n from 'react-native-i18n';
import {
  TEXT,
  WHITE,
  PALE_GRAY,
  PRIMARY_COLOR,
  PURPLISH_GREY,
  PALE_GRAY_TWO
} from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import { AlertMessage } from 'AppUtilities';
import { connectPatient, connectAppointment } from 'AppRedux';
import { SFMedium, SFRegular } from 'AppFonts';
import {
  NormalButton,
  Avatar,
  CalendarTopNav,
  CheckButton
} from 'AppComponents';
import RNCalendarEvents from 'react-native-calendar-events';
import Icon from 'react-native-vector-icons/Ionicons';
import Communications from 'react-native-communications';
import { get } from 'lodash';
import moment from 'moment';
import moment_timezone from 'moment-timezone';
import { compose } from 'recompose';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALE_GRAY
  },
  panel: {
    width: WINDOW_WIDTH - 24,
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 6,
    backgroundColor: WHITE
  },
  checkMark: {
    alignSelf: 'center',
    marginVertical: 25,
    backgroundColor: 'transparent'
  },
  title: {
    fontSize: 16,
    letterSpacing: 0.1,
    color: PURPLISH_GREY,
    alignSelf: 'center'
  },
  time: {
    fontSize: 16,
    letterSpacing: 0.1,
    color: PRIMARY_COLOR,
    marginTop: 30,
    marginBottom: 50,
    alignSelf: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: WINDOW_WIDTH - 20,
    borderTopColor: PALE_GRAY_TWO,
    borderTopWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20
  },
  avatar: {
    marginHorizontal: 10
  },
  info: {
    flex: 1,
    marginLeft: 10
  },
  textName: {
    color: TEXT,
    fontSize: 16,
    marginBottom: 3
  },
  textAddress: {
    color: TEXT,
    fontSize: 12
  },
  bookButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0
  },
  bookButtonTextStyle: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  },
  phoneView: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

/**
 * A `PureComponent` based class to show appointment/request details.
 * This class will be used in 2 cases.
 *   - 1. Tap on view details button from calendar
 *   - 2. After book/request an appointment
 * For the second case, if it's a direct booking, we ask users to add it on device calendar
 * We may require calendar access permission to add direct bookings on device calendar.
 */
export class AppointmentDetailContainer extends PureComponent {

  componentDidMount() {
    /**
     * If users get this page after direct booking
     * Ask them to add this booked appointment to device calendar
     */
    const { selectedAppointment, fromCalendar } = this.props;

    if (selectedAppointment.selected_time
      && selectedAppointment.selected_time !== 0
      && !fromCalendar
    ) {
      this.askIfNeeded();
    }
  }

  /**
   * Ask users to add booked appointment to phone calendar
   */
  askIfNeeded = () => {
    Alert.alert(
      'OpenMed',
      I18n.t('wantToAddToCalendar'),
      [
        { text: I18n.t('no') },
        {
          text: I18n.t('yes'),
          onPress: () => this.addToCalendar()
        }
      ]
    );
  };

  /**
   * Add an appointment to device calendar
   */
  addToCalendar = () => {
    const { selectedAppointment } = this.props;

    const provider = selectedAppointment.providers[0];

    /**
     * Request calendar access permission
     * @type {*|Promise}
     */
    RNCalendarEvents.authorizeEventStore()
      .then(status => {
        if (status === 'authorized') {
          /**
           * Add an appointment to phone calendar with provider full name and address
           */
          return RNCalendarEvents.saveEvent(`Accepted: Visit to ${provider.full_name}`,
            {
              location: `${provider.practice.address}`,
              startDate: moment.unix(selectedAppointment.selected_time).toISOString(),
              endDate: moment.unix(selectedAppointment.selected_time).add(1, 'h').toISOString()
            });
        }
        /**
         * Calendar access permission is denied.
         */
        return Promise.reject(I18n.t('cannotAccessToCalendar'));
      })
      .then(() => AlertMessage.showMessage('OpenMed', I18n.t('eventAddedToCalendar')))
      .catch(error => AlertMessage.fromRequest(error));
  };

  /**
   * Return a string that shows appointment result by appointment type.
   * Available Types - Request or Booking
   * @returns {*}
   */
  getTitle = () => {
    const { selectedAppointment } = this.props;

    if (selectedAppointment.status === 2 || selectedAppointment.status === 7) {
      return I18n.t('appointmentHasBeenConfirmed');
    }

    return I18n.t('appointmentHasBeenRequested');
  };

  /**
   * Return a string that shows appointment time in providers time zone.
   * @returns {*}
   */
  getTime = (provider) => {
    const { selectedAppointment } = this.props;

    const timezone = get(provider.practice, 'timezone.code', '');

    let desiredTime = null;

    // Confirmed appointments
    if (selectedAppointment.status === 2 || selectedAppointment.status === 7) {
      desiredTime = selectedAppointment.selected_time;
    }

    // Requested appointments with time
    if (selectedAppointment.desired_time && selectedAppointment.desired_time !== 0) {
      desiredTime = selectedAppointment.desired_time;
    }

    if (desiredTime) {
      const isoString = moment.unix(desiredTime);
      return moment_timezone(isoString).tz(timezone).format('dddd, MMM DD h:mm A');
    }

    // Appointments based on first available time
    return I18n.t('firstAvailableTime');
  };

  /**
   * Action listener of `Done` button
   * If this page came from new request/booking, go to calendar page.
   * Otherwise, just dismiss the view
   */
  onDone = () => {
    const { routeBack, switchTab, fromCalendar, resetAppointment } = this.props;
    routeBack();
    if (!fromCalendar) {
      resetAppointment({ providers: [] });
      switchTab(2);
    }
  };

  /**
   * Tap event listener of phone number
   * Call selected phone number using device phone call feature
   * @param phoneNumber
   */
  onPhoneNumberPressed = (phoneNumber) => {
    Communications
      .phonecall(phoneNumber.replace(/[-]/g, '').replace(/[+]/g, '').replace(/ /g, ''), true);
  };

  render() {
    const { activePatient: patient } = this.props.patient;
    const { selectedAppointment } = this.props;

    const getAvatar = (p) => {
      return p.photo_url ? { uri: p.photo_url } : null;
    };

    return (
      <View style={styles.container}>
        <CalendarTopNav
          activePatient={patient}
        />
        <View style={styles.panel}>
          <CheckButton
            size={70}
            style={styles.checkMark}
          />
          <SFMedium style={styles.title}>
            {this.getTitle()}
          </SFMedium>
          <SFMedium style={styles.time}>
            {this.getTime(selectedAppointment.providers[0])}
          </SFMedium>
          {selectedAppointment.providers.map((p, index) => {
            const provider = !!p.provider ? p.provider : p;
            const practice = !!p.practice ? p.practice : p;

            /**
             * Show phone number only for direct booking
             */
            let phoneNumbers = get(provider, 'phone_numbers', []);
            if (!selectedAppointment.is_direct_booking) { phoneNumbers = []; }

            return (
              <View key={index} style={styles.row}>
                <Avatar
                  source={getAvatar(provider)}
                  placeholder={provider}
                  style={styles.avatar}
                />
                <View style={styles.info}>
                  <SFMedium allowFontScaling={false} style={styles.textName}>
                    {provider.full_name}
                  </SFMedium>
                  {phoneNumbers.length > 0 &&
                    <TouchableOpacity
                      style={styles.phoneView}
                      onPress={() => this.onPhoneNumberPressed(phoneNumbers[0].phone)}
                    >
                      <Icon
                        name={'ios-call'}
                        size={20}
                        color={TEXT}
                      />
                      <SFRegular
                        allowFontScaling={false}
                        style={[styles.textAddress, { bottom: 2, left: 5 }]}
                        numberOfLines={1}
                      >
                        {phoneNumbers[0].phone}
                      </SFRegular>
                    </TouchableOpacity>
                  }
                  <SFRegular
                    allowFontScaling={false}
                    style={[styles.textAddress, { marginTop: 3 }]}
                    numberOfLines={1}
                  >
                    {practice.address}
                  </SFRegular>
                  <SFRegular
                    allowFontScaling={false}
                    style={styles.textAddress}
                    numberOfLines={1}
                  >
                    {[practice.address_2,
                      practice.address_3].filter(v => !!v).join(', ')}
                    {` ${practice.zip}`}
                  </SFRegular>
                </View>
              </View>
            );
          })}
        </View>
        <NormalButton
          text={I18n.t('done').toUpperCase()}
          style={styles.bookButton}
          textStyle={styles.bookButtonTextStyle}
          pressed={true}
          borderRadius={0}
          onPress={this.onDone}
        />
      </View>
    );
  }
}

AppointmentDetailContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  selectedAppointment: PropTypes.object.isRequired,
  resetAppointment: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  fromCalendar: PropTypes.bool.isRequired
};

export default compose(
  connectAppointment(),
  connectPatient(),
)(AppointmentDetailContainer);
