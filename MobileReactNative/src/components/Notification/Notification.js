// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import { BlockButton } from '../BlockButton/index';
import { get, find } from 'lodash';

export class Notification extends Component {

  onPress = () => {
    const { onNotificationPress, dataSource } = this.props;
    onNotificationPress(dataSource);

    // const appointment = find(dataSource.appointment_to_practices, a => {
    //   return a.patient_actions.includes('confirm');
    // });
    //
    // // NavigationActions.calendar({ type: 'replace', appointment });
    // if (appointment) {
    //   // NavigationActions.requestPropose({ appointment });
    // }
  };

  animate = () => {
    if (this._view) {
      this._view.animate('slideInUp', 500);
    }
  };

  render() {
    const { dataSource } = this.props;

    if (dataSource === null) {
      return null;
    }

    return (
      <Animatable.View
        ref={ref => this._view = ref}
        animation={'slideInUp'}
        style={this.props.style}
      >
        <BlockButton onPress={this.onPress}>
          {get(dataSource, 'message', '')}
        </BlockButton>
      </Animatable.View>
    );
  }
}

Notification.propTypes = {
  dataSource: PropTypes.object,
  onNotificationPress: PropTypes.func
};

Notification.defaultProps = {
  dataSource: null,
  onNotificationPress: () => {}
};
