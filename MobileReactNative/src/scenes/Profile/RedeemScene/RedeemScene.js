// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { RedeemContainer } from 'AppContainers';

export class RedeemScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
    } = this.props;

    return (
      <RedeemContainer
        routeScene={routeScene}
        routeBack={routeBack}
      />
    );
  }
}

RedeemScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
};

export default RedeemScene;
