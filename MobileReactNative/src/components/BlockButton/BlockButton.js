// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../Styles/BlockButtonStyles';
import LinearGradient from 'react-native-linear-gradient';
import { PRIMARY_BUTTON } from 'AppColors';
import { WINDOW_WIDTH } from 'AppConstants';

export class BlockButton extends PureComponent {

  static propTypes = {
    primary: PropTypes.bool,
    width: PropTypes.number,
    backgroundColors: PropTypes.array,
    onPress: PropTypes.func,
    text: PropTypes.string,
    type: PropTypes.string,
    children: PropTypes.string,
    navigator: PropTypes.object
  };

  static defaultProps = {
    styles: {}
  };

  render() {
    const width = this.props.width || WINDOW_WIDTH;
    const containerStyle = [styles.container, this.props.style, { width }];

    return (
      <TouchableOpacity onPress={this.props.onPress} style={containerStyle}>
        <LinearGradient
          colors={PRIMARY_BUTTON}
          style={[styles.content, { width: width - 2 }]}
          locations={[0, 1]}
        >
          <Text
            allowFontScaling={false}
            style={styles.buttonText}
          >
            {this.props.text || this.props.children}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
}
