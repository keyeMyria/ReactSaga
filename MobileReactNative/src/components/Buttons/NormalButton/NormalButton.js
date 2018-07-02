// @flow

import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { TEXT, WHITE, BORDER_COLOR, GREEN, PRIMARY_BUTTON, LIGHT_GRAY } from 'AppColors';
import LinearGradient from 'react-native-linear-gradient';

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 0,
    borderColor: BORDER_COLOR
  },
  shadow: {
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 3,
    shadowOpacity: 0.3,
    shadowColor: 'black',
    overflow: 'visible',
  },
  text: {
    fontFamily: 'SFUIText-Regular',
    fontSize: 12,
    color: TEXT,
    backgroundColor: 'transparent'
  },
  selectedText: {
    color: WHITE
  }
});

const renderPressedButton = (style, text, textStyle, borderWidth,
                             borderRadius, dropShadow, singleColorButton) => {
  return (
    <LinearGradient
      colors={PRIMARY_BUTTON}
      style={[styles.container,
        dropShadow
          ? styles.shadow
          : {},
        singleColorButton ? style : {},
        { borderWidth, backgroundColor: GREEN, borderRadius }
        ]}
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 0.0, y: 1.0 }}
    >
      <Text allowFontScaling={false} style={[styles.text, styles.selectedText, textStyle]}>{text}</Text>
    </LinearGradient>
  );
};

const renderNormalButton = (style, text, textStyle, borderWidth,
                            borderRadius, dropShadow, singleColorButton, disabled) => {
  return (
    <View style={[styles.container, dropShadow
      ? styles.shadow : {},
      singleColorButton ? style : {},
      { borderWidth, borderRadius }]}
    >
      <Text allowFontScaling={false} style={[styles.text, textStyle, disabled ? { color: LIGHT_GRAY } : {}]}>
        {text}
      </Text>
    </View>
  );
};

export function NormalButton({
   style,
   text,
   onPress,
   textStyle,
   pressed,
   borderWidth,
   borderRadius,
   dropShadow,
   singleColorButton,
   disabled
}) {
  return (
    <TouchableOpacity disabled={disabled} style={singleColorButton ? {} : style} onPress={onPress}>
      {pressed &&
      renderPressedButton(style, text, textStyle,
        borderWidth, borderRadius, dropShadow, singleColorButton)}
      {!pressed &&
      renderNormalButton(style, text, textStyle,
        borderWidth, borderRadius, dropShadow, singleColorButton, disabled)}
    </TouchableOpacity>
  );
}

NormalButton.propTypes = {
  style: PropTypes.any,
  textStyle: PropTypes.any,
  onPress: PropTypes.func,
  text: PropTypes.string,
  pressed: PropTypes.bool,
  dropShadow: PropTypes.bool,
  disabled: PropTypes.bool,
  borderWidth: PropTypes.number,
  borderRadius: PropTypes.number,
  singleColorButton: PropTypes.bool,
};

NormalButton.defaultProps = {
  pressed: false,
  dropShadow: false,
  disabled: false,
  borderWidth: 0,
  borderRadius: 22,
  singleColorButton: false
};
