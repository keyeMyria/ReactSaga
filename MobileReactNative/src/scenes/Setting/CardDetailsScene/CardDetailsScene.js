// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CardDetailsContainer } from 'AppContainers';

export class CardDetailsScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      selectedCard,
      isDirect,
      first_name,
      onPaymentDone
    } = this.props;

    return (
      <CardDetailsContainer
        routeScene={routeScene}
        routeBack={routeBack}
        selectedCard={selectedCard}
        isDirect={isDirect}
        first_name={first_name}
        onPaymentDone={onPaymentDone}
      />
    );
  }
}

CardDetailsScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
};

CardDetailsScene.defaultProps = {

};

export default CardDetailsScene;
