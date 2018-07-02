// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import moment from 'moment';
import _ from 'lodash';
import {
  Avatar,
  CalendarTopNav,
  PatientListModal
} from 'AppComponents';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import I18n from 'react-native-i18n';
import { getDistance, AlertMessage } from 'AppUtilities';
import { WINDOW_WIDTH } from 'AppConstants';
import {
  connectAuth,
  connectProvider,
  connectPatient,
  connectLocation,
  connectActivity,
  connectAppointment
} from 'AppRedux';
import {
  TEXT,
  TINT,
  DARK_GRAY,
  PRIMARY_COLOR,
  WHITE
} from 'AppColors';
import { compose } from 'recompose';
import RNCalendarEvents from 'react-native-calendar-events';
import EventCalendar from 'react-native-events-calendar';
import Icon from 'react-native-vector-icons/Ionicons';
import moment_timezone from 'moment-timezone';

const styles = {
  flex: {
    flex: 1
  },
  warpEvent: {
    flex: 1,
    padding: 10
  },
  infoEvent: {
    flexDirection: 'row',
    flex: 1
  },
  colInfo: {
    flex: 1
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20
  },
  txtName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: TEXT
  },
  txtStyle: {
    color: TEXT,
  }
};

/**
 * A `PureComponent` based class to render appointment on time line.
 * Sync device calendar's events and showing appointment status.
 * Caution: We are showing all times in provider's time zone!
 */
export class CalendarWeekContainer extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      borderAva: true,
      events: [],
      isNavBarExpanded: false,
      isCalendarAllowed: false
    };
  }

  componentWillMount() {
    /**
     * Sync all events from phone calendar on startup
     */
    this.getDeviceEvents();
  }

  /**
   * Accept another propose from provider
   * This may was not needed on this calendar page but keeps it for further work!
   */
  onProposeSuccess = () => {
    const { showLightBox, dismissLightBox } = this.props;
    dismissLightBox();

    setTimeout(() => {
      showLightBox('RequestSuccessDialog', null,
        { backgroundBlur: 'dark',
          backgroundColor: 'transparent',
          tapBackgroundToDismiss: true
        });
    }, 1000);
  };

  /**
   * Propose another time for the selected appointment
   * This may was not needed on this calendar page but keeps it for further work!
   * @param appt
   */
  onProposeAnotherTime = (appt) => {
    const { showLightBox, dismissLightBox } = this.props;
    dismissLightBox();

    setTimeout(() => {
      showLightBox('RequestProposeTimeDialog',
        { selectedAppointment: appt,
          onProposeSuccess: this.onProposeSuccess },
        { backgroundBlur: 'dark',
          backgroundColor: 'transparent',
          tapBackgroundToDismiss: true
        });
    }, 1000);
  };

  /**
   * Go to appointment detail page
   * @param appt
   */
  onViewAppointmentDetails = (appt) => {
    const { dismissLightBox, routeScene } = this.props;
    dismissLightBox();

    setTimeout(() => {
      routeScene('AppointmentDetailScene',
        {
          fromCalendar: true,
          selectedAppointment: {
            ...appt,
            providers: [{ ...appt.provider, practice: appt.practice }]
          },
        }, {
          navigatorStyle: {
            navBarHidden: true,
            tabBarHidden: false
          }
        });
    }, 1000);
  };

  /**
   * Appointment item on time line view was clicked.
   * Show a modal to view details, cancel appointment
   * @param appointment
   */
  onPressAppointment = (appointment) => {
    this.props.showLightBox('RequestActionDialog',
      { selectedAppointment: appointment,
        onProposeAnotherTime: this.onProposeAnotherTime,
        onViewDetails: this.onViewAppointmentDetails },
      { backgroundBlur: 'dark',
        backgroundColor: 'transparent',
        tapBackgroundToDismiss: true
      });
  };

  /**
   * Function to get all events from phone calendar
   * Get around a month before and after of current date
   */
  getDeviceEvents = () => {
    const { selectedDate } = this.props;

    const startDate = moment(selectedDate).subtract(30, 'days').toISOString();
    const endDate = moment(selectedDate).add(30, 'days').toISOString();

    RNCalendarEvents.authorizeEventStore()
      .then(status => {
        // handle status
        if (status === 'authorized') {
          this.setState({ isCalendarAllowed: true });
          return RNCalendarEvents.fetchAllEvents(startDate, endDate, ['1']);
        }
        return Promise.reject(I18n.t('cannotAccessToCalendar'));
      })
      .then(events => this.setState({ events }))
      .catch(error => AlertMessage.fromRequest(error));
  };

  /**
   * Render appointment on time line view
   * Check if appointment was added on phone calendar or not
   * If it was not added, draw calendar icon in gray color and enable.
   * If it was added, draw calendar icon in `TINT` color and disable.
   * @param appointment
   * @returns {XML}
   */
  renderEvent = (appointment) => {
    const { region } = this.props.location;

    const getAvatar = (provider) => {
      return provider.photo_url
        ? { uri: provider.photo_url }
        : null;
    };

    const { provider, practice } = appointment;

    // eslint-disable-next-line
    const exist = _.find(this.state.events, event => moment(new Date(event.startDate)).diff(moment.unix(appointment.selected_time)) === 0);

    return (
      <TouchableOpacity
        style={styles.warpEvent}
        onPress={() => this.onPressAppointment(appointment)}
      >
        <View style={styles.infoEvent}>
          <View style={styles.colInfo}>
            <Text allowFontScaling={false} style={styles.txtName} numberOfLines={1}>
              {[provider.pre_name,
                provider.first_name,
                provider.last_name].filter(v => !!v).join(' ')}
            </Text>
            <View style={{ flexDirection: 'row', marginRight: 20 }}>
              <FontAwesome
                name={'location-arrow'}
                size={15}
                color={TEXT}
                style={{ marginTop: 5 }}
              />
              <Text
                allowFontScaling={false}
                style={[styles.txtStyle, { marginTop: 5, fontSize: 11, marginLeft: 5 }]}
                numberOfLines={2}
              >
                {' '}
                {region ? ` ${getDistance(practice, region)}, ` : ''}
                {[practice.address,
                  practice.city,
                  practice.region,
                  practice.zip].filter(v => !!v).join(', ')}
              </Text>
            </View>
          </View>
          <Avatar source={getAvatar(provider)} placeholder={provider} style={styles.avatar} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Icon
            name={'md-calendar'}
            size={20}
            color={!!exist ? TINT : '#ccc'}
            onPress={() => !exist && this.onAddCalendarEvent(appointment)}
          />
          <Text
            allowFontScaling={false}
            style={[styles.txtStyle, { marginLeft: 5, fontWeight: 'bold', fontSize: 12 }]}
          >
            {moment(appointment.start).format('hh:mm A')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Function to add an appointment to phone calendar
   * Need to check calendar permission first
   * `RNCalendarEvents` accepts only ISO string for dates
   * @param appointment
   */
  onAddCalendarEvent = (appointment) => {
    const { provider, practice } = appointment;
    const { isCalendarAllowed } = this.state;

    /**
     * Request calendar access permission if it's not granted yet.
     * @type {*|Promise}
     */
    let promise = RNCalendarEvents.authorizeEventStore();
    if (isCalendarAllowed) {
      promise = Promise.resolve('authorized');
    }

    promise
      .then(status => {
        if (status === 'authorized') {
          /**
           * Calendar access permission is granted.
           */
          this.setState({ isCalendarAllowed: true });

          /**
           * Add an appointment to phone calendar with provider full name and address
           */
          return RNCalendarEvents.saveEvent(`Accepted: Visit to ${provider.full_name}`,
            {
              location: `${practice.address}`,
              startDate: moment.unix(appointment.selected_time).toISOString(),
              endDate: moment.unix(appointment.selected_time).add(1, 'h').toISOString()
            });
        }
        /**
         * Calendar access permission is denied.
         */
        return Promise.reject(I18n.t('cannotAccessToCalendar'));
      })
      .then(() => {
        /**
         * Re-sync events from phone calendar
         * So that we can refresh appointments status that shows it's added on phone or not
         */
        this.getDeviceEvents();
        AlertMessage.showMessage('OpenMed', I18n.t('eventAddedToCalendar'));
      })
      .catch(error => AlertMessage.fromRequest(error));
  };

  /**
   * Expand patients modal from top nav bar
   */
  expandNavBar = () => {
    const { isNavBarExpanded } = this.state;
    this.setState({ isNavBarExpanded: !isNavBarExpanded });

    if (isNavBarExpanded) {
      this.patientListModal.hide();
    } else {
      this.patientListModal.show();
    }
  };

  /**
   * Add a new patient from patients modal
   */
  onAddPatient = () => {
    this.expandNavBar();

    this.props.routeScene('AddProfileScene', null, {
      title: I18n.t('addMember'),
      backButtonTitle: '',
      navigatorStyle: {
        navBarHidden: false,
        tabBarHidden: false,
        navBarBackgroundColor: WHITE,
        navBarTextColor: DARK_GRAY,
        navBarButtonColor: PRIMARY_COLOR,
      },
      overrideBackPress: true
    });
  };

  /**
   * Other patient was selected from patients modal
   * Need to refresh calendar page by changed active patient's appointments
   * @param item : selected patient
   */
  onPatientSelected = (item) => {
    const { patient, setCurrentPatient } = this.props;
    const { activePatient } = patient;

    if (activePatient.id === item.id) {
      return;
    }

    setCurrentPatient(item);
    this.expandNavBar();
  };

  render() {
    const { selectedDate, routeBack } = this.props;
    const { activePatient: patient, patients } = this.props.patient;
    const { isNavBarExpanded } = this.state;
    const { appointments } = this.props.appointment;

    /**
     * Filter events by `selected_time`
     * This means we are showing only confirmed appointments
     * Need some complex transformation of date to show the times in providers timezone
     */
    const appts = appointments.filter(appt =>
      appt.selected_time && appt.selected_time !== 0 && (appt.status === 2 || appt.status === 7));
    const events = appts.map(appointment => {
      const timezone = _.get(appointment.practice, 'timezone.code', '');
      const isoString = moment.unix(appointment.selected_time);

      return {
        ...appointment,
        start: moment(
          new Date(moment_timezone(isoString).tz(timezone).format('YYYY/MM/DD hh:mm:ss A'))
        ).toISOString()
      };
    });

    return (
      <View style={styles.flex}>
        <CalendarTopNav
          activePatient={patient}
          onBack={routeBack}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
        />
        <EventCalendar
          events={events}
          width={WINDOW_WIDTH}
          renderEvent={this.renderEvent}
          styles={{ event: { flexDirection: 'row' } }}
          initDate={selectedDate}
          scrollToFirst
        />
        <PatientListModal
          ref={ref => this.patientListModal = ref}
          patients={patients}
          onAddPatient={this.onAddPatient}
          onPatientSelected={this.onPatientSelected}
          onBackgroundClicked={this.expandNavBar}
        />
      </View>
    );
  }
}

CalendarWeekContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  selectedDate: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  activity: PropTypes.object.isRequired,
  provider: PropTypes.object.isRequired,
  setCurrentPatient: PropTypes.func.isRequired,
  appointment: PropTypes.object.isRequired,
};

export default compose(
  connectAuth(),
  connectProvider(),
  connectPatient(),
  connectLocation(),
  connectActivity(),
  connectAppointment()
)(CalendarWeekContainer);
