// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  AsyncStorage,
} from 'react-native';
import _ from 'lodash';
import {
  CalendarTopNav,
  PatientListModal,
  CalendarProviderListItem,
  SimpleCalendar
} from 'AppComponents';
import I18n from 'react-native-i18n';
import {
  WINDOW_WIDTH, WINDOW_HEIGHT,
  NAVBAR_HEIGHT, NAV_TAB_BAR_HEIGHT,
  STATUSBAR_HEIGHT
} from 'AppConstants';
import { SFSemiBold, SFBold } from 'AppFonts';
import {
  connectAuth, connectAppointment,
  connectPatient, connectLocation, connectActivity
} from 'AppRedux';
import { withEmitter, promisify } from 'AppUtilities';
import { PrivacyContainer, WelcomeContainer } from 'AppContainers';
import {
  BACKGROUND_GRAY,
  PLACEHOLDER, BORDERLINE,
  DARK_GRAY, PRIMARY_COLOR,
  WHITE, BLACK, LIGHT_GRAY
} from 'AppColors';
import { compose } from 'recompose';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavData } from 'AppConnectors';
import moment_timezone from 'moment-timezone';
import moment from 'moment';

const ROW_ITEM_HEIGHT = 90;
const CALENDAR_HEIGHT = 380;
const CALENDAR_TAB_BAR_HEIGHT = 53;
const CALENDAR_TIP_HEIGHT = 50;

const scrollViewHeight = WINDOW_HEIGHT
  - NAVBAR_HEIGHT
  - NAV_TAB_BAR_HEIGHT
  - STATUSBAR_HEIGHT;

const styles = {
  flex: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_GRAY,
    flexDirection: 'column'
  },
  list: {
    width: WINDOW_WIDTH
  },
  contentContainer: {
    paddingBottom: NAVBAR_HEIGHT
  },
  panel: {
    height: ROW_ITEM_HEIGHT,
    marginTop: 10,
    justifyContent: 'center'
  },
  tab: {
    backgroundColor: WHITE,
    flexDirection: 'row'
  },
  tabItem: {
    width: WINDOW_WIDTH / 4,
    height: 40,
    paddingTop: 3,
    flexDirection: 'row',
    borderBottomColor: WHITE,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  descriptionView: {
    width: WINDOW_WIDTH,
    height: 50,
    paddingHorizontal: 15,
    justifyContent: 'center',
    backgroundColor: BORDERLINE
  },
  description: {
    paddingTop: 10,
    color: DARK_GRAY,
    fontSize: 12
  },
  clearTipButtonView: {
    position: 'absolute',
    top: 5,
    right: 4
  },
  activityList: {
    backgroundColor: BORDERLINE
  },
  calendarView: {
    width: WINDOW_WIDTH,
    height: CALENDAR_HEIGHT,
    backgroundColor: WHITE,
    overflow: 'hidden',
    borderBottomColor: LIGHT_GRAY,
    borderBottomWidth: 1
  },
  sectionLabel: {
    paddingHorizontal: 15,
    paddingVertical: 3,
    fontSize: 14,
  }
};

const DESCRIPTIONS = [
  I18n.t('actionRequired'),
  I18n.t('waitProviderResponse'),
  I18n.t('providersAccepted'),
  I18n.t('appointmentCancelled')
];

@withEmitter('eventEmitter')
export class CalendarContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isNavBarExpanded: false,
      selectedTab: 0,
      tipStatus: [false, false, false, false],
      acceptedPrivacyPolicy: false,
      canShowData: true
    };
  }

  componentWillMount() {
    this.eventEmitter.on('AppRoot:TOKEN_EXPIRED', this.onLogoutEventListener);
    this.eventEmitter.on('CalendarScene:didAppear', this.onViewDidAppear);
    this.eventEmitter.on('Notification:BannerClicked', this.onNotificationBannerClicked);
    this.eventEmitter.on('Notification:ActivityUpdated', this.onActivityUpdated);
    this.eventEmitter.on('Notification:AcceptedPrivacyPolicy', this.onAcceptedPrivacyPolicy);

    AsyncStorage.getItem('@OPENMED:ACCEPT_PRIVACY')
      .then(value => value === 'ACCEPTED' && this.setState({ acceptedPrivacyPolicy: true }))
      .catch(() => this.setState({ acceptedPrivacyPolicy: false }));
  }

  componentWillUnmount() {
    this.eventEmitter.removeListener('AppRoot:TOKEN_EXPIRED', this.onLogoutEventListener);
    this.eventEmitter.removeListener('CalendarScene:didAppear', this.onViewDidAppear);
    // eslint-disable-next-line max-len
    this.eventEmitter.removeListener('Notification:BannerClicked', this.onNotificationBannerClicked);
    this.eventEmitter.removeListener('Notification:ActivityUpdated', this.onActivityUpdated);
    // eslint-disable-next-line max-len
    this.eventEmitter.removeListener('Notification:AcceptedPrivacyPolicy', this.onAcceptedPrivacyPolicy);
  }

  onAcceptedPrivacyPolicy = () => {
    this.setState({ acceptedPrivacyPolicy: true });
  };

  onLogoutEventListener = () => {
    this.props.popToRoot();
  };

  onViewDidAppear = () => {
    if (NavData.getForcedTab()) {
      NavData.setForcedTab(null);
      this.setState({ selectedTab: 1 });
      this.activityList.scrollToIndex({
        index: 0,
        viewPosition: 0,
        animated: true,
      });
    }
  };

  componentDidMount() {
    if (this.props.auth.user) {
      this.getActivities(this.props.patient.activePatient.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.auth.user && nextProps.auth.user) {
      this.props.popToRoot();
    }

    if (!_.isEqual(this.props.patient.activePatient, nextProps.patient.activePatient)
      && !_.isEmpty(nextProps.patient.activePatient)) {
      this.getActivities(nextProps.patient.activePatient.id);
    }
  }

  getActivities = (user_id) => {
    this.props.getAppointments({ id: user_id });
  };

  onActivityUpdated = () => {
    if (this.props.auth.user) {
      this.getActivities(this.props.patient.activePatient.id);
    }
  };

  onNotificationBannerClicked = (appointmentId) => {
    const { switchTab, fetchAppointmentDetail, showLightBox } = this.props;

    switchTab(2);
    promisify(fetchAppointmentDetail, { appointmentId })
      .then((appointment) => {
        if (appointment.status === 10) { // Provider proposed new condition
          showLightBox(
            'RequestProposeDialog',
            {
              selectedAppointment: appointment,
              onNoThanksButtonClicked: this.onNoThanksButtonClicked,
              onViewDetails: this.onViewAppointmentDetails,
              onRequestUpdated: this.onRequestUpdated
            },
            {
              backgroundBlur: 'dark',
              backgroundColor: 'transparent',
              tapBackgroundToDismiss: true
            }
          );
        }
      })
      .catch(error => console.log(error));
  };

  onPressActivity = (appointment) => {
    const { showLightBox } = this.props;

    if (appointment.status === 10) {
      showLightBox(
        'RequestProposeDialog',
        {
          selectedAppointment: appointment,
          onNoThanksButtonClicked: this.onNoThanksButtonClicked,
          onViewDetails: this.onViewAppointmentDetails,
          onRequestUpdated: this.onRequestUpdated
        },
        {
          backgroundBlur: 'dark',
          backgroundColor: 'transparent',
          tapBackgroundToDismiss: true
        }
      );
    } else {
      showLightBox(
        'RequestActionDialog',
        {
          selectedAppointment: appointment,
          onProposeAnotherTime: this.onProposeAnotherTime,
          onViewDetails: this.onViewAppointmentDetails
        },
        {
          backgroundBlur: 'dark',
          backgroundColor: 'transparent',
          tapBackgroundToDismiss: true
        }
      );
    }
  };

  onViewAppointmentDetails = (appt) => {
    const { dismissLightBox, routeScene } = this.props;
    dismissLightBox();

    setTimeout(() => {
      routeScene(
        'AppointmentDetailScene',
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
        }
      );
    }, 1000);
  };

  onProposeAnotherTime = (appt) => {
    const { showLightBox, dismissLightBox } = this.props;
    dismissLightBox();

    setTimeout(() => {
      showLightBox(
        'RequestProposeTimeDialog',
        {
          selectedAppointment: appt,
          onProposeSuccess: this.onProposeSuccess
        },
        {
          backgroundBlur: 'dark',
          backgroundColor: 'transparent',
          tapBackgroundToDismiss: true
        }
      );
    }, 1000);
  };

  onProposeSuccess = () => {
    const { showLightBox, dismissLightBox } = this.props;
    dismissLightBox();

    setTimeout(() => {
      showLightBox(
        'RequestSuccessDialog',
        null,
        {
          backgroundBlur: 'dark',
          backgroundColor: 'transparent',
          tapBackgroundToDismiss: true
        }
      );
    }, 1000);
  };

  onNoThanksButtonClicked = (appt) => {
    this.onProposeAnotherTime(appt);
  };

  onRequestUpdated = (appt, time) => {
    const { showLightBox, dismissLightBox } = this.props;
    dismissLightBox();

    setTimeout(() => {
      showLightBox(
        'RequestUpdatedDialog',
        {
          selectedAppointment: appt,
          time
        },
        {
          backgroundBlur: 'dark',
          backgroundColor: 'transparent',
          tapBackgroundToDismiss: true
        }
      );
    }, 1000);
  };

  onPressDate = (date) => {
    this.props.routeScene(
      'CalendarWeekScene',
      { selectedDate: date },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        }
      }
    );
  };

  expandNavBar = () => {
    const { isNavBarExpanded } = this.state;
    this.setState({ isNavBarExpanded: !isNavBarExpanded });

    if (isNavBarExpanded) {
      this.patientListModal.hide();
    } else {
      this.patientListModal.show();
    }
  };

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

  onPatientSelected = (item) => {
    const { patient, setCurrentPatient } = this.props;
    const { activePatient } = patient;

    if (activePatient.id === item.id) {
      return;
    }

    setCurrentPatient(item);
    this.expandNavBar();
  };

  changeTab = (tabIndex) => {
    const { selectedTab } = this.state;

    if (tabIndex !== selectedTab) {
      this.setState({ selectedTab: tabIndex });
    }
  };

  renderTabItem = (tabIndex, tabIcon) => {
    const { selectedTab } = this.state;

    return (
      <TouchableOpacity onPress={() => this.changeTab(tabIndex)}>
        <View
          style={[styles.tabItem,
            { borderBottomColor: selectedTab === tabIndex ? PRIMARY_COLOR : WHITE }
          ]}
        >
          <Icon
            name={tabIcon}
            size={22}
            color={selectedTab === tabIndex ? PRIMARY_COLOR : PLACEHOLDER}
          />
        </View>
      </TouchableOpacity>
    );
  };

  renderTab = () => {
    const { tipStatus, selectedTab, canShowData } = this.state;

    return (
      <View>
        <View style={styles.tab}>
          {this.renderTabItem(0, 'notifications-active')}
          {this.renderTabItem(1, 'hourglass-empty')}
          {this.renderTabItem(2, 'schedule')}
          {this.renderTabItem(3, 'cancel')}
        </View>
        {!tipStatus[selectedTab] && canShowData && this.renderTabDescription()}
      </View>
    );
  };

  renderTabDescription = () => {
    const { selectedTab, tipStatus } = this.state;

    return (
      <View style={styles.descriptionView}>
        <SFSemiBold style={styles.description}>
          {DESCRIPTIONS[selectedTab]}
        </SFSemiBold>
        <View style={styles.clearTipButtonView}>
          <TouchableOpacity
            onPress={() => {
              const newStatus = Object.assign({}, tipStatus);
              newStatus[selectedTab] = true;
              this.setState({ tipStatus: newStatus });
            }}
          >
            <Icon
              name={'close'}
              size={16}
              color={BLACK}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  renderRow = (rowData) => {
    if (rowData.index === 0) {
      return (
        <View style={styles.calendarView}>
          <SimpleCalendar
            events={rowData.item.events}
            onDateSelect={date => this.onPressDate(date)}
          />
        </View>
      );
    }

    if (rowData.index === 1) {
      return this.renderTab();
    }

    if (rowData.item.id === 'tail') {
      return (
        <View
          style={{
            width: WINDOW_WIDTH,
            height: rowData.item.height,
            marginTop: 10
          }}
        />
      );
    }

    if (rowData.item.id === 'current' || rowData.item.id === 'past') {
      return (
        <SFBold
          style={[styles.sectionLabel,
            { paddingTop: rowData.item.id === 'past' ? 15 : 5 }
          ]}
        >
          {rowData.item.text}
        </SFBold>
      );
    }

    return (
      <CalendarProviderListItem
        style={styles.panel}
        user={this.props.auth.user}
        item={rowData.item}
        region={this.props.location.region}
        onGearIconClicked={appt => this.onPressActivity(appt)}
        onItemClicked={appt => this.onPressActivity(appt)}
      />
    );
  };

  getFillSpaceHeight = (dataArray) => {
    const { tipStatus, selectedTab } = this.state;

    const diff = scrollViewHeight
      - (dataArray.length * ROW_ITEM_HEIGHT)
      - CALENDAR_TAB_BAR_HEIGHT
      - (tipStatus[selectedTab] || dataArray.length <= 0 ? 0 : CALENDAR_TIP_HEIGHT);
    const resultDiff = diff > 0 ? diff : 0;

    return Math.ceil(resultDiff);
  };

  getEvents = () => {
    const { appointments } = this.props.appointment;

    // eslint-disable-next-line
    const filteredAppts = appointments.filter(appt => (appt.selected_time || appt.desired_time) && appt.status > 0);

    const events = [];

    filteredAppts.forEach((appt) => {
      let status = null;
      if (appt.status === 1 || appt.status === 6) {
        status = 'new';
      } else if (appt.status === 2 || appt.status === 7) {
        status = 'accepted';
      } else if (appt.status === 10) {
        status = 'waiting';
      }

      const { practice } = appt;
      const timezone = _.get(practice, 'timezone.code', '');

      if (appt.status === 10) {
        const newTimes = _.get(appt, 'proposed_new_conditions.new_times', []);
        newTimes.forEach((newTime) => {
          const isoString = moment.unix(newTime);
          events.push({
            status,
            date: moment_timezone(isoString).tz(timezone).format('YYYY-MM-DD')
          });
        });
      } else {
        const isoString = moment.unix(appt.selected_time || appt.desired_time);
        events.push({
          status,
          date: moment_timezone(isoString).tz(timezone).format('YYYY-MM-DD')
        });
      }
    });

    const finalEvents = {};
    _.chain(events)
      .groupBy('date')
      .toPairs()
      .map(gp => _.zipObject(['date', 'values'], gp))
      .map(e => ({
        date: e.date,
        values: _.uniqBy(e.values.map(v => v.status))
      }))
      .map(e => _.set(finalEvents, e.date, e.values))
      .value();

    return finalEvents;
  };

  injectData = () => {
    const { selectedTab } = this.state;
    const { appointments } = this.props.appointment;

    let results = [{ id: 'events', events: this.getEvents() }, { id: 'tab' }];

    let activityAppointments = Object.assign([], appointments);

    switch (selectedTab) {
      case 0:
        activityAppointments = activityAppointments.filter(aapt =>
          aapt.status === 10);
        break;
      case 1:
        activityAppointments = activityAppointments.filter(aapt =>
          aapt.status === 1 || aapt.status === 6);
        break;
      case 2:
        activityAppointments = activityAppointments.filter(aapt =>
          aapt.status === 2 || aapt.status === 7);
        break;
      case 3:
        activityAppointments = activityAppointments.filter(aapt =>
          aapt.status === 4 || aapt.status === 12 || aapt.status === 8 || aapt.status === 3);
        activityAppointments = _.orderBy(activityAppointments, 'updated_at', 'desc');
        break;
      default:
        break;
    }

    const currentDateUnix = moment(new Date()).unix();

    activityAppointments = activityAppointments.map((appt) => {
      if (!appt.desired_time) { // First Available is in `Current` list
        return {
          ...appt,
          isPast: false
        };
      }
      const desiredTime = appt.selected_time || appt.desired_time;
      return {
        ...appt,
        isPast: desiredTime < currentDateUnix
      };
    });

    const groupedAppts = _.groupBy(activityAppointments, 'isPast');
    /* eslint-disable */
    const pastAppointments = _.sortBy(_.get(groupedAppts, 'true', []), ['selected_time', 'desired_time', 'created_at']);
    const currentAppointments = _.sortBy(_.get(groupedAppts, 'false', []), ['selected_time', 'desired_time', 'created_at']);
    /* eslint-disable */
    if (currentAppointments.length > 0) {
      results = [
        ...results,
        { id: 'current', text: 'Current' },
        ...currentAppointments,
      ];
    }
    if (pastAppointments.length > 0) {
      results = [
        ...results,
        { id: 'past', text: 'Past' },
        ...pastAppointments,
      ];
    }

    const gapItem = {
      id: 'tail',
      height: this.getFillSpaceHeight(activityAppointments)
    };

    results = [...results, gapItem];

    return results;
  };

  keyExtractor = (item) => `#${item.id}`;

  renderContent = () => {
    const { isNavBarExpanded } = this.state;

    const { activePatient: patient, patients } = this.props.patient;

    return (
      <View style={styles.flex}>
        <CalendarTopNav
          activePatient={patient}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
        />
        <FlatList
          ref={ref => this.activityList = ref}
          data={this.injectData()}
          style={styles.activityList}
          renderItem={this.renderRow}
          stickyHeaderIndices={Platform.OS === 'ios' ? [1] : []}
          keyExtractor={this.keyExtractor}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => this.getActivities(patient.id)}
            />
          }
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
  };

  renderWelcomeScene = () => {
    if (!this.state.acceptedPrivacyPolicy) {
      return (
        <PrivacyContainer
          onAccept={() => this.eventEmitter.emit('Notification:AcceptedPrivacyPolicy')}
        />
      );
    }

    return (
      <WelcomeContainer
        routeScene={this.props.routeScene}
      />
    );
  };

  render() {
    const { auth } = this.props;

    if (!auth.user) {
      return this.renderWelcomeScene();
    }

    return this.renderContent();
  }
}

CalendarContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  activity: PropTypes.object.isRequired,
  setCurrentPatient: PropTypes.func.isRequired,
  getAppointments: PropTypes.func.isRequired,
  fetchAppointmentDetail: PropTypes.func.isRequired,
};

export default compose(
  connectAuth(),
  connectAppointment(),
  connectPatient(),
  connectLocation(),
  connectActivity()
)(CalendarContainer);
