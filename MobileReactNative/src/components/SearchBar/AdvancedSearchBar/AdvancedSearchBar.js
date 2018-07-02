// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import I18n from 'react-native-i18n';
import { BORDER, TINT, TEXT, WHITE, PLACEHOLDER } from 'AppColors';
import { isEmpty } from 'lodash';

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 25,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    flexDirection: 'row'
  },
  searchInput: {
    fontSize: 12,
    alignSelf: 'center',
    padding: 5,
    textAlign: 'left',
    paddingLeft: 10,
    color: TEXT,
    fontFamily: 'SFUIText-Semibold',
  },
  searchIcon: {
    marginLeft: 20,
    alignSelf: 'center',
    color: TINT,
    backgroundColor: 'transparent'
  },
  row: {
    flexDirection: 'row',
    flex: 1
  },
});

export function AdvancedSearchBar({
  style,
  width,
  height,
  text,
  onPress,
  textStyle,
  isLocationBar
}) {
  return (
    <View style={[styles.container, style, { width, height, borderRadius: height / 2 }]}>
      <TouchableOpacity onPress={onPress} style={styles.row}>
        <Icon
          name={isLocationBar ? 'map-marker' : 'search'}
          size={isLocationBar ? 20 : 16}
          style={[styles.searchIcon, { marginLeft: isLocationBar ? 22 : 20 }]}
        />
        <Text
          allowFontScaling={false} style={[styles.searchInput,
            textStyle,
            { color: isEmpty(text) ? PLACEHOLDER : TEXT }
            ]}
        >
          {isEmpty(text)
            ? isLocationBar
              ? I18n.t('searchLocationExample')
              : I18n.t('searchExample')
            : text
          }
        </Text>
      </TouchableOpacity>
    </View>
  );
}

AdvancedSearchBar.propTypes = {
  style: PropTypes.any,
  textStyle: PropTypes.any,
  onPress: PropTypes.func,
  text: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  isLocationBar: PropTypes.bool,
};

AdvancedSearchBar.defaultProps = {
  text: '',
  height: 50,
  isLocationBar: false
};
