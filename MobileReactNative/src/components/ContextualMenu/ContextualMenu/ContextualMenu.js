// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { ContextualMenuItem } from '../ContextualMenuItem';
import { STATUSBAR_HEIGHT } from 'AppConstants';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
  },
  content: {
    position: 'absolute',
    top: STATUSBAR_HEIGHT,
    right: 5,
    backgroundColor: 'white'
  },
  flex: {
    flex: 1
  }
});

export class ContextualMenu extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isVisible: false
    };
  }

  show = () => {
    this.setState({ isVisible: true });
  };

  hide = () => {
    this.setState({ isVisible: false });
  };

  render() {
    const { menuItems } = this.props;
    const { isVisible } = this.state;

    if (!isVisible) {
      return null;
    }

    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback
          style={styles.flex}
          onPress={() => this.setState({ isVisible: false })}
        >
          <View style={styles.flex} />
        </TouchableWithoutFeedback>
        <View style={styles.content}>
          {menuItems.map((item) => {
            return (
              <ContextualMenuItem
                key={item.title}
                title={item.title}
                onPress={() => {
                  this.setState({ isVisible: false });
                  item.onPress();
                }}
              />
            );
          })}
        </View>
      </View>
    );
  }
}

ContextualMenu.propTypes = {
  menuItems: PropTypes.array,
  onExpanded: PropTypes.func,
  isExpanded: PropTypes.bool
};

ContextualMenu.defaultProps = {
  menuItems: [],
  onExpanded: () => {},
  isExpanded: false
};
