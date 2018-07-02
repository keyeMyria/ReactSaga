// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ResetPasswordContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';

export class ResetPasswordScene extends PureComponent {
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
      screenName: 'ResetPasswordScene',
      reactId: this.reactId,
      isRootOfTab: false
    });
  };

  render() {
    const { routeBack, code } = this.props;

    return (
      <ResetPasswordContainer
        routeBack={routeBack}
        code={code}
      />
    );
  }
}

ResetPasswordScene.propTypes = {
  routeBack: PropTypes.func.isRequired,
  code: PropTypes.string,
};

ResetPasswordScene.defaultProps = {
  code: undefined
};

export default ResetPasswordScene;
