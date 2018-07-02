// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, TouchableOpacity } from 'react-native';
import styles from '../../Styles/SearchBarStyles';
import { Colors, Metrics } from '../../../Themes/index';
import Icon from 'react-native-vector-icons/FontAwesome';
import I18n from 'react-native-i18n';
import { BORDER } from 'AppColors';

export class SearchBar extends PureComponent {

  state = {
    searchTerm: this.props.searchTerm
  };

  static propTypes = {
    onSearch: PropTypes.func,
    onChangeText: PropTypes.func,
    onCancel: PropTypes.func,
    searchTerm: PropTypes.string
  };

  render() {
    const { onSearch, onCancel } = this.props;

    const onSubmitEditing = () => onSearch && onSearch(this.state.searchTerm);

    const onChangeText = (searchTerm) => {
      this.setState({ searchTerm });

      if (this.props.onChangeText) {
        this.props.onChangeText(searchTerm);
      }
    };

    const remove = () => {
      this.setState({ searchTerm: '' });
      if (onCancel) {
        onCancel();
      }
    };

    return (
      <View
        style={[styles.container, this.props.grey
          ? { backgroundColor: BORDER }
          : {},
          this.props.style
        ]}
      >
        {this.props.icon ||
          <Icon name={'search'} size={Metrics.icons.small} style={styles.searchIcon} />
        }
        <TextInput
          ref={ref => this.searchText = ref}
          autoFocus={this.props.autoFocus}
          placeholder={this.props.placeholder || I18n.t('search')}
          placeholderTextColor={Colors.placeholder}
          underlineColorAndroid={'transparent'}
          style={styles.searchInput}
          value={this.state.searchTerm}
          onChangeText={onChangeText}
          autoCapitalize={'none'}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={'search'}
          autoCorrect={false}
          selectionColor={Colors.tint}
        />
        {this.state.searchTerm ? (
          <TouchableOpacity onPress={remove} style={styles.cancelButton}>
            <Icon name={'close'} size={Metrics.icons.small} style={styles.removeIcon} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}
