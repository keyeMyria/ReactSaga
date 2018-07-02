// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FavoriteProviderContainer } from 'AppContainers';

export class FavoriteProviderScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      showLightBox,
      dismissLightBox,
      switchTab,
      selectedProvider
    } = this.props;

    return (
      <FavoriteProviderContainer
        routeScene={routeScene}
        routeBack={routeBack}
        showLightBox={showLightBox}
        dismissLightBox={dismissLightBox}
        switchTab={switchTab}
        selectedProvider={selectedProvider}
      />
    );
  }
}

FavoriteProviderScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  selectedProvider: PropTypes.object.isRequired,
};

export default FavoriteProviderScene;
