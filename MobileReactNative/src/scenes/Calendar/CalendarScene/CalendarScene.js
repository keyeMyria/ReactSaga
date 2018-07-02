// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CalendarContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';

export class CalendarScene extends PureComponent {
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
      screenName: 'CalendarScene',
      reactId: this.reactId,
      isRootOfTab: true
    });
  };

  render() {
    const {
      routeScene,
      switchTab,
      showLightBox,
      dismissLightBox,
      popToRoot
    } = this.props;

    return (
      <CalendarContainer
        routeScene={routeScene}
        showLightBox={showLightBox}
        dismissLightBox={dismissLightBox}
        switchTab={switchTab}
        popToRoot={popToRoot}
      />
    );
  }
}

CalendarScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired
};

export default CalendarScene;
