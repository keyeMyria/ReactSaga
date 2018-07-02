// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SFRegular } from 'AppFonts';
import { BORDER, SNOW, TEXT, TINT, LIGHTER_GRAY } from 'AppColors';
import Icon from 'react-native-vector-icons/Ionicons';
import I18n from 'react-native-i18n';

const styles = StyleSheet.create({
  optionBar: {
    height: 35,
    width: 200,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SNOW,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 5,
    zIndex: 12
  },
  optionButton: {
    flex: 1,
    height: 35,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: BORDER
  },
  optionText: {
    fontSize: 12,
    color: TEXT,
    marginLeft: 10
  },
  rotate: {
    transform: [{ rotate: '90deg' }]
  },
});


export default function FloatingBar({
  viewerName,
  onFilterClick,
  onMapClick,
  onListClick
}) {
  return (
    <View
      style={[styles.optionBar,
        { backgroundColor: viewerName === 'map' ? SNOW : LIGHTER_GRAY }
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          if (viewerName === 'map') {
            onListClick();
          } else {
            onMapClick();
          }
        }}
        style={[styles.optionButton, styles.optionButtonLeft]}
      >
        <Icon
          name={'ios-list-outline'}
          size={18}
          color={viewerName === 'map' ? TINT : TINT}
        />
        <SFRegular
          allowFontScaling={false}
          style={[styles.optionText,
            { color: viewerName === 'map' ? TEXT : TINT }
          ]}
        >
          {viewerName === 'map' ? I18n.t('list') : I18n.t('map')}
        </SFRegular>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onFilterClick()}
        style={styles.optionButton}
      >
        <Icon
          name={'ios-options-outline'}
          size={14}
          color={viewerName === 'map' ? TINT : TINT}
          style={styles.rotate}
        />
        <SFRegular
          allowFontScaling={false}
          style={[styles.optionText,
            { color: viewerName === 'map' ? TEXT : TINT }
          ]}
        >
          {I18n.t('filter')}
        </SFRegular>
      </TouchableOpacity>
    </View>
  );
}

FloatingBar.propTypes = {
  viewerName: PropTypes.string,
  onFilterClick: PropTypes.func.isRequired,
  onMapClick: PropTypes.func.isRequired,
  onListClick: PropTypes.func.isRequired,
};

FloatingBar.defaultProps = {
  viewerName: 'map',
};
