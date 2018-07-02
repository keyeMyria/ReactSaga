import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CameraRollContainer } from 'AppContainers';

export class CameraRollScene extends PureComponent {
  static propTypes = {
    routeScene: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    onImageSelected: PropTypes.func.isRequired,
  };

  render() {
    const { routeScene, onBack, onImageSelected } = this.props;

    return (
      <CameraRollContainer
        routeScene={routeScene}
        routeBack={onBack}
        onImageSelected={onImageSelected}
      />
    );
  }
}
