// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import I18n from 'react-native-i18n';
import { TEXT, TINT } from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import { Panel, NormalButton, Loading } from 'AppComponents';
import { connectAppointment } from 'AppRedux';
import { promisify, AlertMessage } from 'AppUtilities';
import moment from 'moment';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent'
      },
      android: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }
    }),
  },
  panel: {
    alignItems: 'center'
  },
  label: {
    color: TEXT,
    fontSize: 16,
    marginTop: 20
  },
  textDate: {
    marginBottom: 5
  },
  textTime: {
    color: TINT
  },
  textAddress: {
    fontSize: 11,
    marginBottom: 5
  },
  button: {
    width: WINDOW_WIDTH * 0.6,
    marginTop: 20,
  },
  textStyle: {
    fontFamily: 'SFUIText-Bold',
  },
  normalTextStyle: {
    fontFamily: 'SFUIText-Bold',
    color: TINT
  },
});

export class RequestActionDialog extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isChecking: false
    };
  }

  proposeTime = () => {
    const { selectedAppointment, onProposeAnotherTime } = this.props;
    onProposeAnotherTime(selectedAppointment);
  };

  declineAppt = () => {
    const { declineAppointment, selectedAppointment, dismissLightBox } = this.props;

    const desiredTime = selectedAppointment.selected_time;

    if (desiredTime && desiredTime !== 0) {
      const currentDate = moment(new Date());
      const duration = moment.duration(moment.unix(desiredTime).diff(currentDate));
      const remainingHours = duration.asHours();
      if (remainingHours < 24) {
        AlertMessage.fromRequest(I18n.t('youCannotDeclineThisAppointment'));
        return;
      }
    }

    this.setState({ isChecking: true });
    promisify(declineAppointment, { appointmentId: selectedAppointment.id })
      .then(() => dismissLightBox())
      .catch((error) => AlertMessage.fromRequest(error))
      .finally(() => this.setState({ isChecking: false }));
  };

  viewDetails = () => {
    const { selectedAppointment, onViewDetails } = this.props;
    onViewDetails(selectedAppointment);
  };

  cancel = () => {
    Alert.alert(
      'OpenMed',
      I18n.t('areYouSureYouWantToCancelAppointment'),
      [
        {
          text: I18n.t('yes'),
          onPress: () => {
            this.declineAppt();
          }
        },
        { text: I18n.t('no') }
      ]
    );
  };

  render() {
    const { isChecking } = this.state;
    const { selectedAppointment, dismissLightBox } = this.props;
    const { provider } = selectedAppointment;

    /**
     * Disable cancel button if an appointment is requested/booked in the past
     */
    const desiredTime = selectedAppointment.selected_time || selectedAppointment.desired_time;
    const cancelDisabled = !desiredTime ? false : moment.unix(desiredTime) < moment(new Date());

    return (
      <View style={styles.container}>
        <Panel
          title={provider.full_name}
          style={styles.panel}
        >
          {!selectedAppointment.is_direct_booking &&
            <NormalButton
              disabled={cancelDisabled}
              text={I18n.t('proposeNew').toUpperCase()}
              style={styles.button}
              textStyle={styles.textStyle}
              pressed={true}
              onPress={() => this.proposeTime()}
              dropShadow={true}
            />
          }
          <NormalButton
            disabled={cancelDisabled}
            text={I18n.t('cancelAppointment').toUpperCase()}
            style={styles.button}
            textStyle={styles.textStyle}
            onPress={() => this.cancel()}
            borderWidth={1}
          />
          <NormalButton
            text={I18n.t('viewDetails').toUpperCase()}
            style={styles.button}
            textStyle={styles.textStyle}
            onPress={() => this.viewDetails()}
            borderWidth={1}
          />
          <NormalButton
            text={I18n.t('ok').toUpperCase()}
            style={[styles.button, { marginTop: 30, marginBottom: 20 }]}
            textStyle={styles.normalTextStyle}
            onPress={() => dismissLightBox()}
            borderWidth={1}
          />
        </Panel>
        {isChecking && <Loading showOverlay={true} />}
      </View>
    );
  }
}

RequestActionDialog.propTypes = {
  routeScene: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  selectedAppointment: PropTypes.object.isRequired,
  declineAppointment: PropTypes.func.isRequired,
  onProposeAnotherTime: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
};

export default connectAppointment()(RequestActionDialog);
