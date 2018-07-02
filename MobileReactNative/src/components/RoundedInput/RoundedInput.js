// flow

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import styles from '../Styles/RoundedInputStyle';

export class RoundedInput extends PureComponent {

  render() {
    return (
      <View
        style={[styles.container,
          this.props.width
            ? { width: this.props.width }
            : {},
          this.props.style]}
      >
        {this.props.children}
      </View>
    );
  }
}
