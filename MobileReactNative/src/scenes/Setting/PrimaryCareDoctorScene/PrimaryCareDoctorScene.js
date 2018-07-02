// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { PrimaryCareDoctorContainer } from 'AppContainers';

export class PrimaryCareDoctorScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
    } = this.props;

    return (
      <PrimaryCareDoctorContainer
        routeScene={routeScene}
        routeBack={routeBack}
      />
    );
  }
}

PrimaryCareDoctorScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
};

PrimaryCareDoctorScene.defaultProps = {

};

export default PrimaryCareDoctorScene;
