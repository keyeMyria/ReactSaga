// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { SFMedium, SFRegular, SFBold } from 'AppFonts';
import { connectAuth, connectPatient } from 'AppRedux';
import { AlertMessage, promisify } from 'AppUtilities';
import {
  TEXT,
  BACKGROUND_GRAY,
  BLACK,
  LINE,
  BACKGROUND,
  PRIMARY_COLOR
} from 'AppColors';
import {
  Panel,
  PaymentMethodTopNav,
  NormalButton,
  Loading,
  OMImage
} from 'AppComponents';
import { compose } from 'recompose';
import I18n from 'react-native-i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import stripeCardValidator from 'stripe-card-validator';
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
  txtPaymentMethod: {
    marginLeft: 10,
    fontSize: 12,
    color: TEXT,
    marginVertical: 10
  },
  textInput: {
    backgroundColor: BACKGROUND,
    fontSize: 15,
    color: BLACK
  },
  inputView: {
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    marginHorizontal: 18,
  },
  activeInputView: {
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_COLOR,
    marginHorizontal: 18,
  },
  txtLabel: {
    color: TEXT,
    fontSize: 14,
    marginTop: 10,
    marginHorizontal: 18
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  isDirectContainer: {
    flex: 1,
    paddingHorizontal: 10
  },
  isDirectInputView: {
    borderBottomColor: LINE,
    borderBottomWidth: 1,
    flexDirection: 'row'
  },
  isDirectActiveInputView: {
    borderBottomColor: PRIMARY_COLOR,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  isDirectTextInputView: {
    borderBottomWidth: 0,
    borderBottomColor: LINE,
    marginHorizontal: 18,
    flex: 1,
  },
  isDirectTextLabel: {
    color: TEXT,
    fontSize: 12,
    marginTop: 10,
    marginHorizontal: 5,
    paddingVertical: 5
  },
  buttonSave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  buttonSaveLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  },
  iconViewStyle: {
    marginHorizontal: 5,
    paddingVertical: 5
  },
  switchView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10
  }
});

class EditPaymentMethodContainer extends PureComponent {
  constructor(props, context: mixed) {
    super(props, context);
    this.state = {
      name: this.props.patient.activePatient.full_name,
      cardImage: require('img/images/card/credit-card.png'),
      cardNumber: '',
      expDate: '',
      cvv: '',
      isChecking: false,
      isChanged: false,
      paymentSwitch: false,
      activeInput: 0,
    };
  }

  createToken = () => {
    const {
      cardNumber,
      expDate,
      cvv,
      name
    } = this.state;
    const { addPatientCard } = this.props;
    const currentYear = new Date().getFullYear().toString().substr(-2);
    const currentMonth = new Date().getMonth() + 1;
    const expYear = expDate.split('/');
    const cardNumberCheck = cardNumber.replace(/ +/g, '');
    if (name.length <= 0) {
      AlertMessage.fromRequest(I18n.t('invalidNameError'));
      return false;
    } if (!(/^([0-9]{14,16})$/.test(cardNumberCheck))) {
      AlertMessage.fromRequest(I18n.t('inValidCardError'));
      return false;
    } else if (Number(expYear[1]) < currentYear ||
      (Number(expYear[1]) === currentYear && Number(expYear[0]) <= currentMonth)
        || expDate.length <= 0) {
      AlertMessage.fromRequest(I18n.t('inValidExpDateError'));
      return false;
    } else if (!(/^[0-9]{3,4}$/.test(cvv))) {
      AlertMessage.fromRequest(I18n.t('inValidCVVError'));
      return false;
    }

    this.setState({ isChecking: true });
    const apiKey = 'sk_test_YiQAF24wlomfGIEEyXJfbWbs';
    const quary = `card[name]=${name}&card[number]=${cardNumberCheck}&card[exp_month]=${expYear[0]}&card[exp_year]=${expYear[1]}&card[cvc]=${cvv}`;

    fetch(`https://api.stripe.com/v1/tokens?${quary}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${apiKey}`
      }
    }).then(resp => resp.json())
      .then((data) => {
        if (data.error) {
          AlertMessage.fromRequest(data.error.message);
          this.setState({ isChecking: false });
        } else {
          promisify(addPatientCard, {
            token: data.id,
            is_main: this.state.paymentSwitch
          }).then(() => {
            this.props.routeBack();
          }).catch((error) => {
            if (error === 'The same card already exists') {
              Alert.alert(
                'OpenMed', I18n.t('alreadyCard'),
                [
                  {
                    text: I18n.t('no'),
                    onPress: () => this.props.routeBack()
                  },
                  {
                    text: I18n.t('yes'),
                    onPress: () => this.setState({ cardNumber: '', cvv: '', expDate: '' })
                  }
                ]
              );
            } else {
              AlertMessage.fromRequest(error);
            }
          })
            .finally(() => this.setState({ isChecking: false }));
        }
      });
    return null;
  }

  setActiveCreditCard = (id) => {
    const { setPatientActiveCard } = this.props;
    this.setState({ isChecking: true });
    const data = { is_main: true };
    promisify(setPatientActiveCard, {
      data,
      id
    }).then(() => {
      this.props.routeBack();
    }).catch(error => AlertMessage.fromRequest(error))
      .finally(() => this.setState({ isChecking: false }));
  }

  setCardImage = () => {
    let cardImage;
    try {
      let cardType = stripeCardValidator(this.state.cardNumber);
      cardType = cardType.toLowerCase();
      switch (cardType) {
        case 'master card':
          cardImage = require('img/images/card/mastercard.png');
          this.setState({ cardImage });
          break;
        case 'american express':
          cardImage = require('img/images/card/american-express.png');
          this.setState({ cardImage });
          break;
        case 'visa':
          cardImage = require('img/images/card/visa.png');
          this.setState({ cardImage });
          break;
        case 'discover':
          cardImage = require('img/images/card/discover.png');
          this.setState({ cardImage });
          break;
        case 'diners club':
          cardImage = require('img/images/card/diners-club-credit-card-logo.png');
          this.setState({ cardImage });
          break;
        case 'jcb':
          cardImage = require('img/images/card/jcb.png');
          this.setState({ cardImage });
          break;
        default:
          cardImage = require('img/images/card/credit-card.png');
          this.setState({ cardImage });
          break;
      }
    } catch (e) {
      cardImage = require('img/images/card/credit-card.png');
      this.setState({ cardImage });
    }
  }
  renderAddButton = () => {
    const {
      name,
      cvv,
      expDate,
      cardNumber
    } = this.state;
    if (cardNumber.length > 0 && expDate.length > 4 && cvv.length > 2 && name.length > 0) {
      this.setState({ isChanged: true });
    }
  }

  setPaymentMethod = () => {
    this.setState({ paymentSwitch: !this.state.paymentSwitch });
  }

  onSave = () => {
    this.createToken();
  };


  setCardNumber = (cardNumber) => {
    let formattedCardNumber = cardNumber.split(' ').join('');
    if (formattedCardNumber.length > 0) {
      formattedCardNumber = formattedCardNumber.match(new RegExp('.{1,4}', 'g')).join(' ');
    }
    this.setCardImage();
    this.setState({ cardNumber: formattedCardNumber, isChanged: false }, () => {
      this.renderAddButton();
    });
  }

  setName = (name) => {
    this.setState({ name, isChanged: false }, () => {
      this.renderAddButton();
    });
  }

  setexpDate = (expDates) => {
    let expDate = expDates;
    if (expDate.length === 3 && expDate.includes('/')) {
      const date = expDate.split('');
      this.setState({ expDate: date[0] + date[1] });
      return false;
    }
    if (expDate.length === 3 && !expDate.includes('/')) {
      const date = expDate.split('');
      this.setState({ expDate: `${date[0] + date[1]}/${date[2]}` });
      return false;
    }
    if (expDate.length === 1 && Number(expDate) > 1) {
      expDate = `0${expDate}/`;
    }
    const date = expDate.split('');
    if (expDate.length === 2 && Number(date[0]) !== 0 && Number(date[1]) > 2) {
      return false;
    }
    if (expDate.length === 2 && Number(date[0]) === 0 && Number(date[1]) === 0) {
      return false;
    }
    if (expDate.length === 2) {
      expDate += '/';
    }

    this.setState({ expDate, isChanged: false }, () => {
      this.renderAddButton();
    });
    return null;
  }

  setcvv = (cvv) => {
    this.setState({ cvv, isChanged: false }, () => {
      this.renderAddButton();
    });
  }

  onFocus= (id) => {
    this.setState({ activeInput: id });
  }
  onBlur = (id) => {
    this.setState({ activeInput: id });
  }

  renderInput = () => {
    const { isDirect } = this.props;
    if (isDirect) {
      return (
        <View>
          <View style={[styles.isDirectContainer, { paddingTop: 10 }]}>
            <View style={this.state.activeInput === 1 ? styles.isDirectActiveInputView :
              styles.isDirectInputView}
            >
              <View style={styles.iconViewStyle}>
                <OMImage
                  style={{ height: 30, width: 30 }}
                  resizeMode={'contain'}
                  indicator={Progress.Circle}
                  indicatorProps={{
                    size: 10,
                    thickness: 0.5,
                    borderWidth: 0,
                    color: PRIMARY_COLOR,
                  }}
                  placeholder={this.state.cardImage}
                  threshold={50}
                />
              </View>
              <View style={styles.isDirectTextInputView}>
                <TextInput
                  autoCapitalize={'words'}
                  style={[styles.textInput, { height: 40, width: '90%' }]}
                  placeholder={I18n.t('cardNumber')}
                  error={''}
                  onBlur={() => this.onBlur(1)}
                  onFocus={() => this.onFocus(1)}
                  autoCorrect={false}
                  onChangeText={(cardNumber) => { this.setCardNumber(cardNumber); }}
                  value={this.state.cardNumber}
                  underlineColorAndroid={'transparent'}
                  keyboardType={'numeric'}
                  minLength={14}
                  maxLength={19}
                />
              </View>
              <View style={styles.iconViewStyle}>
                <OMImage
                  style={{ height: 20, width: 20, marginTop: 10 }}
                  resizeMode={'cover'}
                  indicator={Progress.Circle}
                  indicatorProps={{
                    size: 10,
                    thickness: 0.5,
                    borderWidth: 0,
                    color: PRIMARY_COLOR,
                  }}
                  placeholder={require('img/images/card/lock.png')}
                  threshold={50}
                />
              </View>
            </View>
          </View>
          <View style={styles.isDirectContainer}>
            <View style={this.state.activeInput === 2 ? styles.isDirectActiveInputView :
              styles.isDirectInputView}
            >
              <SFBold allowFontScaling={false} style={styles.isDirectTextLabel}>
                {I18n.t('cardHolderName').toUpperCase()}
              </SFBold>
              <View style={styles.isDirectTextInputView}>
                <TextInput
                  autoCapitalize={'words'}
                  style={[styles.textInput, { height: 40 }]}
                  placeholder={I18n.t('cardHolderName')}
                  error={''}
                  onBlur={() => this.onBlur(2)}
                  onFocus={() => this.onFocus(2)}
                  autoCorrect={false}
                  onChangeText={(name) => { this.setName(name); }}
                  value={this.state.name}
                  underlineColorAndroid={'transparent'}
                />
              </View>
            </View>
          </View>
          <View style={styles.isDirectContainer}>
            <View style={this.state.activeInput === 3 ? styles.isDirectActiveInputView :
              styles.isDirectInputView}
            >
              <SFBold allowFontScaling={false} style={styles.isDirectTextLabel}>
                {I18n.t('expDate').toUpperCase()}
              </SFBold>
              <View style={styles.isDirectTextInputView}>
                <TextInput
                  autoCapitalize={'words'}
                  style={[styles.textInput, { height: 40, }]}
                  placeholder={I18n.t('expDatePlaceholder')}
                  error={''}
                  onBlur={() => this.onBlur(3)}
                  onFocus={() => this.onFocus(3)}
                  autoCorrect={false}
                  onChangeText={(expDate) => { this.setexpDate(expDate); }}
                  value={this.state.expDate}
                  keyboardType={'numeric'}
                  minLength={5}
                  maxLength={5}
                  underlineColorAndroid={'transparent'}
                />
              </View>
            </View>
          </View>
          <View style={styles.isDirectContainer}>
            <View style={this.state.activeInput === 4 ? styles.isDirectActiveInputView :
              styles.isDirectInputView}
            >
              <SFBold allowFontScaling={false} style={styles.isDirectTextLabel}>
                {I18n.t('cvv').toUpperCase()}
              </SFBold>
              <View style={styles.isDirectTextInputView}>
                <TextInput
                  autoCapitalize={'words'}
                  style={[styles.textInput, { height: 40 }]}
                  placeholder={I18n.t('cvv')}
                  error={''}
                  onBlur={() => this.onBlur(4)}
                  onFocus={() => this.onFocus(4)}
                  autoCorrect={false}
                  onChangeText={(cvv) => { this.setcvv(cvv); }}
                  value={this.state.cvv}
                  keyboardType={'numeric'}
                  minLength={3}
                  maxLength={4}
                  underlineColorAndroid={'transparent'}
                />
              </View>
            </View>
          </View>
          <View style={styles.isDirectContainer}>
            <View style={[styles.switchView, { justifyContent: 'center', alignItems: 'center' }]}>
              <SFBold
                allowFontScaling={false}
                style={[styles.isDirectTextLabel, { paddingTop: -5 }]}
              >
                {I18n.t('paymentSwitchText')}
              </SFBold>
              {Platform.OS === 'ios' ?
                <Switch
                  onValueChange={() => { this.setPaymentMethod(); }}
                  value={this.state.paymentSwitch}
                  onTintColor={PRIMARY_COLOR}
                  tintColor={PRIMARY_COLOR}
                />
                :
                <Switch
                  onValueChange={() => { this.setPaymentMethod(); }}
                  value={this.state.paymentSwitch}
                  onTintColor={PRIMARY_COLOR}
                />
              }
            </View>
          </View>
        </View>
      );
    }
    this.setState({ paymentSwitch: true });
    return (
      <View>
        <View>
          <SFRegular allowFontScaling={false} style={styles.txtLabel}>
            {I18n.t('cardHolderName').toUpperCase()}
          </SFRegular>
          <View style={this.state.activeInput === 1 ? styles.activeInputView : styles.inputView}>
            <TextInput
              autoCapitalize={'words'}
              style={[styles.textInput, { height: 40 }]}
              placeholder={I18n.t('cardHolderName')}
              error={''}
              onBlur={() => this.onBlur(1)}
              onFocus={() => this.onFocus(1)}
              autoCorrect={false}
              onChangeText={(name) => { this.setName(name); }}
              value={this.state.name}
              underlineColorAndroid={'transparent'}
            />
          </View>
        </View>
        <View>
          <SFRegular allowFontScaling={false} style={styles.txtLabel}>
            {I18n.t('cardNumber').toUpperCase()}
          </SFRegular>
          <View style={[this.state.activeInput === 2 ? styles.activeInputView :
            styles.inputView, styles.rowView]}
          >
            <TextInput
              autoCapitalize={'words'}
              style={[styles.textInput, { height: 40, width: '80%' }]}
              placeholder={I18n.t('cardNumber')}
              error={''}
              onBlur={() => this.onBlur(2)}
              onFocus={() => this.onFocus(2)}
              autoCorrect={false}
              onChangeText={(cardNumber) => { this.setCardNumber(cardNumber); }}
              value={this.state.cardNumber}
              underlineColorAndroid={'transparent'}
              keyboardType={'numeric'}
              minLength={14}
              maxLength={19}
            />
            <OMImage
              style={{ height: 40, width: 30 }}
              resizeMode={'contain'}
              indicator={Progress.Circle}
              indicatorProps={{
                size: 10,
                thickness: 0.5,
                borderWidth: 0,
                color: PRIMARY_COLOR,
              }}
              placeholder={this.state.cardImage}
              threshold={50}
            />
          </View>
        </View>
        <View>
          <SFRegular allowFontScaling={false} style={styles.txtLabel}>
            {I18n.t('expDate').toUpperCase()}
          </SFRegular>
          <View style={this.state.activeInput === 3 ? styles.activeInputView : styles.inputView}>
            <TextInput
              autoCapitalize={'words'}
              style={[styles.textInput, { height: 40 }]}
              placeholder={I18n.t('expDatePlaceholder')}
              error={''}
              onBlur={() => this.onBlur(3)}
              onFocus={() => this.onFocus(3)}
              autoCorrect={false}
              onChangeText={(expDate) => { this.setexpDate(expDate); }}
              value={this.state.expDate}
              keyboardType={'numeric'}
              minLength={5}
              maxLength={5}
              underlineColorAndroid={'transparent'}
            />
          </View>
        </View>
        <View>
          <SFRegular allowFontScaling={false} style={styles.txtLabel}>
            {I18n.t('cvv').toUpperCase()}
          </SFRegular>
          <View style={[this.state.activeInput === 4 ? styles.activeInputView :
            styles.inputView, styles.rowView]}
          >
            <TextInput
              autoCapitalize={'words'}
              style={[styles.textInput, { height: 40, width: '80%' }]}
              placeholder={I18n.t('cvv')}
              error={''}
              onBlur={() => this.onBlur(4)}
              onFocus={() => this.onFocus(4)}
              autoCorrect={false}
              onChangeText={(cvv) => { this.setcvv(cvv); }}
              value={this.state.cvv}
              keyboardType={'numeric'}
              minLength={3}
              maxLength={4}
              underlineColorAndroid={'transparent'}
            />
            <TouchableOpacity onPress={() => { AlertMessage.fromRequest(I18n.t('cvvHelp')); }}>
              <OMImage
                style={{ height: 20, width: 20, marginTop: 10 }}
                resizeMode={'contain'}
                indicator={Progress.Circle}
                indicatorProps={{
                  size: 10,
                  thickness: 0.5,
                  borderWidth: 0,
                  color: PRIMARY_COLOR,
                }}
                placeholder={require('img/images/card/info.png')}
                threshold={50}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  render() {
    const {
      patient,
      routeBack,
      mode,
      isDirect
    } = this.props;

    return (
      <View style={styles.flex}>
        <PaymentMethodTopNav
          title={mode === 1 || mode === 3 ? I18n.t('addPaymentMethod') :
            I18n.t('editPaymentMethod')}
          activePatient={patient.activePatient}
          onSave={this.onSave}
          onBack={routeBack}
          isViewable={false}
          isDirect={isDirect}
        />
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          {!isDirect &&
          <SFRegular allowFontScaling={false}style={styles.txtPaymentMethod}>
            {I18n.t('addPaymentMethod').toUpperCase()}
          </SFRegular>
          }
          <Panel>
            <View style={{ paddingVertical: 20 }}>
              {isDirect &&
              <SFBold allowFontScaling={false} style={styles.isDirectTextLabel}>
                {I18n.t('enterCardDetails')}
              </SFBold>}
              {!isDirect &&
              <SFMedium allowFontScaling={false} style={[styles.txtLabel, { fontSize: 18 }]}>
                {I18n.t('enterCardDetails')}
              </SFMedium>}
              {this.renderInput()}
            </View>
          </Panel>
        </KeyboardAwareScrollView>
        {this.state.isChanged &&
        <NormalButton
          text={I18n.t('save').toUpperCase()}
          style={styles.buttonSave}
          textStyle={styles.buttonSaveLabel}
          pressed={true}
          borderRadius={0}
          onPress={() => { this.onSave(); }}
        />
        }
        {this.state.isChecking &&
        <Loading showOverlay={true} isTopLevel={true} />
        }
      </View>
    );
  }
}

EditPaymentMethodContainer.propTypes = {
  routeBack: PropTypes.func.isRequired,
  addPatientCard: PropTypes.func.isRequired,
  mode: PropTypes.number.isRequired,
  patient: PropTypes.shape({}).isRequired,
  setPatientActiveCard: PropTypes.func.isRequired
};

EditPaymentMethodContainer.defaultProps = {

};

export default compose(
  connectAuth(),
  connectPatient()
)(EditPaymentMethodContainer);
