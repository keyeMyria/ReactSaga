// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  AsyncStorage,
  RefreshControl,
} from 'react-native';
import {
  connectAuth,
  connectPatient,
  connectInsurance,
  connectSharedAction
} from 'AppRedux';
import {
  AlertMessage,
  promisify,
  dismissKeyboard,
  ImageUtils,
  requestCameraAccess,
  withEmitter
} from 'AppUtilities';
import { WINDOW_WIDTH, TAB_MAP, BOTTOM_BAR_HEIGHT, WINDOW_HEIGHT } from 'AppConstants';
import {
  TEXT,
  TINT,
  BACKGROUND_GRAY,
  BORDER,
  WHITE,
  PRIMARY_COLOR,
  DARK_GRAY,
  FIRE,
  BLACK
} from 'AppColors';
import {
  RoundedInput,
  Loading,
  Panel,
  PatientListModal,
  SettingTopNav,
  NormalButton,
  OMImage,
  ActionSheet
} from 'AppComponents';
import moment from 'moment';
import { compose } from 'recompose';
import DateTimePicker from 'react-native-modal-datetime-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import I18n from 'react-native-i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { get, isEmpty, isEqual, capitalize } from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import * as Progress from 'react-native-progress';
import { WelcomeContainer, PrivacyContainer } from 'AppContainers';
import DeviceInfo from 'react-native-device-info';
import { SFMedium } from 'AppFonts';
import { NavData } from 'AppConnectors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND_GRAY
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 60
  },
  warpAvatar: {
    flexDirection: 'row',
    width: WINDOW_WIDTH * 0.30,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  avatarView: {
    height: 100,
    width: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    overflow: 'hidden'
  },
  cameraIcon: {
    height: 30,
    width: 30,
    position: 'absolute',
    top: WINDOW_HEIGHT * 0.10,
    left: WINDOW_WIDTH * 0.20
  },
  textInput: {
    borderRadius: 25,
    backgroundColor: BORDER,
    paddingLeft: 15,
    flex: 1,
    fontSize: 15,
    color: BLACK
  },
  rowName: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between'
  },
  txtLabel: {
    color: TEXT,
    fontSize: 10,
    marginTop: 10
  },
  icon: {
    height: 20,
    width: 20,
    marginLeft: 10,
    resizeMode: 'contain',
    tintColor: TINT
  },
  buttonSave: {
    position: 'absolute',
    bottom: BOTTOM_BAR_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 10
  },
  buttonSaveLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  }
});

@withEmitter('eventEmitter')
class ProfileContainer extends PureComponent {

  constructor(props) {
    super(props);
    const { activePatient } = props.patient;
    this.state = {
      id: get(activePatient, 'id', 0),
      firstName: get(activePatient, 'first_name', ''),
      lastName: get(activePatient, 'last_name', ''),
      email: get(activePatient, 'email', ''),
      gender: get(activePatient, 'gender') === 0
        ? I18n.t('male')
        : get(activePatient, 'gender') === 1
          ? I18n.t('female')
          : '',
      dob: isEmpty(get(activePatient, 'birthday', ''))
        ? ''
        : moment(get(activePatient, 'birthday'))
          .unix(),
      mobileNumber: get(activePatient, 'phone', ''),
      isDateTimePickerVisible: false,
      selectedAvatar: null,
      isChecking: false,
      isNavBarExpanded: false,
      isChanged: false,
      acceptedPrivacyPolicy: false,
      isRefreshing: false
    };
  }

  componentWillMount() {
    const {
      auth, switchTab
    } = this.props;
    if (auth.user) {

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
  componentWillReceiveProps(nextProps) {
    const { activePatient: oldActivePatient } = this.props.patient;
    const { activePatient: newActivePatient } = nextProps.patient;

    if (!isEqual(oldActivePatient, newActivePatient)) {
      this.setState({
        id: get(newActivePatient, 'id', 0),
        firstName: get(newActivePatient, 'first_name', ''),
        lastName: get(newActivePatient, 'last_name', ''),
        email: get(newActivePatient, 'email', ''),
        gender: get(newActivePatient, 'gender') === 0
          ? I18n.t('male')
          : get(newActivePatient, 'gender') === 1
            ? I18n.t('female')
            : '',
        dob: isEmpty(get(newActivePatient, 'birthday', ''))
          ? ''
          : moment(get(newActivePatient, 'birthday'))
            .unix(),
        mobileNumber: get(newActivePatient, 'phone', ''),
        isChanged: false,
        selectedAvatar: null,
        isChecking: false,
      });
    }

    if (!this.props.auth.user && nextProps.auth.user) {
      const { auth } = nextProps;

      const phone = get(auth, 'user.phone', '');
      const email = get(auth, 'user.email', '');
      const gender = get(auth, 'user.gender', -1);
      const dob = get(auth, 'user.birthday', '');

      this.props.popToRoot();

      setTimeout(() => {
        if (auth.user.reset_password_required) {
          this.props.routeScene('ResetPasswordScene', null, {
            title: I18n.t('resetPassword'),
            backButtonTitle: '',
            navigatorStyle: {
              navBarHidden: true,
              tabBarHidden: true,
              navBarBackgroundColor: WHITE,
              navBarTextColor: DARK_GRAY,
              navBarButtonColor: PRIMARY_COLOR,
            }
          });
          NavData.setForcedTab(null);
        } else if (isEmpty(phone) || isEmpty(email) || gender === -1 || isEmpty(dob)) {
          AlertMessage.showMessage('OpenMed', I18n.t('pleaseCompleteProfile'));
        } else {
          const forcedTab = NavData.getForcedTab();
          if (forcedTab) {
            this.props.switchTab(TAB_MAP.indexOf(forcedTab));
            NavData.setForcedTab(null);
          }
        }
      }, 300);
    }
  }

  showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  handleDatePicked = (date) => {
    const { auth, patient } = this.props;

    /**
     * Block main users who is younger than 15
     * @type {moment.Moment | number}
     */
    const currentYear = moment(new Date())
      .year();
    const birthYear = moment(date)
      .year();

    if ((currentYear - birthYear) <= 15 && auth.user.id === patient.activePatient.id) {
      AlertMessage.fromRequest(I18n.t('invalidPrimaryUserAge'));
    } else {
      this.setState({
        dob: moment(date)
          .unix(),
        isChanged: true
      });
      this.hideDateTimePicker();
    }
  };

  onChangePassword = () => {
    this.props.routeScene('ChangePasswordScene', null, {
      title: '',
      backButtonTitle: '',
      navigatorStyle: {
        navBarHidden: false,
        tabBarHidden: false,
        navBarBackgroundColor: WHITE,
        navBarTextColor: DARK_GRAY,
        navBarButtonColor: PRIMARY_COLOR,
      }
    });
  };

  chooseImageItem = (index) => {
    const options = {
      width: 400,
      height: 400,
      cropping: true,
      includeBase64: true
    };

    if (index === 1) {
      requestCameraAccess('photo', I18n.t('accessGallery'))
        .then(() => ImageCropPicker.openPicker(options))
        .then(this.setImageItem)
        .catch(() => {
        });
    } else if (index === 2) {
      requestCameraAccess('camera', I18n.t('accessCamera'))
        .then(() => ImageCropPicker.openCamera(options))
        .then(this.setImageItem)
        .catch(() => {
        });
    }
  };

  setImageItem = (image) => {
    this.setState({
      selectedAvatar: image.data,
      isChanged: true
    });
  };

  onSave = () => {
    const {
      id,
      firstName,
      lastName,
      email,
      gender,
      dob,
      mobileNumber,
      selectedAvatar,
    } = this.state;
    const { updatePatient, auth } = this.props;

    const patientInfo = {
      id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: mobileNumber,
      birthday: moment.unix(dob)
        .format('YYYY-MM-DD'),
      device_token: auth.device_token,
    };

    if (selectedAvatar) {
      patientInfo.avatar = selectedAvatar;
    }

    if (!isEmpty(gender)) {
      patientInfo.gender = gender === I18n.t('male') ? 0 : 1;
    }

    if (this.validate()) {
      this.setState({ isChecking: true });

      promisify(updatePatient, { ...patientInfo })
        .then(() => {
          this.setState({ isChanged: false });
          AlertMessage.showMessage('OpenMed', I18n.t('profile_updated'));
        })
        .catch(e => AlertMessage.fromRequest(e))
        .finally(() => this.setState({ isChecking: false }));
    }
  };

  validate = () => {
    const {
      firstName,
      lastName,
      email,
      mobileNumber
    } = this.state;

    if (!firstName || firstName.length < 2) {
      AlertMessage.showMessage('OpenMed', I18n.t('errorFirstNameRequired'));
      return false;
    }
    if (!lastName || lastName.length < 2) {
      AlertMessage.showMessage('OpenMed', I18n.t('errorLastNameRequired'));
      return false;
    }

    if (email) {
      if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
        AlertMessage.showMessage('OpenMed', I18n.t('errorEmailFormat'));
        return false;
      }
    }

    if (mobileNumber) {
      if (!/[\d]{10}/.test(mobileNumber)) {
        AlertMessage.showMessage('OpenMed', I18n.t('errorPhoneNumberFormat'));
        return false;
      }
    }

    return true;
  };

  moreAction = () => {
    if (this.patientListModal.isShown()) {
      this.expandNavBar();
    }

    this.actionMenuPicker.show();
  };

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

  verifyEmail = () => {
    const { resendEmail, patient } = this.props;
    resendEmail({
      user_id: patient.activePatient.id,
      type: 0
    });
    Alert.alert('OpenMed', I18n.t('pleaseConfirmEmail'));
  };

  verifyPhoneNumber = () => {
    const { resendPhone, patient } = this.props;

    resendPhone({
      user_id: patient.activePatient.id,
      type: 1
    });
    Alert.alert('OpenMed', I18n.t('pleaseConfirmSms'));
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

  onClickChangePassword = () => {
    this.props.routeScene('ChangePasswordScene', null, {
      title: I18n.t('changePassword'),
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
  }

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
    const { auth, refreshPatients } = this.props;

    if (auth.user) {
      refreshPatients();
    }
  };

  render() {
    let isNewUser = false;
    const {
      selectedAvatar, isChecking, isNavBarExpanded
    } = this.state;
    const { patient, auth, routeBack } = this.props;

    if (!auth.user) {
      return this.renderWelcomeScene();
    }

    const { patients } = patient;
    let { activePatient } = patient;
    activePatient = activePatient || {};

    const avatar = selectedAvatar
      ? {
        uri: `data:image/jpeg;base64,${selectedAvatar}`,
        isStatic: true
      }
      : activePatient.image_url
        ? { uri: activePatient.image_url }
        : ImageUtils.getUnknownImage(activePatient.gender);

    isNewUser = false;
    const patientInsurances = get(activePatient, 'insurances', []);
    const patientInsurance = patientInsurances[0] || {};
    if (patientInsurances && patientInsurances.length === 1
      && ((!patientInsurance.group_id && !patientInsurance.insurance_plan_id
        && !patientInsurance.insurance_provider_id && !patientInsurance.medicaid
        && !patientInsurance.medicare && !patientInsurance.self_pay
        && !patientInsurance.subscriber_id) ||
        patientInsurance.self_pay === true)
    ) {
      isNewUser = true;
    }

    const phoneNotConfirmed = !!(activePatient.phone && !activePatient.phone_confirmed);
    const emailNotConfirmed = !!(activePatient.email && !activePatient.email_confirmed);

    const refreshControl = (
      <RefreshControl
        refreshing={this.state.isRefreshing}
        onRefresh={() => this.onViewDidAppear()}
      />
    );

    return (
      <View style={{ flex: 1, paddingBottom: this.state.isChanged ? BOTTOM_BAR_HEIGHT : 0 }}>
        <SettingTopNav
          activePatient={activePatient}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
          onBack={routeBack}
        />
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          refreshControl={refreshControl}
        >
          <View style={{ paddingLeft: 10, marginBottom: 10 }}>
            <SFMedium allowFontScaling={false} style={{ fontSize: 14, color: TEXT }}>
              {I18n.t('myProfile')}
            </SFMedium>
          </View>
          <Panel>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.warpAvatar}
              onPress={() => this.ActionSheet.show()}
            >
              <View style={styles.avatarView}>
                <OMImage
                  style={styles.avatar}
                  resizeMode={'cover'}
                  indicator={Progress.Circle}
                  indicatorProps={{
                    size: 20,
                    thickness: 0.5,
                    borderWidth: 0,
                    color: PRIMARY_COLOR,
                  }}
                  source={avatar}
                  placeholder={ImageUtils.getUnknownImage(activePatient.gender)}
                  threshold={50}
                />
              </View>
              <Image
                style={styles.cameraIcon}
                source={require('img/images/camera-icon.png')}
              />
            </TouchableOpacity>
            <View style={styles.rowName}>
              <View>
                <Text allowFontScaling={false} style={styles.txtLabel}>
                  {I18n.t('firstName')
                    .toUpperCase()}
                </Text>
                <RoundedInput width={(WINDOW_WIDTH / 2) - 25} >
                  <TextInput
                    autoCapitalize={'words'}
                    style={[styles.textInput, { height: 50 }]}
                    placeholder={I18n.t('firstName')}
                    error={''}
                    autoCorrect={false}
                    onChangeText={text => this.setState({
                      firstName: text,
                      isChanged: true
                    })}
                    value={this.state.firstName}
                    underlineColorAndroid={'transparent'}
                  />
                </RoundedInput>
              </View>
              <View>
                <Text allowFontScaling={false} style={styles.txtLabel}>
                  {I18n.t('lastName')
                    .toUpperCase()}
                </Text>
                <RoundedInput width={(WINDOW_WIDTH / 2) - 25}>
                  <TextInput
                    autoCapitalize={'words'}
                    style={[styles.textInput, { height: 50 }]}
                    placeholder={I18n.t('lastName')}
                    error={''}
                    autoCorrect={false}
                    onChangeText={text => this.setState({
                      lastName: text,
                      isChanged: true
                    })}
                    value={this.state.lastName}
                    underlineColorAndroid={'transparent'}
                  />
                </RoundedInput>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {I18n.t('emailAddress')
                  .toUpperCase()}
              </Text>
              <RoundedInput width={WINDOW_WIDTH - 40}>
                <Image
                  source={require('img/images/email-input.png')}
                  style={[styles.icon,
                    { tintColor: !emailNotConfirmed ? TINT : FIRE }
                  ]}
                />
                <TextInput
                  autoCapitalize={'none'}
                  style={[styles.textInput,
                    {
                      height: 50,
                      color: !emailNotConfirmed ? BLACK : FIRE
                    }
                  ]}
                  placeholder={I18n.t('emailAddress')}
                  keyboardType={'email-address'}
                  error={''}
                  autoCorrect={false}
                  onChangeText={text => this.setState({
                    email: text,
                    isChanged: true
                  })}
                  value={this.state.email}
                  underlineColorAndroid={'transparent'}
                />
                {emailNotConfirmed &&
                <TouchableOpacity
                  onPress={() => this.verifyEmail()}
                  hitSlop={{
                    left: 5,
                    right: 5,
                    top: 5,
                    bottom: 5
                  }}
                >
                  <MaterialIcon
                    name={'info-outline'}
                    size={25}
                    style={{ marginRight: 8 }}
                    color={FIRE}
                  />
                </TouchableOpacity>
                }
              </RoundedInput>
            </View>
            <View style={styles.formGroup}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {I18n.t('gender')
                  .toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => this.genderPicker.show()}>
                <RoundedInput
                  width={WINDOW_WIDTH - 40}
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Icon
                    name={'md-transgender'}
                    size={25}
                    style={{ marginLeft: 10 }}
                    color={TINT}
                  />
                  <Text allowFontScaling={false} style={styles.textInput}>
                    {capitalize(this.state.gender) || '...'}
                  </Text>
                  <Icon
                    name={'ios-arrow-down'}
                    size={25}
                    style={{ marginRight: 10 }}
                    color={isEmpty(activePatient.birthday) ? FIRE : BLACK}
                  />
                </RoundedInput>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {I18n.t('dateOfBirth')
                  .toUpperCase()}
              </Text>
              <TouchableOpacity
                onPress={this.showDateTimePicker}
                style={styles.calendarButtonStyle}
              >
                <RoundedInput width={WINDOW_WIDTH - 40}>
                  <Image
                    source={require('img/images/calendar-input.png')}
                    style={[styles.icon,
                      { tintColor: isEmpty(activePatient.birthday) ? FIRE : TINT }
                    ]}
                    resizeMode={'stretch'}
                  />
                  <Text allowFontScaling={false} style={styles.textInput}>
                    {!this.state.dob ? null : moment.unix(this.state.dob)
                      .format('MM-DD-YYYY')}
                  </Text>
                  <Icon
                    name={'ios-arrow-down'}
                    size={25}
                    style={{ marginRight: 10 }}
                    color={isEmpty(activePatient.birthday) ? FIRE : BLACK}
                  />
                </RoundedInput>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {I18n.t('phoneNumber')
                  .toUpperCase()}
              </Text>
              <RoundedInput width={WINDOW_WIDTH - 40}>
                <Image
                  source={require('img/images/phone-input.png')}
                  style={[styles.icon,
                    { tintColor: !phoneNotConfirmed ? TINT : FIRE }
                  ]}
                  resizeMode={'stretch'}
                />
                <TextInput
                  autoCapitalize={'none'}
                  style={[styles.textInput,
                    {
                      height: 50,
                      color: !phoneNotConfirmed ? BLACK : FIRE
                    }
                  ]}
                  placeholder={I18n.t('phoneNumber')}
                  keyboardType={'phone-pad'}
                  returnKeyType={'done'}
                  error={''}
                  autoCorrect={false}
                  onChangeText={text => this.setState({
                    mobileNumber: text,
                    isChanged: true
                  })}
                  value={this.state.mobileNumber}
                  underlineColorAndroid={'transparent'}
                />
                {phoneNotConfirmed &&
                <TouchableOpacity
                  onPress={() => this.verifyPhoneNumber()}
                  hitSlop={{
                    left: 5,
                    right: 5,
                    top: 5,
                    bottom: 5
                  }}
                >
                  <MaterialIcon
                    name={'info-outline'}
                    size={25}
                    style={{ marginRight: 8 }}
                    color={FIRE}
                  />
                </TouchableOpacity>
                }
              </RoundedInput>
            </View>
            <View style={styles.formGroup}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {I18n.t('password')
                  .toUpperCase()}
              </Text>
              <RoundedInput width={WINDOW_WIDTH - 40}>
                <View style={{ width: WINDOW_WIDTH * 0.08 }}>
                  <Image
                    source={require('img/images/password-input.png')}
                    style={[styles.icon, { tintColor: TINT }]}
                    resizeMode={'stretch'}
                  />
                </View>
                <View style={{ width: WINDOW_WIDTH * 0.67 }}>
                  <OMImage
                    style={{ height: 15, width: 100, marginLeft: 15 }}
                    resizeMode={'contain'}
                    placeholder={require('img/images/static_password.png')}
                    threshold={50}
                  />
                </View>
                <View>
                  <TouchableOpacity onPress={() => this.onClickChangePassword()}>
                    <Text style={{ color: PRIMARY_COLOR }}>{I18n.t('edit')}</Text>
                  </TouchableOpacity>
                </View>
              </RoundedInput>
            </View>
          </Panel>
          <ActionSheet
            ref={ref => this.ActionSheet = ref}
            title={''}
            options={[I18n.t('cancel'), I18n.t('fromLibrary'), I18n.t('fromCamera')]}
            cancelButtonIndex={0}
            destructiveButtonIndex={4}
            onPress={i => setTimeout(() => {
              this.chooseImageItem(i);
            }, 300)}
          />
          <ActionSheet
            ref={ref => this.genderPicker = ref}
            title={''}
            options={[I18n.t('cancel'), I18n.t('female'), I18n.t('male')]}
            cancelButtonIndex={0}
            destructiveButtonIndex={4}
            onPress={idx => setTimeout(() => {
              if (idx) {
                this.setState({
                  gender: (idx === 2 ? I18n.t('male') : I18n.t('female')),
                  isChanged: true
                });
              }
            }, 300)}
          />
          <DateTimePicker
            date={new Date(moment.unix(this.state.dob || 315507600))}
            titleIOS={I18n.t('pickBirthDate')}
            confirmTextIOS={I18n.t('confirm')}
            cancelTextIOS={I18n.t('cancel')}
            maximumDate={new Date()}
            isVisible={this.state.isDateTimePickerVisible}
            onConfirm={this.handleDatePicked}
            onCancel={this.hideDateTimePicker}
            locale={DeviceInfo.getDeviceLocale()
              .split('-')[0]}
          />
        </KeyboardAwareScrollView>
        {this.state.isChanged &&
        <NormalButton
          text={I18n.t('save')
            .toUpperCase()}
          style={styles.buttonSave}
          textStyle={styles.buttonSaveLabel}
          pressed={true}
          borderRadius={0}
          onPress={() => this.onSave()}
        />
        }
        <PatientListModal
          ref={ref => this.patientListModal = ref}
          patients={patients}
          onAddPatient={this.onAddPatient}
          onPatientSelected={this.onPatientSelected}
          onBackgroundClicked={this.expandNavBar}
        />
        {isChecking && <Loading />}
      </View>
    );
  }

}

ProfileContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  setCurrentPatient: PropTypes.func.isRequired,
  updatePatient: PropTypes.func.isRequired,
  auth: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape({}).isRequired,
  resendEmail: PropTypes.func.isRequired,
  resendPhone: PropTypes.func.isRequired,
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectInsurance(),
  connectSharedAction()
)(ProfileContainer);
