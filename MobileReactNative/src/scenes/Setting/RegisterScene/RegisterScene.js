// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { RegisterContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';

export class RegisterScene extends PureComponent {
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
      screenName: 'RegisterScene',
      reactId: this.reactId,
      isRootOfTab: false
    });
  };

  render() {
    const {
      routeScene,
      routeBack,
      fromHomeScreen,
      popToRoot,
      showLightBox,
      dismissLightBox,
      promoCode
    } = this.props;

    return (
      <RegisterContainer
        routeScene={routeScene}
        routeBack={routeBack}
        popToRoot={popToRoot}
        fromHomeScreen={fromHomeScreen}
        showLightBox={showLightBox}
        dismissLightBox={dismissLightBox}
        promoCode={promoCode}
      />
    );
  }
}

RegisterScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  routeScene: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  fromHomeScreen: PropTypes.bool,
  promoCode: PropTypes.toString(),
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired
};

RegisterScene.defaultProps = {
  fromHomeScreen: true,
  promoCode: null
};

export default RegisterScene;
