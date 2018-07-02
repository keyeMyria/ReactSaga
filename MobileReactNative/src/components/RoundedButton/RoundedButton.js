// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../Styles/RoundedButtonStyles';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../Themes/Colors';
import { PRIMARY_BUTTON } from 'AppColors';

export class RoundedButton extends Component {
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
    const backgroundColors = this.props.backgroundColors
      || (this.props.primary ? PRIMARY_BUTTON : ['#fff', '#fff']);
    const color = this.props.primary ? Colors.snow : Colors.tint;
    const containerStyle = [
      styles.container,
      this.props.buttonStyle,
      this.props.width ? { width: this.props.width } : {}
    ];
    const contentStyle = [
      styles.content,
      this.props.contentStyle,
      this.props.width ? { width: this.props.width - 2 } : {}
    ];

    return (
      <TouchableOpacity onPress={this.props.onPress} style={containerStyle}>
        <LinearGradient
          colors={backgroundColors}
          style={contentStyle}
          locations={[0, 1]}
        >
          <Text
            allowFontScaling={false}
            style={[styles.buttonText, { color }, this.props.buttonTextStyle]}
          >
            {(this.props.text || this.props.children || '').toUpperCase()}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
}
