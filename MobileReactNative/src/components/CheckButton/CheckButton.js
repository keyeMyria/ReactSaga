// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { TINT } from 'AppColors';

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropShadow: {
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowColor: 'black',
  },
  drawBorder: {
    borderWidth: 1,
    borderColor: TINT
  }
});

export function CheckButton({
    size,
    onPress,
    style,
    checked
}) {
  if (!checked) {
    return (
      <TouchableOpacity style={style} disabled={!onPress} onPress={onPress}>
        <View
          style={[styles.container,
            styles.drawBorder,
            { width: size, height: size, borderRadius: size / 2 }
            ]}
        >
          <Ionicons name={'md-checkmark'} size={size / 2} color={TINT} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={style} disabled={!onPress} onPress={onPress}>
      <LinearGradient
        colors={['#A46BEF', '#7F48FB']}
        style={[styles.container,
          styles.dropShadow,
          { width: size, height: size, borderRadius: size / 2 }
          ]}
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 0.0, y: 1.0 }}
      >
        <Ionicons name={'md-checkmark'} size={size / 2} color={'white'} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

CheckButton.propTypes = {
  style: PropTypes.any,
  size: PropTypes.number,
  onPress: PropTypes.func,
  checked: PropTypes.bool,
};

CheckButton.defaultProps = {
  size: 40,
  onPress: null,
  checked: true,
};
