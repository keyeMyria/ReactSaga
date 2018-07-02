// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Platform,
  StyleSheet,
  View,
  Switch
} from 'react-native';

import {
  connectAuth,
  connectPatient,
  connectSetting
} from 'AppRedux';

import {
  TEXT,
  BACKGROUND_GRAY,
  WHITE,
  DARK_GRAY,
  PRIMARY_COLOR,
  BORDERLINE
} from 'AppColors';
import { promisify, AlertMessage } from 'AppUtilities';

import { SettingTopNav, PatientListModal } from 'AppComponents';
import { compose } from 'recompose';
import { WelcomeContainer, PrivacyContainer } from 'AppContainers';
import { SFRegular } from 'AppFonts';
import I18n from 'react-native-i18n';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_GRAY,
  },
  smsTextView: {
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    marginHorizontal: 10
  },
  titleText: {
    color: TEXT,
    fontSize: 16
  },
  smsBox: {
    backgroundColor: WHITE,
    justifyContent: 'center',
    height: 100,
    paddingLeft: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 10,
    borderColor: BORDERLINE
  },
  subText: {
    color: TEXT,
    fontSize: 14
  }
});

class SmsContainer extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isNavBarExpanded: false,
    };

  }

  expandNavBar = () => {
    const { isNavBarExpanded } = this.state;
    this.setState({ isNavBarExpanded: !isNavBarExpanded });

    if (isNavBarExpanded) {
      this.patientListModal.hide();
    } else {
      this.patientListModal.show();
    }
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

  setSwitchValue = (value) => {

    const { settingSmsFlag, auth } = this.props;

    const payload = {
      user_id: auth.user.id,
      use_sms: value
    };
    promisify(settingSmsFlag, payload)
      .then(() => {})
      .catch((e) => {
        console.log(e);
        AlertMessage.fromRequest(e);
      });

  }
  render() {
    const { isNavBarExpanded } = this.state;
    const {
      patient, auth, routeBack, setting
    } = this.props;

    if (!auth.user) {
      return this.renderWelcomeScene();
    }
    let { patients, activePatient } = patient;
    patients = patients || {};
    activePatient = activePatient || {};

    return (
      <View style={styles.container}>
        <SettingTopNav
          activePatient={activePatient}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
          onBack={routeBack}
        />
        <View>
          <View style={styles.smsTextView}>
            <SFRegular style={styles.titleText}>SMS</SFRegular>
          </View>
          <View style={styles.smsBox}>
            <SFRegular style={[styles.subText, { marginBottom: 10 }]}>
              {I18n.t('smsMessage')}
            </SFRegular>
            {Platform.OS === 'ios' ?
              <Switch
                onValueChange={(value) => { this.setSwitchValue(value); }}
                value={setting.smsFlag}
                onTintColor={PRIMARY_COLOR}
                tintColor={PRIMARY_COLOR}
              />
              :
              <Switch
                onValueChange={(value) => { this.setSwitchValue(value); }}
                value={setting.smsFlag}
                onTintColor={PRIMARY_COLOR}
              />
            }
          </View>
        </View>
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

SmsContainer.propTypes = {
  patient: PropTypes.shape({}).isRequired,
  setCurrentPatient: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  settingSmsFlag: PropTypes.func.isRequired,
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectSetting()
)(SmsContainer);
