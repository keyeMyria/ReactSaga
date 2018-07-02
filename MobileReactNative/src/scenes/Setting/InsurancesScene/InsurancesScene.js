// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InsurancesContainer } from 'AppContainers';

export class InsurancesScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
    } = this.props;

    return (
      <InsurancesContainer
        routeScene={routeScene}
        routeBack={routeBack}
      />
    );
  }
}

InsurancesScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
};

export default InsurancesScene;
