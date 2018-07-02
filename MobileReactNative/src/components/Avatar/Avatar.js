// @flow

import React, { PureComponent } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { BORDER, SNOW, TINT, PRIMARY_COLOR } from 'AppColors';
import * as Progress from 'react-native-progress';
import { OMImage } from 'AppComponents';

const styles = StyleSheet.create({
  container: {
    backgroundColor: TINT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowColor: 'black',
    overflow: 'visible'
  },
  avatar: {
    borderWidth: 1,
    borderColor: BORDER,
  },
  image: {
    borderWidth: 1,
    borderColor: BORDER
  },
  placeholder: {
    position: 'absolute',
    fontSize: 22,
    color: SNOW,
    fontFamily: 'SFUIText-Semibold',
    backgroundColor: 'transparent'
  }
});

export class Avatar extends PureComponent {

  render() {
    const size = this.props.size || 60;
    const avatarStyle = [styles.avatar, { width: size, height: size, borderRadius: size / 2 }];
    const imageStyle = [styles.image, { width: size, height: size, borderRadius: size / 2 }];
    const container = [styles.container, { width: size, height: size, borderRadius: size / 2 }];
    if (this.props.source && this.props.source.uri !== undefined && this.props.source.uri !== null) {
      return (
        <TouchableOpacity disabled={true} style={[styles.container, this.props.style]}>
          <View style={avatarStyle} removeClippedSubviews>
            <OMImage
              style={imageStyle}
              resizeMode={'cover'}
              borderRadius={size / 2}
              indicator={Progress.Circle}
              indicatorProps={{
                size: 10,
                thickness: 0.5,
                borderWidth: 0,
                color: PRIMARY_COLOR,
              }}
              source={this.props.source}
              threshold={50}
            />
          </View>
        </TouchableOpacity>
      );
    }

    const { first_name, last_name } = this.props.placeholder || { first_name: 'o', last_name: 'm' };
    const placeHolderSize = this.props.placeholderSize || 22;

    return (
      <TouchableOpacity
        disabled={true}
        onPress={this.props.onPress}
        style={[container, this.props.style]}
      >
        <Text allowFontScaling={false} style={[styles.placeholder, { fontSize: placeHolderSize }]}>
          {first_name.toUpperCase().charAt(0)}{last_name.toUpperCase().charAt(0)}
        </Text>
      </TouchableOpacity>
    );
  }
}
