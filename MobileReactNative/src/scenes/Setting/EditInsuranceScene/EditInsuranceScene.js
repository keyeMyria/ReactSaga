// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { EditInsuranceContainer } from 'AppContainers';

export class EditInsuranceScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      popToRoot,
      onRequestInsurance,
      mode,
      patientInsurance
    } = this.props;

    return (
      <EditInsuranceContainer
        routeScene={routeScene}
        routeBack={routeBack}
        popToRoot={popToRoot}
        onRequestInsurance={onRequestInsurance}
        mode={mode}
        patientInsurance={patientInsurance}
      />
    );
  }
}

EditInsuranceScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  onRequestInsurance: PropTypes.func,
  mode: PropTypes.number.isRequired,
  patientInsurance: PropTypes.object,
};

EditInsuranceScene.defaultProps = {
  onRequestInsurance: null,
  patientInsurance: null
};

export default EditInsuranceScene;
