// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../../Styles/ButtonStyles';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../../Themes/Colors';

export class OMButton extends Component {
  static propTypes = {
    primary: PropTypes.bool,
    width: PropTypes.number,
    backgroundColors: PropTypes.array,
    onPress: PropTypes.func,
    text: PropTypes.string,
    type: PropTypes.string,
    navigator: PropTypes.object
  };

  static defaultProps = {
    styles: {}
  };

  render() {
    const containerStyle = [styles.container, this.props.style, this.props.width
      ? { width: this.props.width }
      : {}];

    return (
      <TouchableOpacity
        disabled={!this.props.onPress}
        onPress={this.props.onPress}
        style={containerStyle}
      >
        <LinearGradient
          colors={this.props.primary ? ['#00E2E0', '#00D1CF'] : ['#fff', '#fff']}
          style={[styles.content, this.props.width ? { width: this.props.width - 2 } : {}]}
          locations={[0, 1]}
        >
          {typeof (this.props.text || this.props.children) === 'string'
            ? <Text
              allowFontScaling={false}
              style={[styles.buttonText, this.props.primary ? { color: Colors.snow } : null]}
            >
              {this.props.text || this.props.children}
            </Text>
            : this.props.children
          }
        </LinearGradient>
      </TouchableOpacity>
    );
  }
}
