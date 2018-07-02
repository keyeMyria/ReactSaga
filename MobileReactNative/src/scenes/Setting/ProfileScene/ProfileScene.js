// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ProfileContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';


export class ProfileScene extends PureComponent{
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
      screenName: 'ProfileScene',
      reactId: this.reactId,
      isRootOfTab: true
    });
  };

  render() {
    const {
      routeScene,
      popToRoot,
      switchTab,
      routeBack
    } = this.props;

    return (
      <ProfileContainer
        routeScene={routeScene}
        switchTab={switchTab}
        popToRoot={popToRoot}
        routeBack={routeBack}
      />
    );
  }
}

ProfileScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired
};

export default ProfileScene;
