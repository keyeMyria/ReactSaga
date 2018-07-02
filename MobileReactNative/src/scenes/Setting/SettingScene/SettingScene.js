// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { SettingContainer } from 'AppContainers';
import { ReactId } from 'AppConnectors';

export class SettingScene extends PureComponent {
  reactId: number;

  constructor(props, context) {
    super(props, context);
    this.reactId = ReactId.generate();
  }

  render() {
    const {
      routeScene,
      popToRoot,
      switchTab,
      routeBack
    } = this.props;

    return (
      <SettingContainer
        routeScene={routeScene}
        popToRoot={popToRoot}
        routeBack={routeBack}
        switchTab={switchTab}
      />
    );
  }
}

SettingScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired
};

export default SettingScene;
