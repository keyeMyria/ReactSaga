// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  TextInput
} from 'react-native';

import { connectPatient, connectInsurance, connectAuth } from 'AppRedux';
import { AlertMessage, promisify, requestCameraAccess, withEmitter } from 'AppUtilities';
import { WINDOW_WIDTH } from 'AppConstants';
import { TEXT, TINT, BACKGROUND_GRAY, BORDER } from 'AppColors';
import { RoundedInput, Loading, ActionSheet, NormalButton, Panel } from 'AppComponents';
import moment from 'moment';
import { compose } from 'recompose';
import DateTimePicker from 'react-native-modal-datetime-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import I18n from 'react-native-i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';

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
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    marginTop: 20
  },
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50
  },
  cameraIcon: {
    height: 30,
    width: 30,
    position: 'absolute',
    top: 70,
    left: 70
  },
  textInput: {
    borderRadius: 25,
    backgroundColor: BORDER,
    paddingLeft: 15,
    flex: 1,
    fontSize: 15
  },
  rowName: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'space-between'
  },
  txtLabel: {
    color: TEXT,
    fontSize: 12,
    marginTop: 10
  },
  icon: {
    height: 20,
    width: 20,
    marginLeft: 10,
    resizeMode: 'contain'
  },
  dropdownStyle: {
    width: WINDOW_WIDTH - 40,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80
  },
  dropdownTextStyle: {
    color: TEXT,
    fontSize: 14,
    width: WINDOW_WIDTH - 40,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  moreIcon: {
    paddingHorizontal: 20
  },
  menuItem: {
    color: TEXT,
    fontSize: 17,
    paddingTop: 5
  },
  buttonSave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 0
  },
  buttonSaveLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  }
});

@withEmitter('_emitter')
class AddProfileContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      showPassword: false,
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      gender: '',
      dob: '',
      isDateTimePickerVisible: false,
      isChecking: false,
      insurance: {}
    };
  }

  componentWillMount() {
    this._emitter.on('routeBack:AddProfileScene', this.onBackButtonHandler);

    this.props.getInsurances();
  }

  componentWillUnmount() {
    this._emitter.removeListener('routeBack:AddProfileScene', this.onBackButtonHandler);
  }

  onBackButtonHandler = () => this.props.routeBack();

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = (date) => {
    this.setState({ dob: moment(date).unix() });
    this._hideDateTimePicker();
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
        .catch(() => {});
    } else if (index === 2) {
      requestCameraAccess('camera', I18n.t('accessCamera'))
        .then(() => ImageCropPicker.openCamera(options))
        .then(this.setImageItem)
        .catch(() => {});
    }
  };

  setImageItem = (image) => {
    this.setState({ selectedAvatar: image.data });
  };

  _onSave = () => {
    const { addPatient, routeBack } = this.props;
    const {
      firstName,
      lastName,
      email,
      dob,
      mobileNumber,
      gender,
      selectedAvatar,
      insurance
    } = this.state;

    const patientInfo = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone: mobileNumber,
      device_token: this.props.auth.device_token
    };

    if (dob !== '') {
      patientInfo.birthday = moment.unix(dob).format('YYYY-MM-DD');
    }

    if (!_.isEmpty(gender)) {
      patientInfo.gender = gender === 'male' ? 0 : 1;
    }

    if (selectedAvatar) {
      patientInfo.avatar = selectedAvatar;
    }

    if (!_.isEmpty(insurance)) {
      patientInfo.insurances = [insurance];
    }

    if (!this.validate()) {
      return;
    }

    this.setState({ isChecking: true });

    promisify(addPatient, patientInfo)
      .then(() => routeBack())
      .catch(e => AlertMessage.fromRequest(e))
      .finally(() => this.setState({ isChecking: false }));
  };

  validate = () => {
    const {
      firstName, lastName, email, mobileNumber
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

  onRequestInsurance = (insurance) => {
    this.setState({ insurance });
  };

  chooseInsurance = () => {
    this.props.routeScene(
      'EditInsuranceScene',
      {
        onRequestInsurance: this.onRequestInsurance,
        mode: 3,
        patientInsurance: this.state.insurance
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        }
      }
    );
  };

  render() {
    const { selectedAvatar, isChecking } = this.state;
    const { insurance } = this.props;

    const avatar = selectedAvatar
      ? { uri: `data:image/jpeg;base64,${selectedAvatar}`, isStatic: true }
      : this.state.gender === 'male'
        ? require('img/images/person-unknown-male.png')
        : require('img/images/person-unknown-female.png');

    const insuranceData = this.state.insurance || {};
    const insuranceProvider = _.find(
      insurance.insurances || [],
      ins => ins.id === insuranceData.insurance_provider_id
    );
    const plan = insuranceProvider
      ? _.find(insuranceProvider.insurance_plans, pl => pl.id === insuranceData.insurance_plan_id)
      : null;
    const insuranceText = insuranceProvider && plan
      ? `${insuranceProvider.name}/${plan.name}`
      : insuranceData.medicaid
        ? I18n.t('medicaid')
        : insuranceData.medicare
          ? I18n.t('medicare')
          : insuranceData.self_pay
            ? I18n.t('iAmSelfPaying')
            : I18n.t('none');

    return (
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <Panel>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.warpAvatar}
              onPress={() => this.ActionSheet.show()}
            >
              <Image
                style={styles.avatar}
                source={avatar}
              />
              <Image
                style={styles.cameraIcon}
                source={require('img/images/camera-icon.png')}
              />
            </TouchableOpacity>
            <View style={styles.rowName}>
              <View>
                <Text allowFontScaling={false} style={styles.txtLabel}>
                  {I18n.t('firstName').toUpperCase()}
                </Text>
                <RoundedInput width={WINDOW_WIDTH / 2 - 25}>
                  <TextInput
                    autoCapitalize={'words'}
                    style={[styles.textInput, { height: 50 }]}
                    placeholder={I18n.t('firstName')}
                    error={''}
                    autoCorrect={false}
                    onChangeText={text => this.setState({ firstName: text, isChanged: true })}
                    value={this.state.firstName}
                    underlineColorAndroid={'transparent'}
                  />
                </RoundedInput>
              </View>
              <View>
                <Text allowFontScaling={false} style={styles.txtLabel}>
                  {I18n.t('lastName').toUpperCase()}
                </Text>
                <RoundedInput width={WINDOW_WIDTH / 2 - 25}>
                  <TextInput
                    autoCapitalize={'words'}
                    style={[styles.textInput, { height: 50 }]}
                    placeholder={I18n.t('lastName')}
                    error={''}
                    autoCorrect={false}
                    onChangeText={text => this.setState({ lastName: text, isChanged: true })}
                    value={this.state.lastName}
                    underlineColorAndroid={'transparent'}
                  />
                </RoundedInput>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {`${I18n.t('emailAddress').toUpperCase()} (${I18n.t('optional')})`}
              </Text>
              <RoundedInput width={WINDOW_WIDTH - 40}>
                <Image source={require('img/images/email-input.png')} style={styles.icon} />
                <TextInput
                  autoCapitalize={'none'}
                  style={[styles.textInput, { height: 50 }]}
                  placeholder={I18n.t('emailAddress')}
                  keyboardType={'email-address'}
                  error={''}
                  autoCorrect={false}
                  onChangeText={text => this.setState({ email: text, isChanged: true })}
                  value={this.state.email}
                  underlineColorAndroid={'transparent'}
                />
              </RoundedInput>
            </View>
            <View style={styles.formGroup}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {I18n.t('gender').toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => this.genderPicker.show()}>
                <RoundedInput
                  width={WINDOW_WIDTH - 40}
                  style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                  <Icon
                    name={'md-transgender'}
                    size={25}
                    style={{ marginLeft: 10 }}
                    color={TINT}
                  />
                  <Text allowFontScaling={false} style={styles.textInput}>
                    {_.capitalize(this.state.gender) || '...'}
                  </Text>
                  <Icon name={'ios-arrow-down'} size={25} style={{ marginRight: 10 }} />
                </RoundedInput>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {I18n.t('dateOfBirth').toUpperCase()}
              </Text>
              <TouchableOpacity
                onPress={this._showDateTimePicker}
                style={styles.calendarButtonStyle}
              >
                <RoundedInput width={WINDOW_WIDTH - 40}>
                  <Image
                    source={require('img/images/calendar-input.png')}
                    style={styles.icon}
                    resizeMode={'stretch'}
                  />
                  <Text allowFontScaling={false} style={styles.textInput}>
                    {!this.state.dob ? null : moment.unix(this.state.dob).format('YYYY-MM-DD')}
                  </Text>
                  <Icon name={'ios-arrow-down'} size={25} style={{ marginRight: 10 }} />
                </RoundedInput>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {`${I18n.t('phoneNumber').toUpperCase()} (${I18n.t('optional')})`}
              </Text>
              <RoundedInput width={WINDOW_WIDTH - 40}>
                <Image
                  source={require('img/images/phone-input.png')}
                  style={styles.icon}
                  resizeMode={'stretch'}
                />
                <TextInput
                  autoCapitalize={'none'}
                  style={[styles.textInput, { height: 50 }]}
                  placeholder={I18n.t('phoneNumber')}
                  keyboardType={'phone-pad'}
                  error={''}
                  autoCorrect={false}
                  onChangeText={text => this.setState({ mobileNumber: text, isChanged: true })}
                  value={this.state.mobileNumber}
                  underlineColorAndroid={'transparent'}
                />
              </RoundedInput>
            </View>
            <View style={styles.formGroup}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {I18n.t('insurance').toUpperCase()}
              </Text>
              <TouchableOpacity
                style={styles.calendarButtonStyle}
                onPress={this.chooseInsurance}
              >
                <RoundedInput width={WINDOW_WIDTH - 40}>
                  <Text allowFontScaling={false} style={styles.textInput}>{insuranceText}</Text>
                  <Icon name={'ios-arrow-forward'} size={25} style={{ marginRight: 10 }} />
                </RoundedInput>
              </TouchableOpacity>
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
                this.setState({ gender: (idx === 2 ? 'male' : 'female'), isChanged: true });
              }
            }, 300)}
          />
          <DateTimePicker
            date={new Date(moment.unix(this.state.dob || 315507600))}
            titleIOS={'Pick the birth date'}
            confirmTextIOS={'Confirm'}
            cancelTextIOS={'Cancel'}
            maximumDate={new Date()}
            isVisible={this.state.isDateTimePickerVisible}
            onConfirm={this._handleDatePicked}
            onCancel={this._hideDateTimePicker}
          />
        </KeyboardAwareScrollView>
        <NormalButton
          text={I18n.t('add').toUpperCase()}
          style={styles.buttonSave}
          textStyle={styles.buttonSaveLabel}
          pressed={true}
          onPress={() => this._onSave()}
          borderRadius={0}
        />
        {isChecking && <Loading />}
      </View>
    );
  }
}

AddProfileContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  addPatient: PropTypes.func.isRequired,
  getInsurances: PropTypes.func.isRequired,
  insurance: PropTypes.object.isRequired,
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectInsurance()
)(AddProfileContainer);
