// @flow

import React, { PureComponent } from 'react';
import { QRScanContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';
import PropTypes from 'prop-types';

export class QRScanScene extends PureComponent {
  reactId: number;

  constructor(props, context) {
    super(props, context);
    this.reactId = ReactId.generate();
  }

  componentWillMount() {
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  onNavigatorEvent = (e: NavigationEvent) => {
    handleNavigationEvent({
      event: e,
      screenName: 'LoginScene',
      reactId: this.reactId,
      isRootOfTab: false
    });
  };

  render() {
    const {
      routeScene,
      routeBack,
      fromHomeScreen,
      popToRoot,
      showLightBox,
      dismissLightBox
    } = this.props;
    return (
      <QRScanContainer
        routeScene={routeScene}
        routeBack={routeBack}
        popToRoot={popToRoot}
        fromHomeScreen={fromHomeScreen}
        showLightBox={showLightBox}
        dismissLightBox={dismissLightBox}
      />
    );
  }
}

QRScanScene.defaultProps = {
  fromHomeScreen: true,
  routeBack: PropTypes.func.isRequired,
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired
};

export default QRScanScene;
