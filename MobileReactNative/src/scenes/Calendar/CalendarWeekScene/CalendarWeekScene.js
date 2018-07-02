// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CalendarWeekContainer } from 'AppContainers';

export class CalendarWeekScene extends PureComponent {

  render() {
    const {
      routeScene,
      routeBack,
      showLightBox,
      dismissLightBox,
      selectedDate
    } = this.props;

    return (
      <CalendarWeekContainer
        routeScene={routeScene}
        routeBack={routeBack}
        showLightBox={showLightBox}
        dismissLightBox={dismissLightBox}
        selectedDate={selectedDate}
      />
    );
  }
}

CalendarWeekScene.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  selectedDate: PropTypes.object.isRequired,
};

export default CalendarWeekScene;
