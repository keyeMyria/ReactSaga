// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { PaymentDetailsContainer } from 'AppContainers';

export class PaymentDetailsScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      selectedPayment
    } = this.props;

    return (
      <PaymentDetailsContainer
        routeScene={routeScene}
        routeBack={routeBack}
        selectedPayment={selectedPayment}
      />
    );
  }
}

PaymentDetailsScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
};

export default PaymentDetailsScene;
