// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import Colors from '../../../Themes/Colors';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

export class GearButton extends Component {
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
    size: 50,
    color: Colors.snow,
    borderColor: Colors.text
  };

  render() {
    const containerStyle = {
      flexDirection: 'row',
      width: this.props.size,
      height: this.props.size,
      borderRadius: this.props.size / 2,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: this.props.color
    };

    return (
      <TouchableOpacity onPress={this.props.onPress} style={containerStyle}>
        <EvilIcons
          name={'gear'}
          size={this.props.size / 1.5}
          color={this.props.color || Colors.text}
        />
      </TouchableOpacity>
    );
  }
}
