// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { AddProfileContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';

export class AddProfileScene extends PureComponent {
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
      screenName: 'AddProfileScene',
      reactId: this.reactId,
      isRootOfTab: false
    });
  };

  render() {
    const { routeScene, routeBack } = this.props;

    return (
      <AddProfileContainer
        routeScene={routeScene}
        routeBack={routeBack}
      />
    );
  }
}

AddProfileScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
};

export default AddProfileScene;
