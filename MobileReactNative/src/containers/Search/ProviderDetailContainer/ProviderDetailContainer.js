// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Alert,
  ScrollView,
  RefreshControl
} from 'react-native';
import { compose } from 'recompose';
import {
  connectProvider,
  connectAuth,
  connectAppointment,
  connectPatient,
} from 'AppRedux';
import { dismissKeyboard, promisify, AlertMessage } from 'AppUtilities';
import I18n from 'react-native-i18n';
import {
  Loading,
  ProviderDetailTopNav,
  PatientListModal,
  MarkerInfo,
} from 'AppComponents';
import {
  WHITE,
  DARK_GRAY,
  PRIMARY_COLOR,
} from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import MapView from 'react-native-maps';
import { get } from 'lodash';
import ProviderDetailForm from './ProviderDetailForm';
import { AppointmentTypeForm } from './AppointmentTypeForm';
import { ProviderTimeSlotForm } from './ProviderTimeSlotForm';
import { ProviderTimeActionForm } from './ProviderTimeActionForm';

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  mapView: {
    width: WINDOW_WIDTH,
    height: 250
  },
});

const defaultType = {
  title: 'Consult',
  is_direct_booking: 0,
  is_appointment_request: 1,
  booking_time_intervals: []
};

export class ProviderDetailContainer extends PureComponent {
  constructor(props) {
    super(props);

    let availableTypes = get(props.selectedProvider.practice, 'appointment_types', []);
    // eslint-disable-next-line
    availableTypes = availableTypes.filter(type => !(type.is_direct_booking && type.booking_time_intervals.length === 0));

    if (availableTypes.length === 0) {
      availableTypes = [defaultType];
    }

    this.state = {
      isNavBarExpanded: false,
      isChecking: false,
      isRefreshing: false,
      isFirstAvailable: false,
      directBookingTime: null,
      bookingTime: null,
      appointmentType: availableTypes.length === 1 ? availableTypes[0] : null,
      selectedProvider: props.selectedProvider
    };
  }

  componentWillMount() {
    if (this.props.auth.user) {
      this.refresh(true);
    }
  }

  onTypeSelected = (appointmentType) => {
    this.setState({ appointmentType });

    setTimeout(() => {
      this.contentView.scrollToEnd(true);
    }, 200);
  }

  expandNavBar = () => {
    const { isNavBarExpanded } = this.state;
    this.setState({ isNavBarExpanded: !isNavBarExpanded });

    if (isNavBarExpanded) {
      this.patientListModal.hide();
    } else {
      dismissKeyboard();
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

  onAddFavorite = (provider) => {
    const sendRequest = (is_existing = null) => {
      const { activePatient } = this.props.patient;
      const { addServeProviderRequest } = this.props;

      const params = { provider, user_id: activePatient.id };
      if (is_existing !== null) {
        params.is_existing = is_existing;
      }

      if (activePatient) {
        addServeProviderRequest(params);
      }
    };

    if (provider.is_existing === null) {
      Alert.alert(
        'OpenMed',
        I18n.t('areYouExistingPatient'),
        [
          { text: I18n.t('no'), onPress: () => sendRequest(false) },
          { text: I18n.t('yes'), onPress: () => sendRequest(true) }
        ]
      );
    } else {
      sendRequest();
    }
  };

  onDeleteFavorite = (serveProvider) => {
    const { deleteServeProviderRequest } = this.props;
    const { activePatient } = this.props.patient;

    Alert.alert(
      'OpenMed',
      I18n.t('areYouSureYouWantToRemoveFavorite'),
      [
        { text: I18n.t('no'), onPress: () => { } },
        {
          text: I18n.t('yes'),
          onPress: () => {
            if (activePatient) {
              deleteServeProviderRequest({ provider: serveProvider, user_id: activePatient.id });
            }
          }
        }
      ]
    );
  };

  onFirstAvailable = (isFromDialog = false) => {
    const { dismissLightBox } = this.props;

    if (isFromDialog) {
      dismissLightBox();
    }

    this.setState({
      isFirstAvailable: true,
      bookingTime: null,
      directBookingTime: null
    }, () => this.onNext());
  };

  onConfirmTimeRequest = (selectedTime) => {
    const { dismissLightBox } = this.props;
    dismissLightBox();

    this.setState({
      isFirstAvailable: false,
      bookingTime: selectedTime,
      directBookingTime: null
    }, () => this.onNext());
  };

  onChangeTime = (isFromDialog = false) => {
    const { resetAppointment, showLightBox, dismissLightBox } = this.props;
    const { selectedProvider } = this.state;

    dismissLightBox();

    if (!isFromDialog) {
      resetAppointment({
        time: undefined,
        providers: [selectedProvider]
      });
    }

    const delayDuration = isFromDialog ? 500 : 0;
    dismissLightBox();

    setTimeout(() => {
      showLightBox('SelectTimeDialog', { onConfirmTimeRequest: this.onConfirmTimeRequest }, {
        backgroundBlur: 'light',
        backgroundColor: 'transparent',
        tapBackgroundToDismiss: true
      });
    }, delayDuration);
  };

  onRequestDifferentTime = () => {
    const { showLightBox, resetAppointment } = this.props;
    const { selectedProvider } = this.state;

    resetAppointment({
      time: undefined,
      providers: [selectedProvider]
    });

    showLightBox(
      'ConfirmTimeDialog',
      { onChangeTime: () => this.onChangeTime(true), onFirstAvailable: this.onFirstAvailable },
      {
        backgroundBlur: 'light',
        backgroundColor: 'transparent',
        tapBackgroundToDismiss: true
      }
    );
  };

  renderSlots = (directSlots) => {
    const { selectedProvider, appointmentType } = this.state;

    const slotAction = (time) => {
      if (!this.appointmentTypeForm.getAppointmentType()) {
        AlertMessage.fromRequest(I18n.t('selectAppointmentType'));
        return;
      }

      this.setState({
        isFirstAvailable: false,
        bookingTime: null,
        directBookingTime: time
      }, () => this.onNext());
    };

    return (
      <ProviderTimeSlotForm
        appointmentType={appointmentType}
        slots={directSlots}
        provider={selectedProvider}
        onSlotClicked={slotAction}
        onRequestDifferentTime={this.onRequestDifferentTime}
      />
    );
  };

  renderRequestButton = () => {
    const selectTimeAction = (isFirstTimeAvailable) => {
      if (!this.appointmentTypeForm.getAppointmentType()) {
        AlertMessage.fromRequest(I18n.t('selectAppointmentType'));
        return;
      }

      if (isFirstTimeAvailable) {
        this.onFirstAvailable();
      } else {
        this.onChangeTime(false);
      }
    };

    return (
      <ProviderTimeActionForm
        onSelectTime={selectTimeAction}
      />
    );
  };

  onSelectRatingBar = (selectedProvider) => {
    this.props.routeScene(
      'ReviewScene',
      {
        selectedProvider: {
          ...selectedProvider.provider,
          practice: selectedProvider.practice
        }
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false,
        }
      }
    );
  };

  onNext = () => {
    const { routeScene } = this.props;
    const { selectedProvider } = this.state;

    const appointmentType = this.appointmentTypeForm.getAppointmentType();

    const { isFirstAvailable, directBookingTime, bookingTime } = this.state;

    const appointmentDetails = {
      isFirstAvailable,
      directBookingTime,
      bookingTime,
      appointmentType
    };

    routeScene(
      'AppointmentPreviewScene',
      {
        selectedProvider,
        appointmentDetails
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        },
      }
    );
  };

  refresh = (isChecking = false) => {
    const { getProviderDetail, patient } = this.props;
    const { selectedProvider } = this.state;

    const query = {
      provider_id: selectedProvider.provider.id,
      practice_id: selectedProvider.practice.id
    };

    if (patient.activePatient) {
      query.user_id = patient.activePatient.id;
    }

    this.setState(isChecking ? { isChecking: true } : { isRefreshing: true });

    promisify(getProviderDetail, query)
      .then(provider => this.setState({
        selectedProvider: provider
      }))
      .catch(error => AlertMessage.fromRequest(error))
      .finally(() => this.setState({ isRefreshing: false, isChecking: false }));
  };

  render() {
    const {
      patient,
      routeBack,
      auth,
      provider
    } = this.props;

    const {
      isNavBarExpanded,
      isChecking,
      appointmentType,
      isRefreshing,
      selectedProvider
    } = this.state;

    const initRegion = {
      latitude: selectedProvider.practice.latitude,
      longitude: selectedProvider.practice.longitude,
      latitudeDelta: 0.00322,
      longitudeDelta: 0.00121
    };

    return (
      <View style={styles.flex}>
        <ProviderDetailTopNav
          activePatient={patient.activePatient}
          onBack={routeBack}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
        />
        <ScrollView
          ref={ref => this.contentView = ref}
          style={styles.flex}
          refreshControl={(
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => this.refresh()}
            />)}
        >
          <MapView
            ref={ref => this.map = ref}
            style={styles.mapView}
            region={initRegion}
            showsMyLocationButton={false}
            rotateEnabled={false}
            showsCompass={false}
          >
            <MarkerInfo region={initRegion} text={selectedProvider.practice.address} />
          </MapView>
          <ProviderDetailForm
            dataSource={selectedProvider}
            isAuthenticated={!!auth.user}
            favoriteProviders={provider.serveProviders}
            onAddFavorite={this.onAddFavorite}
            onDeleteFavorite={this.onDeleteFavorite}
            onGiveFeedback={this.onSelectRatingBar}
          />
          <AppointmentTypeForm
            ref={ref => this.appointmentTypeForm = ref}
            dataSource={selectedProvider}
            onTypeSelected={this.onTypeSelected}
          />
          {!appointmentType
            ? null
            : appointmentType.is_direct_booking && appointmentType.booking_time_intervals.length > 0
              ? this.renderSlots(appointmentType.booking_time_intervals)
              : this.renderRequestButton()
          }
        </ScrollView>
        <PatientListModal
          ref={ref => this.patientListModal = ref}
          patients={patient.patients}
          onAddPatient={this.onAddPatient}
          onPatientSelected={this.onPatientSelected}
          onBackgroundClicked={this.expandNavBar}
        />
        {isChecking && <Loading showOverlay={true} />}
      </View>
    );
  }
}

ProviderDetailContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  selectedProvider: PropTypes.shape({}).isRequired,
  provider: PropTypes.shape({}).isRequired,
  auth: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape({}).isRequired,
  resetAppointment: PropTypes.func.isRequired,
  addServeProviderRequest: PropTypes.func.isRequired,
  deleteServeProviderRequest: PropTypes.func.isRequired,
  getProviderDetail: PropTypes.func.isRequired,
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectAppointment(),
  connectProvider(),
)(ProviderDetailContainer);
