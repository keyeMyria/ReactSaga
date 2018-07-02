// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ScanDocumentContainer } from 'AppContainers';

class ScanDocumentScene extends PureComponent {
  static propTypes = {
    routeScene: PropTypes.func.isRequired,
    routeBack: PropTypes.func.isRequired,
    onImageSave: PropTypes.func.isRequired,
  };

  render() {
    const {
      routeScene,
      routeBack,
      onImageSave,
    } = this.props;

    return (
      <ScanDocumentContainer
        routeScene={routeScene}
        routeBack={routeBack}
        onImageSave={onImageSave}
      />
    );
  }
}

export default ScanDocumentScene;
