// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  DARK_GRAY,
} from 'AppColors';
import { SFMedium } from 'AppFonts';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 21,
  },
  menuItem: {
    fontSize: 16,
    color: DARK_GRAY,
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowColor: 'black',
    overflow: 'visible'
  }
});

export class ContextualMenuItem extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isVisible: false
    };
  }
  render() {
    const {
      title,
      onPress
    } = this.props;

    return (
      <TouchableOpacity
        onPress={onPress}
      >
        <SFMedium style={styles.menuItem}>{title}</SFMedium>
      </TouchableOpacity>
    );
  }
}

ContextualMenuItem.propTypes = {
  title: PropTypes.string,
  onPress: PropTypes.func
};

ContextualMenuItem.defaultProps = {
  title: '',
  onPress: () => {}
};
