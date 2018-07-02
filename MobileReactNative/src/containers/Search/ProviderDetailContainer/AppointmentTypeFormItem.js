// @flow

import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  TouchableOpacity
} from 'react-native';
import {
  BORDERLINE,
  PURPLISH_GREY,
  WHITE
} from 'AppColors';
import { SFRegular } from 'AppFonts';
import LinearGradient from 'react-native-linear-gradient';
import { get } from 'lodash';

const styles = StyleSheet.create({
  item: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDERLINE,
    backgroundColor: WHITE
  },
  unselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDERLINE,
    backgroundColor: 'transparent',
    marginRight: 15,
    overflow: 'hidden'
  },
  selected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDERLINE,
    marginRight: 15,
    overflow: 'hidden'
  },
  title: {
    fontSize: 14,
    color: PURPLISH_GREY
  }
});

export function AppointmentTypeFormItem({
  type,
  isSelected,
  onClick
}) {
  return (
    <TouchableOpacity onPress={() => onClick(type)}>
      <View style={styles.item}>
        {!isSelected && <View style={styles.unselected} />}
        {isSelected &&
          <LinearGradient
            colors={['#A46BEF', '#7F48FB']}
            style={styles.selected}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 0.0, y: 1.0 }}
          />
        }
        <SFRegular style={styles.title}>{get(type, 'title')}</SFRegular>
      </View>
    </TouchableOpacity>
  );
}

AppointmentTypeFormItem.propTypes = {
  type: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
};

AppointmentTypeFormItem.defaultProps = {
  isSelected: false
};
