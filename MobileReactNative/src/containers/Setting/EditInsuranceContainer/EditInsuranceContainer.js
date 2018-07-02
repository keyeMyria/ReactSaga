// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Easing,
  TextInput,
  Platform,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';

import { connectAuth, connectPatient, connectInsurance } from 'AppRedux';
import { dismissKeyboard, requestCameraAccess, promisify, AlertMessage } from 'AppUtilities';
import { WINDOW_WIDTH } from 'AppConstants';
import {
  TEXT,
  BORDERLINE,
  TINT,
  BACKGROUND_GRAY,
  BORDER,
  WHITE,
  PRIMARY_COLOR,
  DARK_GRAY,
  TABBAR_ITEM_COLOR,
  BLACK,
  CHARCOAL
} from 'AppColors';
import {
  RoundedInput,
  Loading,
  ActionSheet,
  Panel,
  PatientListModal,
  InsuranceTopNav,
  InsuranceModal,
  FlipView, OMImage
} from 'AppComponents';
import { compose } from 'recompose';
import ImageCropPicker from 'react-native-image-crop-picker';
import I18n from 'react-native-i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Progress from 'react-native-progress';

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    backgroundColor: BACKGROUND_GRAY,
    flex: 1
  },
  contentContainer: {
    paddingVertical: 10
  },
  txtInsurance: {
    marginLeft: 10,
    fontSize: 16,
    color: TEXT,
    fontWeight: 'bold',
    marginVertical: 10
  },
  insuranceName: {
    borderRadius: 25,
    backgroundColor: BORDER,
    color: BLACK,
    paddingLeft: 15,
    fontSize: 15,
    maxWidth: WINDOW_WIDTH - 90
  },
  textInput: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: BORDER,
    color: BLACK,
    fontSize: 15,
    paddingLeft: 15,
    paddingRight: 10
  },
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    marginHorizontal: 5,
    marginTop: 10
  },
  buttonFlip: {
    flex: 1,
    height: 32,
    borderColor: '#fff',
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    marginTop: 10,
    marginHorizontal: 5,
    width: WINDOW_WIDTH - 56,
    height: (WINDOW_WIDTH - 56) * 0.63,
    borderRadius: 5,
    backgroundColor: TINT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDERLINE,
    overflow: 'hidden'
  },
  cardImage: {
    width: WINDOW_WIDTH - 56,
    height: (WINDOW_WIDTH - 56) * 0.63,
  },
  cardText: {
    color: '#fff',
    fontSize: 16
  },
  txtLabel: {
    marginBottom: 5,
    fontSize: 13
  }
});

class EditInsuranceContainer extends PureComponent {
  constructor(props, context: mixed) {
    super(props, context);

    const { insurance, patientInsurance } = this.props;
    const { insurances } = insurance;

    const insuranceData = patientInsurance || {};
    const selectedInsurance = _.find(insurances, { id: insuranceData.insurance_provider_id });
    const plans = selectedInsurance ? selectedInsurance.insurance_plans : [];
    const plan = _.find(plans, { id: insuranceData.insurance_plan_id });

    const insuranceText = selectedInsurance && plan
      ? `${selectedInsurance.name}/${plan.name}`
      : insuranceData.medicaid
        ? I18n.t('medicaid')
        : insuranceData.medicare
          ? I18n.t('medicare')
          : insuranceData.self_pay
            ? I18n.t('iAmSelfPaying')
            : I18n.t('none');

    this.state = {
      insurance: selectedInsurance,
      plan,
      insuranceText,
      medicaid: insuranceData.medicaid,
      medicare: insuranceData.medicare,
      self_pay: insuranceData.self_pay,
      groupId: insuranceData.group_id,
      subscriberId: insuranceData.subscriber_id,
      card_front_url: insuranceData.card_front_url
        ? insuranceData.card_front_url
        : insuranceData.card_front
          ? { uri: insuranceData.card_front, isStatic: true }
          : null,
      card_back_url: insuranceData.card_back_url
        ? insuranceData.card_back_url
        : insuranceData.card_back
          ? { uri: insuranceData.card_back, isStatic: true }
          : null,
      isNavBarExpanded: false,
      isChecking: false
    };
  }

  componentDidMount() {
    if (this.props.mode === 3) {
      AlertMessage.fromRequest(I18n.t('canAddMoreInsuranceLater'));
    }
  }

  onImageSave = (imageData) => {
    const img = { uri: imageData, isStatic: true };
    this.setState(this.type === 'cardFront'
      ? { card_front_url: img }
      : { card_back_url: img });
  };

  onPickCard = (type) => {
    this.type = type;
    this.props.routeScene('ScanDocumentScene', { onImageSave: this.onImageSave }, {
      navigatorStyle: {
        navBarHidden: true,
        tabBarHidden: true,
        statusBarHidden: true,
      },
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
        .then((image) => {
          const img = { uri: image.data, isStatic: true };
          this.setState(this.type === 'cardFront'
            ? { card_front_url: img }
            : { card_back_url: img });
        })
        .catch(() => {});
    } else if (index === 2) {
      requestCameraAccess('camera', I18n.t('accessCamera'))
        .then(() => ImageCropPicker.openCamera(options))
        .then((image) => {
          const img = { uri: image.data, isStatic: true };
          this.setState(this.type === 'cardFront'
            ? { card_front_url: img }
            : { card_back_url: img });
        })
        .catch(() => {});
    }
  };

  onSelectInsurance = (insuranceData) => {
    this.setState(insuranceData);
  };

  onSave = () => {
    const {
      insurance,
      plan,
      medicare,
      medicaid,
      self_pay,
      card_front_url,
      card_back_url,
      groupId,
      subscriberId
    } = this.state;
    const {
      routeBack,
      onRequestInsurance,
      patient,
      updatePatientInsurance,
      addPatientInsurance,
      patientInsurance,
      mode,
      popToRoot
    } = this.props;

    const data = {
      insurance_provider_id: insurance ? insurance.id : null,
      insurance_plan_id: plan ? plan.id : null,
      subscriber_id: subscriberId,
      group_id: groupId,
      medicare: medicare !== null && medicare !== undefined ? medicare : false,
      medicaid: medicaid !== null && medicaid !== undefined ? medicaid : false,
      self_pay: self_pay !== null && self_pay !== undefined ? self_pay : false,
    };

    if (card_front_url && !_.isEqual(card_front_url, _.get(patientInsurance, 'card_front_url'))) {
      const imageData = card_front_url.uri.split('base64,')[1];
      data.card_front = imageData;
    }

    if (card_back_url && !_.isEqual(card_back_url, _.get(patientInsurance, 'card_back_url'))) {
      const imageData = card_back_url.uri.split('base64,')[1];
      data.card_back = imageData;
    }

    if (mode === 3) { // add new patient
      onRequestInsurance(data);
      routeBack();
    } else if (mode === 2 || mode === 4) { // edit patient insurance
      if (mode === 4 && data.self_pay && patient.activePatient.insurances.length > 1) {
        Alert.alert(
          'OpenMed',
          I18n.t('areYouPayingYourself'),
          [
            {
              text: I18n.t('ok'),
              onPress: () => routeBack()
            },
            { text: 'cancel' }
          ]
        );
        return;
      }

      this.setState({ isChecking: true });

      promisify(updatePatientInsurance, {
        user_id: patient.activePatient.id,
        id: patientInsurance.id,
        insurance: data
      }).then(() => {
        if (mode === 4 && data.self_pay && patient.activePatient.insurances.length === 1) {
          popToRoot();
        } else {
          routeBack();
        }
      })
        .catch(error => AlertMessage.fromRequest(error))
        .finally(() => this.setState({ isChecking: false }));
    } else if (mode === 1) { // add patient insurance
      if (data.self_pay) {
        Alert.alert(
          'OpenMed',
          I18n.t('areYouPayingYourself'),
          [
            {
              text: I18n.t('ok'),
              onPress: () => routeBack()
            },
            { text: 'cancel' }
          ]
        );
        return;
      }

      if (!data.insurance_provider_id && !data.insurance_plan_id && !data.subscriber_id
        && !data.medicare && !data.medicaid && !data.self_pay
      ) {
        AlertMessage.fromRequest(I18n.t('chooseYourInsurance'));
        return;
      }

      this.setState({ isChecking: true });

      promisify(addPatientInsurance, {
        insurance: { ...data, user_id: patient.activePatient.id }
      }).then(() => routeBack())
        .catch(error => AlertMessage.fromRequest(error))
        .finally(() => this.setState({ isChecking: false }));
    }
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

  isInsuranceEmpty = () => {
    if (this.state.insuranceText === I18n.t('none') || this.state.self_pay === true) {
      return true;
    }

    return false;
  };

  render() {
    const {
      insurance,
      patient,
      routeBack,
      mode
    } = this.props;
    const {
      showBack,
      insuranceText,
      isNavBarExpanded,
      isChecking
    } = this.state;

    const { insurances } = insurance;

    const { card_front_url, card_back_url } = this.state;

    const activeColor = this.isInsuranceEmpty() ? TABBAR_ITEM_COLOR : TINT;

    const splits = insuranceText.split('/');
    const insuranceName = splits[0];
    const planNames = [];
    let planName = splits[1];
    if (splits.length > 2) {
      for (let i = 1; i < splits.length; i += 1) {
        planNames.push(splits[i]);
      }
      planName = planNames.join('/');
    }
    return (
      <View style={styles.flex}>
        <InsuranceTopNav
          title={mode === 1 || mode === 3 ? I18n.t('addInsurance') : I18n.t('editInsurance')}
          activePatient={patient.activePatient}
          onSave={this.onSave}
          onBack={routeBack}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
          isViewable={false}
        />
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <Text allowFontScaling={false}style={styles.txtInsurance}>
            {I18n.t('insurance').toUpperCase()}
          </Text>
          <Panel style={{ flex: 1 }}>
            <View>
              <TouchableOpacity onPress={() => this.insuranceModal.show()}>
                <RoundedInput
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }}
                  width={WINDOW_WIDTH - 40}
                >
                  {insuranceName &&
                  <Text
                    allowFontScaling={false}
                    style={styles.insuranceName}
                  >
                    {insuranceName}
                  </Text>}
                  {planName &&
                  <Text
                    allowFontScaling={false}
                    style={[styles.insuranceName, { fontSize: 12, color: CHARCOAL, marginTop: 2 }]}
                    numberOfLines={1}
                  >
                    {planName}
                  </Text>}
                  <Icon
                    name={'ios-arrow-forward'}
                    size={25}
                    style={{ position: 'absolute', right: 20, top: 12 }}
                  />
                </RoundedInput>
              </TouchableOpacity>
            </View>
            <View style={styles.groupButton}>
              <TouchableOpacity
                disabled={this.isInsuranceEmpty()}
                style={[
                  styles.buttonFlip,
                  !showBack ? { borderBottomColor: activeColor } : {}
                ]}
                activeOpacity={0.7}
                onPress={() => this.setState({ showBack: false })}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    { fontWeight: 'bold' },
                    {
                      color: this.isInsuranceEmpty()
                        ? TABBAR_ITEM_COLOR
                        : !showBack
                          ? TINT
                          : BLACK
                    }
                  ]}
                >
                  {I18n.t('front').toUpperCase()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={this.isInsuranceEmpty()}
                style={[
                  styles.buttonFlip,
                  showBack ? { borderBottomColor: activeColor } : {}
                ]}
                activeOpacity={0.7}
                onPress={() => this.setState({ showBack: true })}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    { fontWeight: 'bold' },
                    {
                      color: this.isInsuranceEmpty()
                        ? TABBAR_ITEM_COLOR
                        : showBack
                          ? TINT
                          : BLACK
                    }
                  ]}
                >
                  {I18n.t('back').toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
            <FlipView
              style={{ height: 230 }}
              front={!_.isEmpty(card_front_url) ? (
                <TouchableOpacity
                  disabled={this.isInsuranceEmpty()}
                  onPress={() => this.onPickCard('cardFront')}
                  activeOpacity={0.7}
                  style={[styles.card, { backgroundColor: activeColor }]}
                >
                  {!this.isInsuranceEmpty() &&
                    <OMImage
                      style={styles.cardImage}
                      resizeMode={'cover'}
                      borderRadius={5}
                      indicator={Progress.Circle}
                      indicatorProps={{
                        size: 30,
                        thickness: 1,
                        borderWidth: 0,
                        color: '#fff',
                      }}
                      source={_.isPlainObject(card_front_url)
                        ? { uri: card_front_url.uri, isStatic: true }
                        : { uri: card_front_url }}
                      threshold={0}
                    />
                  }
                </TouchableOpacity>)
                : (
                  <TouchableOpacity
                    disabled={this.isInsuranceEmpty()}
                    onPress={() => this.onPickCard('cardFront')}
                    activeOpacity={0.7}
                    style={[styles.card, { backgroundColor: activeColor }]}
                  >
                    {!this.isInsuranceEmpty() &&
                      <Text allowFontScaling={false} style={styles.cardText}>
                        {I18n.t('insuranceCard')}&nbsp;
                        <Text allowFontScaling={false} style={styles.cardText}>
                          {I18n.t('front')}
                        </Text>
                      </Text>
                    }
                  </TouchableOpacity>
                )}
              back={!_.isEmpty(card_back_url) ? (
                <TouchableOpacity
                  disabled={this.isInsuranceEmpty()}
                  onPress={() => this.onPickCard('cardBack')}
                  activeOpacity={0.7}
                  style={[styles.card, { backgroundColor: activeColor }]}
                >
                  {!this.isInsuranceEmpty() &&
                    <OMImage
                      style={styles.cardImage}
                      resizeMode={'cover'}
                      borderRadius={5}
                      indicator={Progress.Circle}
                      indicatorProps={{
                        size: 30,
                        thickness: 1,
                        borderWidth: 0,
                        color: '#fff',
                      }}
                      source={_.isPlainObject(card_back_url)
                        ? { uri: card_back_url.uri, isStatic: true }
                        : { uri: card_back_url }}
                      threshold={50}
                    />
                  }
                </TouchableOpacity>)
                : (
                  <TouchableOpacity
                    disabled={this.isInsuranceEmpty()}
                    onPress={() => this.onPickCard('cardBack')}
                    activeOpacity={0.7}
                    style={[styles.card, { backgroundColor: activeColor }]}
                  >
                    {!this.isInsuranceEmpty() &&
                      <Text allowFontScaling={false} style={styles.cardText}>
                        {I18n.t('insuranceCard')}&nbsp;
                        <Text allowFontScaling={false} style={styles.cardText} Text>
                          ({I18n.t('back')})
                        </Text>
                      </Text>
                    }
                  </TouchableOpacity>
                )}
              isFlipped={showBack}
              flipAxis={'y'}
              flipEasing={Easing.out(Easing.ease)}
              flipDuration={200}
              perspective={1000}
            />
            <View style={{ marginTop: Platform.OS === 'android' ? 20 : 0 }}>
              <Text allowFontScaling={false} style={styles.txtLabel}>
                {I18n.t('groupId').toUpperCase()}
              </Text>
              <TouchableWithoutFeedback onPress={() => this._groupID.focus()}>
                <RoundedInput width={WINDOW_WIDTH - 40}>
                  <TextInput
                    ref={ref => this._groupID = ref}
                    editable={!this.isInsuranceEmpty()}
                    autoCapitalize={'none'}
                    style={[
                      styles.textInput,
                      { height: 50 }
                    ]}
                    placeholder={I18n.t('groupId')}
                    error={''}
                    autoCorrect={false}
                    onChangeText={text => this.setState({ groupId: text })}
                    value={this.state.groupId}
                    underlineColorAndroid={'transparent'}
                  />
                </RoundedInput>
              </TouchableWithoutFeedback>
            </View>
            <View>
              <Text allowFontScaling={false}style={styles.txtLabel}>
                {I18n.t('subscriberId').toUpperCase()}
              </Text>
              <TouchableWithoutFeedback onPress={() => this._memberID.focus()}>
                <RoundedInput width={WINDOW_WIDTH - 40}>
                  <TextInput
                    ref={ref => this._memberID = ref}
                    editable={!this.isInsuranceEmpty()}
                    autoCapitalize={'none'}
                    style={[
                      styles.textInput,
                      { height: 50 }
                    ]}
                    placeholder={I18n.t('subscriberId')}
                    error={''}
                    autoCorrect={false}
                    onChangeText={text => this.setState({ subscriberId: text })}
                    value={this.state.subscriberId}
                    underlineColorAndroid={'transparent'}
                  />
                </RoundedInput>
              </TouchableWithoutFeedback>
            </View>
          </Panel>
          <ActionSheet
            ref={ref => this.actionSheet = ref}
            title={''}
            options={[I18n.t('cancel'), I18n.t('fromLibrary'), I18n.t('fromCamera')]}
            cancelButtonIndex={0}
            destructiveButtonIndex={4}
            onPress={i => setTimeout(() => {
              this.chooseImageItem(i);
            }, 300)}
          />
        </KeyboardAwareScrollView>
        <PatientListModal
          ref={ref => this.patientListModal = ref}
          patients={patient.patients}
          onAddPatient={this.onAddPatient}
          onPatientSelected={this.onPatientSelected}
          onBackgroundClicked={this.expandNavBar}
        />
        <InsuranceModal
          ref={ref => this.insuranceModal = ref}
          insurances={insurances}
          onSelectInsurance={insuranceData => this.onSelectInsurance(insuranceData)}
        />
        {isChecking && <Loading color={WHITE} showOverlay={true} />}
      </View>
    );
  }
}

EditInsuranceContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  mode: PropTypes.number.isRequired,
  onRequestInsurance: PropTypes.func,
  setCurrentPatient: PropTypes.func.isRequired,
  updatePatientInsurance: PropTypes.func.isRequired,
  addPatientInsurance: PropTypes.func.isRequired,
  patient: PropTypes.shape({}).isRequired,
  insurance: PropTypes.shape({}).isRequired,
  patientInsurance: PropTypes.shape({}),
};

EditInsuranceContainer.defaultProps = {
  onRequestInsurance: undefined,
  patientInsurance: undefined
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectInsurance()
)(EditInsuranceContainer);
