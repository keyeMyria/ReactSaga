// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AsyncStorage,
  Linking,
  ScrollView
} from 'react-native';
import { promisify, withEmitter, AlertMessage } from 'AppUtilities';
import { TEXT, BORDER, SNOW, PRIMARY_COLOR, LINE, PURPLISH_GREY, PLACEHOLDER } from 'AppColors';
import { ROOT_PADDING_TOP } from 'AppConstants';
import { WelcomeContainer, PrivacyContainer } from 'AppContainers';
import { SFRegular } from 'AppFonts';
import { OMImage, Loading } from 'AppComponents';
import I18n from 'react-native-i18n';
import { connectAuth, connectPatient, connectSharedAction, connectInsurance, connectSetting } from 'AppRedux';
import { compose } from 'recompose';
import Icon from 'react-native-vector-icons/Ionicons';
import config from 'react-native-config';
import { filter, get, isEmpty } from 'lodash';
import { NavData } from 'AppConnectors';

const logoImageSource = require('img/images/setting_logo.png');

const settings = [
  'Profile',
  'Family Members',
  'Insurance',
  'Payment',
  'Primary Doctor',
  'SMS',
  'Invite Friends'
];
const otherSetting = ['Privacy Policy', 'Terms & Conditions'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SNOW,
  },
  topView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 75 + ROOT_PADDING_TOP,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingTop: ROOT_PADDING_TOP,
    backgroundColor: PRIMARY_COLOR,
  },
  title: {
    fontSize: 16,
    color: TEXT,
    marginVertical: 10
  },
  logoutRow: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    height: 50,
  },
  middleRow: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  middleRowText: {
    fontSize: 14,
    color: PURPLISH_GREY,
    marginVertical: 8
  },
  imgLogo: {
    height: 45,
    width: 116
  },
  subRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    height: 50,
  },
});

@withEmitter('eventEmitter')
class SettingContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isChecking: false,
      acceptedPrivacyPolicy: false,
    };
  }

  componentWillMount() {
    const {
      settingUserInfo,
      auth,
      switchTab,
      getPatientCard,
      getPatientPaymentHistory,
      getPrimaryCareDoctor
    } = this.props;

    this.eventEmitter.on('AppRoot:TOKEN_EXPIRED', this.onLogoutEventListener);
    this.eventEmitter.on('ProfileScene:didAppear', this.onViewDidAppear);
    this.eventEmitter.on('Notification:AcceptedPrivacyPolicy', this.onAcceptedPrivacyPolicy);


    if (auth.user) {
      promisify(getPatientCard, null).then(() => {

      }).catch((error) => {
        AlertMessage.fromRequest(error);
      });

      promisify(getPatientPaymentHistory, null).then(() => {
      }).catch((error) => {
        AlertMessage.fromRequest(error);
      });

      promisify(getPrimaryCareDoctor, null).then(() => {
      }).catch((error) => {
        AlertMessage.fromRequest(error);
      });

      promisify(this.props.getSpecialties, null)
        .catch(e => console.log(e))
        .finally(() => this.props.getInsurances());

      promisify(settingUserInfo, null).then((res) => {
        console.log(res);
      }).catch((e) => {
        console.log(e);
      });

      if (!auth.user.reset_password_required) {
        const phone = get(auth, 'user.phone', '');
        const email = get(auth, 'user.email', '');
        const gender = get(auth, 'user.gender', -1);
        const dob = get(auth, 'user.birthday', '');

        if (isEmpty(phone) || isEmpty(email) || gender === -1 || isEmpty(dob)) {
          switchTab(3);
          AlertMessage.showMessage('OpenMed', I18n.t('pleaseCompleteProfile'));
        }
      }
    }
    AsyncStorage.getItem('@OPENMED:ACCEPT_PRIVACY')
      .then(value => value === 'ACCEPTED' && this.setState({ acceptedPrivacyPolicy: true }))
      .catch(() => this.setState({ acceptedPrivacyPolicy: false }));
  }

  componentWillUnmount() {
    this.eventEmitter.removeListener('AppRoot:TOKEN_EXPIRED', this.onLogoutEventListener);
    this.eventEmitter.removeListener('ProfileScene:didAppear', this.onViewDidAppear);
    // eslint-disable-next-line max-len
    this.eventEmitter.removeListener('Notification:AcceptedPrivacyPolicy', this.onAcceptedPrivacyPolicy);
  }

  onAcceptedPrivacyPolicy = () => {
    this.setState({ acceptedPrivacyPolicy: true });
  };

  onViewDidAppear = () => {
    if (NavData.getForcedTab()) {
      NavData.setForcedTab(null);
      this.activityList.scrollToIndex({
        index: 0,
        viewPosition: 0,
        animated: true,
      });
    }
    const { auth, refreshPatients } = this.props;

    if (auth.user) {
      refreshPatients();
    }
  };

  onLogoutEventListener = () => {
    const { clearReduxStore, popToRoot, routeBack } = this.props;
    popToRoot();
    routeBack();
    this.eventEmitter.emit('AppRoot:EXPIRED');
    AsyncStorage.removeItem('@OPENMED:ACCESS_TOKEN');
    clearReduxStore();
  };

  onLogout = () => {
    const { logout } = this.props;
    this.setState({ isChecking: true });

    promisify(logout, null)
      .then(() => this.eventEmitter.emit('AppRoot:TOKEN_EXPIRED'))
      .catch(e => AlertMessage.fromRequest(e))
      .finally(() => this.setState({ isChecking: false }));
  }

  handleLogout = () => {
    Alert.alert(
      'OpenMed',
      I18n.t('logOutFromThisApp'),
      [
        {
          text: I18n.t('no'),
          onPress: () => {
          }
        },
        {
          text: I18n.t('yes'),
          onPress: this.onLogout
        }
      ]
    );
  };

  renderSettingRow = (data, index) => {
    return (
      <View key={index}>
        <TouchableOpacity onPress={() => this.onRowSelect(index)} >
          <View style={styles.subRow}>
            <View>
              <SFRegular allowFontScaling={false} style={styles.title}>
                {data}
              </SFRegular>
            </View>
            <View>
              <Icon name={'ios-arrow-forward'} size={18} style={{ color: PLACEHOLDER }} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  onRowSelect = (rowIndex) => {
    const { routeScene } = this.props;

    if (rowIndex === 0) {
      routeScene('ProfileScene', null, {
        backButtonTitle: '',
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: true,
          navBarBackgroundColor: SNOW,
          navBarTextColor: SNOW,
          navBarButtonColor: PRIMARY_COLOR,
        }
      });
    } else if (rowIndex === 1) {
      routeScene('FamilyMemberScene', null, {
        backButtonTitle: '',
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: true,
          navBarBackgroundColor: SNOW,
          navBarTextColor: SNOW,
          navBarButtonColor: PRIMARY_COLOR,
        }
      });
    } else if (rowIndex === 2) {
      routeScene(
        'InsurancesScene',
        {
          patientInsurance: this.props.patient.activePatient.insurances[0],
          mode: 2
        },
        {
          navigatorStyle: {
            navBarHidden: true,
            tabBarHidden: true
          }
        }
      );
    } else if (rowIndex === 3) {
      routeScene(
        'PaymentMethodScene',
        {
          mode: 2,
          isDirect: false
        },
        {
          navigatorStyle: {
            navBarHidden: true,
            tabBarHidden: true
          }
        }
      );
    } else if (rowIndex === 4) {
      routeScene('PrimaryCareDoctorScene', null, {
        backButtonTitle: '',
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: true
        }
      });
    } else if (rowIndex === 5) {
      routeScene('SmsScene', null, {
        backButtonTitle: '',
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: true,
          navBarBackgroundColor: SNOW,
          navBarTextColor: SNOW,
          navBarButtonColor: 'red',
        }
      });
    } else if (rowIndex === 6) {
      routeScene('InviteFriendScene', null, {
        backButtonTitle: '',
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: true,
          navBarBackgroundColor: SNOW,
          navBarTextColor: SNOW,
          navBarButtonColor: 'red',
        }
      });
    }
  }

  renderMiddeleRow = (data, index) => {
    return (
      <View key={index}>
        <TouchableOpacity onPress={() => { this.onMiddleRowSelect(index); }}>
          <SFRegular allowFontScaling={false} style={styles.middleRowText}>
            {data}
          </SFRegular>
        </TouchableOpacity>
      </View>
    );
  }

  onMiddleRowSelect = (index) => {
    if (index === 0) {
      Linking.openURL(config.PRIVACY_URL)
        .catch(err => console.error('An error occurred', err));
    } else if (index === 1) {
      Linking.openURL(config.TERM_URL)
        .catch(err => console.error('An error occurred', err));
    }
  }

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
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.topView}>
            <OMImage
              style={styles.imgLogo}
              resizeMode={'contain'}
              threshold={0}
              placeholder={logoImageSource}
            />
          </View>
          <ScrollView
            style={styles.flex}
            containerStyle={styles.flex}
          >
            {
              settings.map((data, index) => {
                return this.renderSettingRow(data, index);
              })
            }
            <View style={styles.middleRow}>
              <SFRegular allowFontScaling={false} style={[styles.middleRowText, { color: LINE }]}>
                v3.298.1000
              </SFRegular>
              {
                otherSetting.map((data, index) => {
                  return this.renderMiddeleRow(data, index);
                })
              }
            </View>
            <TouchableOpacity onPress={() => this.handleLogout()}>
              <View style={styles.logoutRow}>
                <SFRegular allowFontScaling={false} style={styles.title}>
                  Logout
                </SFRegular>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
        {this.state.isChecking && <Loading />}
      </View>
    );
  }
}

SettingContainer.propTypes = {
  patient: PropTypes.shape({}).isRequired,
  routeBack: PropTypes.func.isRequired,
  routeScene: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  getPatientCard: PropTypes.func.isRequired,
  getPatientPaymentHistory: PropTypes.func.isRequired,
  clearReduxStore: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  auth: PropTypes.shape({}).isRequired,
  getPrimaryCareDoctor: PropTypes.func.isRequired,
  settingUserInfo: PropTypes.func.isRequired,
  getReferralCode: PropTypes.func.isRequired
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectSharedAction(),
  connectInsurance(),
  connectSetting()
)(SettingContainer);
