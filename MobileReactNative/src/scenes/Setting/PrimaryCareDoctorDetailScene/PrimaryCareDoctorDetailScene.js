// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { PrimaryCareDoctorDetailContainer } from 'AppContainers';

export class PrimaryCareDoctorDetailScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      selectedProvider
    } = this.props;

    return (
      <PrimaryCareDoctorDetailContainer
        routeScene={routeScene}
        routeBack={routeBack}
        selectedProvider={selectedProvider}
      />
    );
  }
}

PrimaryCareDoctorDetailScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
};

PrimaryCareDoctorDetailScene.defaultProps = {

};

export default PrimaryCareDoctorDetailScene;
