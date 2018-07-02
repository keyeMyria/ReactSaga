// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import I18n from 'react-native-i18n';
import { BORDER, TINT, TEXT, WHITE, PLACEHOLDER } from 'AppColors';

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 25,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    flexDirection: 'row',
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    alignSelf: 'center',
    padding: 5,
    textAlign: 'left',
    paddingLeft: 10,
    color: TEXT,
    fontFamily: 'SFUIText-Semibold',
    paddingRight: 10
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

export class DoubleSearchBar extends PureComponent {

  render() {
    const {
      style,
      width,
      height,
      onSearchTextChanged,
      onSearchLocationChanged,
      onSearchTextFieldFocused,
      onSearchLocationFieldFocused
    } = this.props;

    return (
      <View style={style} animation={'fadeInDownBig'} duration={300}>
        <View style={[styles.container, { width, height, borderRadius: height / 2 }]}>
          <Icon name={'search'} size={16} style={styles.searchIcon} />
          <TextInput
            autoFocus
            value={this.props.value}
            placeholder={I18n.t('searchExample')}
            style={styles.searchInput}
            clearButtonMode="while-editing"
            placeholderTextColor={PLACEHOLDER}
            underlineColorAndroid={'transparent'}
            onFocus={onSearchTextFieldFocused}
            onChangeText={onSearchTextChanged}
          />
        </View>
        <View style={[styles.container, { width, height, marginTop: 3, borderRadius: height / 2 }]}>
          <Icon name={'map-marker'} size={20} style={[styles.searchIcon, { marginLeft: 22 }]} />
          <TextInput
            value={this.props.initialLocation}
            placeholder={I18n.t('currentLocation')}
            style={styles.searchInput}
            clearButtonMode="while-editing"
            placeholderTextColor={PLACEHOLDER}
            underlineColorAndroid={'transparent'}
            onFocus={onSearchLocationFieldFocused}
            onChangeText={onSearchLocationChanged}
          />
        </View>
      </View>
    );
  }
}
DoubleSearchBar.propTypes = {
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  onSearchTextChanged: PropTypes.func,
  onSearchLocationChanged: PropTypes.func,
  onSearchTextFieldFocused: PropTypes.func,
  onSearchLocationFieldFocused: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  value: PropTypes.string,
  initialLocation: PropTypes.string,
};

DoubleSearchBar.defaultProps = {
  text: '',
  height: 40,
  value: '',
  initialLocation: '',
};
