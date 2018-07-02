// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ChangePasswordContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';

export class ChangePasswordScene extends PureComponent {
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
      screenName: 'ChangePasswordScene',
      reactId: this.reactId,
      isRootOfTab: false
    });
  };

  render() {
    const { routeBack, routeScene } = this.props;

    return (
      <ChangePasswordContainer
        routeBack={routeBack}
        routeScene={routeScene}
      />
    );
  }
}

ChangePasswordScene.propTypes = {
  routeBack: PropTypes.func.isRequired,
  routeScene: PropTypes.func.isRequired
};

export default ChangePasswordScene;
