// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FamilyMemberContainer } from 'AppContainers';

export class FamilyMemberScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
    } = this.props;

    return (
      <FamilyMemberContainer
        routeScene={routeScene}
        routeBack={routeBack}
      />
    );
  }
}

FamilyMemberScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
};

FamilyMemberScene.defaultProps = {

};

export default FamilyMemberScene;
