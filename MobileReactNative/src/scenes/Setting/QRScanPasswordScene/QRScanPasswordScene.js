// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { QRScanPasswordContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';

export class QRScanPasswordScene extends PureComponent {
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
      screenName: 'QRScanPasswordScene',
      reactId: this.reactId,
      isRootOfTab: false
    });
  };

  render() {
    const { routeBack, routeScene, code, resetRouteStack } = this.props;

    return (
      <QRScanPasswordContainer
        routeBack={routeBack}
        routeScene={routeScene}
        code={code}
        resetRouteStack={resetRouteStack}
      />
    );
  }
}

QRScanPasswordScene.propTypes = {
  routeBack: PropTypes.func.isRequired,
  routeScene: PropTypes.func.isRequired,
  resetRouteStack: PropTypes.func.isRequired
};

export default QRScanPasswordScene;
