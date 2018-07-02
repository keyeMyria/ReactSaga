// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { SmsContainer } from 'AppContainers';
import { ReactId } from 'AppConnectors';

export class SmsScene extends PureComponent {
  reactId: number;

  constructor(props, context) {
    super(props, context);
    this.reactId = ReactId.generate();
  }

  render() {
    const {
      routeScene,
      popToRoot,
      routeBack
    } = this.props;

    return (
      <SmsContainer
        routeScene={routeScene}
        popToRoot={popToRoot}
        routeBack={routeBack}
      />
    );
  }
}

SmsScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired
};

export default SmsScene;
