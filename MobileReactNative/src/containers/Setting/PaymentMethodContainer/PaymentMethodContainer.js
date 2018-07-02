// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList, Alert
} from 'react-native';
import { connectAuth, connectPatient, connectProvider } from 'AppRedux';
import {
  BACKGROUND_GRAY,
  PLACEHOLDER,
  PRIMARY_COLOR,
  LINE,
  TEXT
} from 'AppColors';
import {
  CalendarTopNav,
  NormalButton,
  Panel,
  PaymentHistoryTab,
  CardList,
  Loading,
} from 'AppComponents';
import { SFRegular } from 'AppFonts';
import { compose } from 'recompose';
import I18n from 'react-native-i18n';
import { promisify, AlertMessage } from 'AppUtilities';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND_GRAY,
    flex: 1
  },
  buttonSaveLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  },
  txtPaymentMethod: {
    marginLeft: 10,
    fontSize: 14,
    color: TEXT,
    marginVertical: 10
  },
  txtPaymentRequest: {
    marginLeft: 10,
    fontSize: 14,
    color: PLACEHOLDER,
    marginVertical: 10
  },
  txtAdd: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    padding: 15
  },
  labelRowView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  panelStyle: {
    paddingHorizontal: 0,
    borderColor: LINE,
    borderWidth: 1
  }
});

class PaymentMethodContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 1, isChecking: false
    };
  }

  onSave = () => {
    this.props.onPaymentDone();
  }

  onAddNewPaymentMethod = () => {
    const {
      routeScene, isDirect, first_name, onPaymentDone
    } = this.props;
    routeScene(
      'EditPaymentMethodScene',
      {
        mode: 1,
        isDirect,
        first_name,
        onPaymentDone
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        }
      }
    );
  };

  onClickPaymentDetails = (data) => {
    this.props.routeScene(
      'PaymentDetailsScene',
      {
        mode: 1,
        selectedPayment: data
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        }
      }
    );
  }
  deletePaymentMethod = (id) => {
    const { removePatientCard } = this.props;
    this.setState({ isChecking: true });
    promisify(removePatientCard, {
      id
    }).then(() => {
      this.setState({ isChecking: false });
    }).catch(error => AlertMessage.fromRequest(error))
      .finally(() => this.setState({ isChecking: false }));
  }

  onPressDeletePayment = (id) => {
    Alert.alert(
      'OpenMed', I18n.t('wantToRemoveCard'),
      [
        { text: I18n.t('no') },
        {
          text: I18n.t('yes'),
          onPress: () => this.deletePaymentMethod(id)
        }
      ]
    );
  }

  onSelectCard = (data) => {
    const {
      isDirect,
      first_name,
      routeScene,
      onPaymentDone
    } = this.props;
    routeScene(
      'CardDetailsScene',
      {
        selectedCard: data,
        isDirect,
        first_name,
        onPaymentDone
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        }
      }
    );
  };

  renderLabel = () => {
    const { first_name, cancellationMessage } = this.props;
    if (this.props.isDirect) {
      return (
        <View style={styles.labelRowView}>
          <SFRegular allowFontScaling={false} style={styles.txtPaymentRequest}>
            {(cancellationMessage) ? `${first_name} ${cancellationMessage}`
              :
              I18n.t('CardRequestMessage', { first_name })}
          </SFRegular>
        </View>
      );
    }
    return null;
  }

  renderButton = () => {
    const { isDirect, patient } = this.props;
    if (isDirect && patient.activeCard.length === 0) {
      return (
        <View>
          <TouchableOpacity onPress={() => {
            this.onAddNewPaymentMethod();
          }}
          >
            <SFRegular allowFontScaling={false} style={styles.txtAdd}>{I18n.t('addNew')}</SFRegular>
          </TouchableOpacity>
        </View>
      );
    }
    if (!isDirect) {
      return (
        <View>
          <TouchableOpacity onPress={() => {
            this.onAddNewPaymentMethod();
          }}
          >
            <SFRegular allowFontScaling={false} style={styles.txtAdd}>{I18n.t('addNew')}</SFRegular>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  render() {
    const { patient, routeBack, isDirect } = this.props;
    const { activePatient, cardData, paymentHistory } = patient;

    return (
      <View style={styles.container}>
        <CalendarTopNav
          onBack={routeBack}
          activePatient={activePatient}
        />
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View>
            <SFRegular allowFontScaling={false} style={styles.txtPaymentMethod}>
              {I18n.t('paymentMethod').toUpperCase()}
            </SFRegular>
            <Panel style={styles.panelStyle}>
              {this.renderLabel()}
              <FlatList
                data={cardData}
                style={styles.providers}
                keyExtractor={(item, index) => `#${index}`}
                refreshing={false}
                renderItem={({ item }) => {
                  return (
                    <CardList
                      cardData={item}
                      onPressDeletePayment={this.onPressDeletePayment}
                      onSelectCard={this.onSelectCard}
                    />
                  );
                }}
              />
              {this.renderButton()}
            </Panel>
          </View>
          {!isDirect && paymentHistory.length > 0 &&
          <View style={{ marginTop: 40 }}>
            <Text allowFontScaling={false} style={styles.txtPaymentMethod}>
              {I18n.t('payments').toUpperCase()}
            </Text>
            <Panel style={styles.panelStyle}>
              <FlatList
                data={paymentHistory}
                style={styles.providers}
                keyExtractor={(item, index) => `#${index}`}
                refreshing={false}
                renderItem={({ item }) => {
                  return (
                    <PaymentHistoryTab
                      paymentHistoryData={item}
                      activeTab={this.state.activeTab}
                      onClick={this.onClickPaymentDetails}
                    />
                  );
                }}
              />
            </Panel>
          </View>}
        </KeyboardAwareScrollView>
        {isDirect && patient.activeCard.length !== 0 &&
        <NormalButton
          text={I18n.t('requestAppointment').toUpperCase()}
          style={styles.buttonSave}
          textStyle={styles.buttonSaveLabel}
          pressed={true}
          borderRadius={0}
          onPress={() => { this.onSave(); }}
        />}
        {this.state.isChecking &&
        <Loading showOverlay={true} isTopLevel={true} />
        }
      </View>
    );
  }
}

PaymentMethodContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  removePatientCard: PropTypes.func.isRequired
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectProvider()
)(PaymentMethodContainer);
