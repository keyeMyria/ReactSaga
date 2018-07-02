// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InviteFriendContainer } from 'AppContainers';

export class InviteFriendScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
    } = this.props;

    return (
      <InviteFriendContainer
        routeScene={routeScene}
        routeBack={routeBack}
      />
    );
  }
}

InviteFriendScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
};

export default InviteFriendScene;
