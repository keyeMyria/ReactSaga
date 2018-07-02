// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ForgotPasswordContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';

export class ForgotPasswordScene extends PureComponent {
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
      screenName: 'ForgotPasswordScene',
      reactId: this.reactId,
      isRootOfTab: false
    });
  };

  render() {
    const { routeBack } = this.props;

    return (
      <ForgotPasswordContainer
        routeBack={routeBack}
      />
    );
  }
}

ForgotPasswordScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  routeBack: PropTypes.func.isRequired,
};

export default ForgotPasswordScene;
