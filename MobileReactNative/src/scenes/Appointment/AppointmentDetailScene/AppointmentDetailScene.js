// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { AppointmentDetailContainer } from 'AppContainers';

export class AppointmentDetailScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      switchTab,
      fromCalendar,
      selectedAppointment
    } = this.props;

    return (
      <AppointmentDetailContainer
        routeScene={routeScene}
        routeBack={routeBack}
        switchTab={switchTab}
        fromCalendar={fromCalendar}
        selectedAppointment={selectedAppointment}
      />
    );
  }
}

AppointmentDetailScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  routeBack: PropTypes.func.isRequired,
  routeScene: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  selectedAppointment: PropTypes.object.isRequired,
  fromCalendar: PropTypes.bool
};

AppointmentDetailScene.defaultProps = {
  fromCalendar: true
};

export default AppointmentDetailScene;
