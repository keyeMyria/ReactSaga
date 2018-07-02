// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Platform } from 'react-native';
import I18n from 'react-native-i18n';
import { TEXT, TINT } from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';
import { Panel, NormalButton, Loading, OMButton } from 'AppComponents';
import { connectAppointment, connectPatient } from 'AppRedux';
import { SFRegular, SFMedium } from 'AppFonts';
import { promisify, AlertMessage } from 'AppUtilities';
import moment from 'moment';
import FA from 'react-native-vector-icons/FontAwesome';
import { get } from 'lodash';
import { compose } from 'recompose';

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
    marginBottom: 20,
  },
  textStyle: {
    fontFamily: 'SFUIText-Bold',
  },
  normalTextStyle: {
    fontFamily: 'SFUIText-Bold',
    color: TINT
  },
});

export class RequestProposeDialog extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isChecking: false
    };
  }

  accept = (appointmentId, time) => {
    const { acceptAppointment, onRequestUpdated, patient } = this.props;

    this.setState({ isChecking: true });

    promisify(acceptAppointment, { appointmentId, time, patientId: patient.activePatient.id })
      .then((data) => onRequestUpdated(data, time))
      .catch((error) => AlertMessage.fromRequest(error))
      .finally(() => this.setState({ isChecking: false }));
  };

  onSelectNo = () => {
    const { selectedAppointment, onNoThanksButtonClicked } = this.props;

    onNoThanksButtonClicked(selectedAppointment);
  };

  viewDetails = () => {
    const { selectedAppointment, onViewDetails } = this.props;
    onViewDetails(selectedAppointment);
  };

  render() {
    const { isChecking } = this.state;
    const { selectedAppointment } = this.props;
    const { provider, practice } = selectedAppointment;

    const newTimes = get(selectedAppointment, 'proposed_new_conditions.new_times', []);
    // eslint-disable-next-line max-len
    const title = `${provider.full_name} proposed new times`;

    return (
      <View style={styles.container}>
        <Panel
          title={title}
          style={styles.panel}
        >
          <SFMedium allowFontScaling={false} style={styles.label}>
            {I18n.t('pressOneToAccept')}
          </SFMedium>
          <View style={{ height: newTimes.length * 75, marginBottom: 20 }}>
          {newTimes.map((newTime, index) => (
            <OMButton
              key={index}
              onPress={() => this.accept(selectedAppointment.id, newTime)}
              width={WINDOW_WIDTH * 0.8}
            >
              <SFMedium allowFontScaling={false} style={styles.textDate}>
                {moment.unix(newTime).format('MM/DD/YY')}&nbsp;&nbsp;&nbsp;
                <SFMedium allowFontScaling={false} style={styles.textTime}>
                  {moment.unix(newTime).format('hh:mm A')}
                </SFMedium>
              </SFMedium>
              <SFRegular allowFontScaling={false} style={styles.textAddress} numberOfLines={2}>
                <FA name={'location-arrow'} size={15} color={TEXT} />
                {'  '}
                {practice.address}
              </SFRegular>
            </OMButton>
          ))}
          </View>
          <NormalButton
            text={I18n.t('noThanks').toUpperCase()}
            style={styles.button}
            textStyle={styles.normalTextStyle}
            onPress={() => this.onSelectNo()}
            borderWidth={1}
          />
          <NormalButton
            text={I18n.t('viewDetails').toUpperCase()}
            style={styles.button}
            textStyle={styles.textStyle}
            onPress={() => this.viewDetails()}
            borderWidth={1}
          />
          {isChecking && <Loading showOverlay={true} />}
        </Panel>
      </View>
    );
  }
}

RequestProposeDialog.propTypes = {
  routeScene: PropTypes.func.isRequired,
  acceptAppointment: PropTypes.func.isRequired,
  onNoThanksButtonClicked: PropTypes.func.isRequired,
  onRequestUpdated: PropTypes.func.isRequired,
  selectedAppointment: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
};

export default compose(
  connectAppointment(),
  connectPatient()
)(RequestProposeDialog);
