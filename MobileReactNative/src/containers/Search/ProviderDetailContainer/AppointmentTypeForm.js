// @flow

import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
} from 'react-native';
import I18n from 'react-native-i18n';
import { PURPLISH_GREY } from 'AppColors';
import { SFRegular } from 'AppFonts';
import { get, isEqual } from 'lodash';
import { AppointmentTypeFormItem } from './AppointmentTypeFormItem';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 42,
    paddingTop: 15,
    paddingBottom: 28
  },
  title: {
    fontSize: 16,
    color: PURPLISH_GREY
  }
});

const defaultType = {
  title: 'Consult',
  is_direct_booking: 0,
  is_appointment_request: 1,
  booking_time_intervals: [],
  patient_type: 2
};

export class AppointmentTypeForm extends React.PureComponent {
  constructor(props) {
    super(props);

    const { dataSource } = props;

    let availableTypes = get(dataSource.practice, 'appointment_types', []);
    // eslint-disable-next-line
    availableTypes = availableTypes.filter(type => !(type.is_direct_booking && type.booking_time_intervals.length === 0));

    if (availableTypes.length === 0) {
      availableTypes = [defaultType];
    }

    availableTypes = availableTypes.filter(type =>
      (dataSource.is_existing && (type.patient_type === 1 || type.patient_type === 2))
      || (!dataSource.is_existing && (type.patient_type === 0 || type.patient_type === 2)));

    this.state = {
      availableTypes,
      selectedType: availableTypes.length === 1 ? availableTypes[0] : null
    };
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource } = nextProps;

    let availableTypes = get(dataSource.practice, 'appointment_types', []);
    // eslint-disable-next-line
    availableTypes = availableTypes.filter(type => !(type.is_direct_booking && type.booking_time_intervals.length === 0));

    if (availableTypes.length === 0) {
      availableTypes = [defaultType];
    }

    /**
     * Update appointment provider form if appt types are changed
     */
    if (!isEqual(availableTypes, this.state.availableTypes)) {
      const selectedType = availableTypes.length === 1 ? availableTypes[0] : null;

      this.setState({ availableTypes, selectedType });

      this.props.onTypeSelected(selectedType);
    }
  }

  getAppointmentType = () => {
    return this.state.selectedType;
  }

  render() {
    const { availableTypes, selectedType } = this.state;
    const { onTypeSelected } = this.props;

    return (
      <View style={styles.container}>
        <SFRegular style={styles.title}>
          {I18n.t('availableAppointmentTypes')}
        </SFRegular>
        {availableTypes.map(type => (
          <AppointmentTypeFormItem
            key={!type.id ? 'consult' : type.id}
            type={type}
            isSelected={isEqual(selectedType, type)}
            onClick={(item) => {
              this.setState({ selectedType: item });
              onTypeSelected(item);
            }}
          />
        ))}
      </View>
    );
  }
}

AppointmentTypeForm.propTypes = {
  dataSource: PropTypes.shape({}).isRequired,
  onTypeSelected: PropTypes.func.isRequired,
};
