// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { EditPaymentMethodContainer } from 'AppContainers';

export class EditPaymentMethodScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      mode,
      isDirect,
      first_name,
      onPaymentDone
    } = this.props;

    return (
      <EditPaymentMethodContainer
        routeScene={routeScene}
        routeBack={routeBack}
        mode={mode}
        isDirect={isDirect}
        first_name={first_name}
        onPaymentDone={onPaymentDone}
      />
    );
  }
}

EditPaymentMethodScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
};

EditPaymentMethodScene.defaultProps = {

};

export default EditPaymentMethodScene;
