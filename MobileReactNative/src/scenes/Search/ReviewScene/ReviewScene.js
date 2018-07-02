// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ReviewContainer } from 'AppContainers';

export class ReviewScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      selectedProvider
    } = this.props;

    return (
      <ReviewContainer
        routeScene={routeScene}
        routeBack={routeBack}
        selectedProvider={selectedProvider}
      />
    );
  }
}

ReviewScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  selectedProvider: PropTypes.object.isRequired,
};

export default ReviewScene;
