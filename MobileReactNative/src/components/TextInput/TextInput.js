// @flow

import React, { Component } from 'react';
import { TextInput, View } from 'react-native';
import styles from '../Styles/TextInputStyles';
import Colors from '../../Themes/Colors';
import { SFRegular } from 'AppFonts';

export class OMTextInput extends Component {
  focus = () => {
    this.refs.textInput.focus();
  };

  render() {
    return (
      <View style={styles.container}>
        <SFRegular allowFontScaling={false} style={styles.label}>{this.props.label}</SFRegular>
        <View
          style={[styles.inputBlock, this.props.error ? { borderBottomColor: Colors.fire } : {}]}
        >
          <TextInput
            ref={'textInput'}
            underlineColorAndroid={'transparent'}
            style={[styles.textInput, this.props.textInputStyle]}
            {...this.props}
          />
          {this.props.icon}
        </View>
        <SFRegular allowFontScaling={false} style={styles.error}>{this.props.error}</SFRegular>
      </View>
    );
  }
}
