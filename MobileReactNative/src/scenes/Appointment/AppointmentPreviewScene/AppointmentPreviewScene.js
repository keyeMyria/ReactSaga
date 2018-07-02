// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { AppointmentPreviewContainer } from 'AppContainers';

export class AppointmentPreviewScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      replaceCurrentScene,
      switchTab,
      selectedProvider,
      appointmentDetails
    } = this.props;

    return (
      <AppointmentPreviewContainer
        routeScene={routeScene}
        routeBack={routeBack}
        replaceCurrentScene={replaceCurrentScene}
        switchTab={switchTab}
        selectedProvider={selectedProvider}
        appointmentDetails={appointmentDetails}
      />
    );
  }
}

AppointmentPreviewScene.propTypes = {
  routeBack: PropTypes.func.isRequired,
  routeScene: PropTypes.func.isRequired,
  replaceCurrentScene: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  selectedProvider: PropTypes.object.isRequired,
  appointmentDetails: PropTypes.object.isRequired,
};

export default AppointmentPreviewScene;
