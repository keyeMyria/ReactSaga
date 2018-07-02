// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { PaymentMethodContainer } from 'AppContainers';

export class PaymentMethodScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      isDirect,
      onPaymentDone,
      first_name,
      cancellationMessage
    } = this.props;

    return (
      <PaymentMethodContainer
        routeScene={routeScene}
        routeBack={routeBack}
        isDirect={isDirect}
        onPaymentDone={onPaymentDone}
        first_name={first_name}
        cancellationMessage={cancellationMessage}
      />
    );
  }
}

PaymentMethodScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired
};

export default PaymentMethodScene;
