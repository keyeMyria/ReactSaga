// @flow

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import styles from '../Styles/PanelStyle';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../Themes/Colors';
import { SFMedium } from 'AppFonts';

export class Panel extends PureComponent {

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        {this.props.title ? (
          <LinearGradient
            colors={Colors.tints}
            style={styles.header}
            locations={[0, 1]}
          >
            <SFMedium
              allowFontScaling={false}
              style={styles.title}
            >
              {this.props.title}
            </SFMedium>
          </LinearGradient>
        ) : null}
        {this.props.children}
      </View>
    );
  }
}
