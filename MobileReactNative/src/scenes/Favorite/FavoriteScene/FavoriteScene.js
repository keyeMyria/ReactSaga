// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FavoriteContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';

export class FavoriteScene extends PureComponent {
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
      screenName: 'FavoriteScene',
      reactId: this.reactId,
      isRootOfTab: true
    });
  };

  render() {
    const {
      routeScene,
      switchTab,
      dismissLightBox,
      showLightBox,
      popToRoot
    } = this.props;

    return (
      <FavoriteContainer
        routeScene={routeScene}
        switchTab={switchTab}
        showLightBox={showLightBox}
        dismissLightBox={dismissLightBox}
        popToRoot={popToRoot}
      />
    );
  }
}

FavoriteScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
};

export default FavoriteScene;
