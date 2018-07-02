// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { LoginContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';

export class LoginScene extends PureComponent {
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
    const { routeScene, routeBack, fromHomeScreen, popToRoot } = this.props;
    return (
      <LoginContainer
        routeScene={routeScene}
        routeBack={routeBack}
        popToRoot={popToRoot}
        fromHomeScreen={fromHomeScreen}
      />
    );
  }
}

LoginScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  fromHomeScreen: PropTypes.bool.isRequired,
};

LoginScene.defaultProps = {
  fromHomeScreen: true
};

export default LoginScene;
