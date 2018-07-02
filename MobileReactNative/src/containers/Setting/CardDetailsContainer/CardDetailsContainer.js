// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  Image,
  Switch,
  Platform
} from 'react-native';

import { connectAuth, connectPatient } from 'AppRedux';
import { AlertMessage, promisify } from 'AppUtilities';
import {
  TEXT,
  BACKGROUND_GRAY,
  BLACK,
  LINE,
  PRIMARY_COLOR,
  BACKGROUND
} from 'AppColors';
import {
  Panel,
  PaymentMethodTopNav,
  NormalButton,
  Loading,
  OMImage
} from 'AppComponents';
import { compose } from 'recompose';
import { SFRegular } from 'AppFonts';
import I18n from 'react-native-i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
    fontSize: 12,
    marginTop: 10,
    marginHorizontal: 18
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between'
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
  switchView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginVertical: 20
  },
  inputMainView: {
    marginTop: 15,
  },
  txtCard: {
    marginLeft: 10,
    fontSize: 14,
    color: TEXT,
    marginVertical: 10
  },
});

class CardDetailsContainer extends PureComponent {
  constructor(props, context: mixed) {
    super(props, context);
    this.state = {
      cardImage: require('img/images/card/credit-card.png'),
      isChecking: false,
      isChanged: true,
      paymentSwitch: props.selectedCard.is_main
    };
  }

  setCardImage = (brand) => {
    let cardImage;
    try {
      switch (brand.toLowerCase()) {
        case 'mastercard':
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

  setPaymentMethod = () => {
    this.setState({ paymentSwitch: !this.state.paymentSwitch });
  }

  onSave = () => {
    const { selectedCard, setPatientActiveCard } = this.props;
    this.setState({ isChecking: true });
    const data = { is_main: this.state.paymentSwitch };
    promisify(setPatientActiveCard, {
      data,
      id: selectedCard.id
    }).then(() => {
      this.props.routeBack();
    }).catch(error => AlertMessage.fromRequest(error))
      .finally(() => this.setState({ isChecking: false }));
  }

  render() {
    const {
      patient,
      routeBack,
      selectedCard
    } = this.props;
    const date = `${selectedCard.exp_month}/${(selectedCard.exp_year).substr(2, 4)}`;
    this.setCardImage(selectedCard.brand);
    return (
      <View style={styles.flex}>
        <PaymentMethodTopNav
          title={I18n.t('addPaymentMethod')}
          activePatient={patient.activePatient}
          onSave={this.onSave}
          onBack={routeBack}
          isViewable={false}
          isDirect={false}
        />
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <SFRegular allowFontScaling={false} style={styles.txtCard}>
            {(selectedCard.brand).toUpperCase()}
          </SFRegular>
          <Panel>
            <View>
              <View style={styles.inputMainView}>
                <Text allowFontScaling={false} style={styles.txtLabel}>
                  {I18n.t('cardNumber').toUpperCase()}
                </Text>
                <View style={[this.state.activeInput === 2 ? styles.activeInputView :
                  styles.inputView, styles.rowView]}
                >
                  <TextInput
                    autoCapitalize={'words'}
                    style={[styles.textInput, { height: 40, width: '80%' }]}
                    placeholder={I18n.t('cardNumber')}
                    error={''}
                    value={`XXXX XXXX XXXX ${selectedCard.last4}`}
                    autoCorrect={false}
                    editable={false}
                    selectTextOnFocus={false}
                    underlineColorAndroid={'transparent'}
                    keyboardType={'numeric'}
                    minLength={14}
                    maxLength={19}
                  />
                  <Image
                    source={this.state.cardImage}
                    resizeMode={'contain'}
                    style={{ height: 40, width: 30 }}
                  />
                </View>
              </View>
              <View style={styles.inputMainView}>
                <Text allowFontScaling={false} style={styles.txtLabel}>
                  {I18n.t('expDate').toUpperCase()}
                </Text>
                <View style={this.state.activeInput === 3 ? styles.activeInputView :
                  styles.inputView}
                >
                  <TextInput
                    autoCapitalize={'words'}
                    style={[styles.textInput, { height: 40 }]}
                    placeholder={I18n.t('expDatePlaceholder')}
                    error={''}
                    autoCorrect={false}
                    editable={false}
                    selectTextOnFocus={false}
                    value={date}
                    keyboardType={'numeric'}
                    minLength={5}
                    maxLength={5}
                    underlineColorAndroid={'transparent'}
                  />
                </View>
              </View>
              <View style={[styles.switchView, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text
                  allowFontScaling={false}
                  style={[styles.isDirectTextLabel, { paddingTop: -5 }]}
                >
                  {I18n.t('paymentSwitchText')}
                </Text>
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
          </Panel>
        </KeyboardAwareScrollView>
        {this.state.isChanged &&
        <NormalButton
          text={I18n.t('save').toUpperCase()}
          style={styles.buttonSave}
          textStyle={styles.buttonSaveLabel}
          pressed={true}
          borderRadius={0}
          onPress={() => this.onSave()}
        />
        }
        {this.state.isChecking &&
        <Loading showOverlay={true} isTopLevel={true} />
        }
      </View>
    );
  }
}

CardDetailsContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  setPatientActiveCard: PropTypes.func.isRequired
};

CardDetailsContainer.defaultProps = {

};

export default compose(
  connectAuth(),
  connectPatient()
)(CardDetailsContainer);
