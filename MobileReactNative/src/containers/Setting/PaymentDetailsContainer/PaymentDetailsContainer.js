// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Image
} from 'react-native';
import { connectAuth, connectPatient } from 'AppRedux';
import {
  BACKGROUND_GRAY,
  PLACEHOLDER,
  PURPLISH_GREY,
  TEXT
} from 'AppColors';
import {
  ProviderDetailTopNav,
  Panel,
  Avatar,
  MarkerInfo,
  NormalButton
} from 'AppComponents';
import { WINDOW_WIDTH } from 'AppConstants';
import { compose } from 'recompose';
import I18n from 'react-native-i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SFRegular, SFBold } from 'AppFonts';
import MapView from 'react-native-maps';
import moment from 'moment/moment';

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND_GRAY,
    flex: 1
  },
  buttonSaveLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14,
    paddingHorizontal: 30,
    paddingVertical: 5
  },
  txtPaymentMethod: {
    marginLeft: 10,
    fontSize: 14,
    color: TEXT,
    marginVertical: 10
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  columnView: {
    flexDirection: 'column',
    justifyContent: 'center'
  },
  bottomLine: {
    borderBottomWidth: 1,
    borderBottomColor: BACKGROUND_GRAY
  },
  buttonView: {
    margin: 15,
    alignItems: 'center'
  },
  mapView: {
    width: WINDOW_WIDTH - 20,
    height: 100,
    marginHorizontal: 10
  },
  buttonSave: {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
  },
  appointments: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15
  },
  keyItem: {
    alignItems: 'center',
    maxWidth: (WINDOW_WIDTH - 90) / 3
  },
  keyIcon: {
    width: 21,
    height: 23,
    resizeMode: 'contain'
  },
  keyTitle: {
    marginTop: 13,
    fontSize: 12,
    color: PURPLISH_GREY,
    minWidth: 75,
    textAlign: 'center'
  },
  detailTextView: {
    width: WINDOW_WIDTH / 2,
    marginVertical: 5
  },
  detailsView: {
    marginVertical: 15,
    marginHorizontal: 20
  },
  detailLabelText: {
    fontSize: 14,
    color: TEXT
  },
  detailLabelValue: {
    fontSize: 14,
    color: PLACEHOLDER
  }

});

class PaymentDetailsContainer extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isNavBarExpanded: false,
    };
  }

  renderAppointmentDetails = () => {
    const date = moment.unix(this.props.selectedPayment.appointment_to_practice.created_at)
      .format('MM/DD/YYYY');
    const time = moment.unix(this.props.selectedPayment.appointment_to_practice.created_at)
      .format('hh:mm A');
    return (
      <View style={styles.appointments}>
        <View style={styles.keyItem}>
          <Image
            source={require('img/icons/ic_dmac.png')}
            style={styles.keyIcon}
          />
          <SFRegular style={styles.keyTitle}>
            {'Consult'}
          </SFRegular>
        </View>
        <View style={styles.keyItem}>
          <Image
            source={require('img/icons/ic_calendar.png')}
            style={styles.keyIcon}
          />
          <SFRegular style={styles.keyTitle}>
            {date}
          </SFRegular>
        </View>
        <View style={styles.keyItem}>
          <Image
            source={require('img/icons/ic_clock.png')}
            style={styles.keyIcon}
          />
          <SFRegular style={styles.keyTitle}>
            {time}
          </SFRegular>
        </View>
      </View>
    );
  };

  onSave = () => {

  }

  render() {
    const { patient, routeBack, selectedPayment } = this.props;
    const { isNavBarExpanded } = this.state;

    const initRegion = {
      latitude: selectedPayment.practice.latitude,
      longitude: selectedPayment.practice.longitude,
      latitudeDelta: 0.00322,
      longitudeDelta: 0.00121
    };

    const date = moment.unix(selectedPayment.appointment_to_practice.created_at)
      .format('MM/DD/YYYY');
    const time = moment.unix(selectedPayment.appointment_to_practice.created_at)
      .format('hh:mm A');

    return (
      <View style={styles.container}>
        <ProviderDetailTopNav
          activePatient={patient.activePatient}
          onBack={routeBack}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
        />
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <SFRegular allowFontScaling={false} style={styles.txtPaymentMethod}>
            {I18n.t('paymentDetails').toUpperCase()}
          </SFRegular>
          <Panel>
            <View>
              <View style={styles.columnView}>
                <View style={styles.bottomLine}>
                  <View style={styles.detailsView}>
                    <View style={styles.rowView}>
                      <Avatar
                        size={60}
                        source={selectedPayment.provider.photo_url}
                        placeholder={{
                          first_name: selectedPayment.provider.first_name,
                          last_name: selectedPayment.provider.last_name
                        }}
                        style={styles.avatarT}
                      />
                      <View style={[styles.columnView, { marginHorizontal: 15 }]}>
                        <SFBold style={{ fontSize: 16, color: TEXT }}>
                          Dr. {selectedPayment.provider.full_name}
                        </SFBold>
                        <SFRegular style={{ fontSize: 14, color: TEXT }}>
                          {selectedPayment.appointment_to_practice
                            .appointment_request.specialty.name}
                        </SFRegular>
                        <SFRegular style={{ fontSize: 12, color: PLACEHOLDER }}>
                          {selectedPayment.practice.full_address}
                        </SFRegular>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.bottomLine}>
                  <View style={styles.detailsView}>
                    <View style={[styles.rowView]}>
                      <View style={styles.detailTextView}>
                        <SFRegular style={styles.detailLabelText}>{`${date}, ${time}`}</SFRegular>
                      </View>
                      <View style={styles.detailTextView}>
                        <SFRegular style={styles.detailLabelValue}>
                          ${selectedPayment.amount}
                        </SFRegular>
                      </View>
                    </View>
                    <View style={[styles.rowView]}>
                      <View style={styles.detailTextView}>
                        <SFRegular style={styles.detailLabelText}>
                          {I18n.t('paymentReason')}:
                        </SFRegular>
                      </View>
                      <View style={styles.detailTextView}>
                        <SFRegular style={styles.detailLabelValue}>
                          {selectedPayment.description}
                        </SFRegular>
                      </View>
                    </View>
                    <View style={[styles.rowView]}>
                      <View style={styles.detailTextView}>
                        <SFRegular style={styles.detailLabelText}>
                          {I18n.t('paymentMethod')}:
                        </SFRegular>
                      </View>
                      <View style={styles.detailTextView}>
                        <SFRegular style={styles.detailLabelValue}>Visa</SFRegular>
                      </View>
                    </View>
                    <View style={[styles.rowView]}>
                      <View style={styles.detailTextView}>
                        <SFRegular style={styles.detailLabelText}>{I18n.t('patient')}:</SFRegular>
                      </View>
                      <View style={styles.detailTextView}>
                        <SFRegular style={styles.detailLabelValue}>
                          {selectedPayment.user.full_name}
                        </SFRegular>
                      </View>
                    </View>
                  </View>
                </View>
                <View>{this.renderAppointmentDetails()}</View>
              </View>
            </View>
          </Panel>
          <View>
            <MapView
              ref={ref => this.map = ref}
              style={styles.mapView}
              region={initRegion}
              showsMyLocationButton={false}
              rotateEnabled={false}
              showsCompass={false}
            >
              <MarkerInfo
                region={initRegion}
                text={selectedPayment.practice.address}
              />
            </MapView>
          </View>
          <Panel>
            <View style={styles.buttonView}>
              <NormalButton
                text={I18n.t('requestAppointmentAgain').toUpperCase()}
                style={styles.buttonSave}
                textStyle={styles.buttonSaveLabel}
                pressed={true}
                borderRadius={40}
                onPress={() => this.onSave()}
              />
            </View>
          </Panel>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

PaymentDetailsContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired
};

export default compose(
  connectAuth(),
  connectPatient()
)(PaymentDetailsContainer);
