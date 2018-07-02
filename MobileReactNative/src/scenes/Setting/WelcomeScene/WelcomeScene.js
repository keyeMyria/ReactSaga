// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { WelcomeContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';

export class WelcomeScene extends PureComponent {
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
      screenName: 'WelcomeScene',
      reactId: this.reactId,
      isRootOfTab: true
    });
  };

  render() {
    const {
      routeScene,
      replaceCurrentScene,
      resetTo,
      popToRoot
    } = this.props;

    return (
      <WelcomeContainer
        routeScene={routeScene}
        popToRoot={popToRoot}
        replaceCurrentScene={replaceCurrentScene}
        resetTo={resetTo}
      />
    );
  }
}

WelcomeScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  replaceCurrentScene: PropTypes.func.isRequired,
  resetTo: PropTypes.func.isRequired,
};

export default WelcomeScene;
