// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { SearchContainer } from 'AppContainers';
import { handleNavigationEvent } from 'AppUtilities';
import { ReactId } from 'AppConnectors';
import type { NavigationEvent } from 'AppTypes';
import branch from 'react-native-branch';
import { AsyncStorage, Platform } from 'react-native';

export class SearchScene extends PureComponent {
  reactId: number;

  constructor(props, context) {
    super(props, context);
    this.reactId = ReactId.generate();
    this.unsubscribeFromBranch = null;
  }

  componentWillMount() {
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  componentDidMount() {
   /* this.unsubscribeFromBranch = branch.subscribe(({ error, params }) => {
      this.onLinkOpen(error, params);
    });
*/
    this.getPromoCode();

  }

  getPromoCode = async () => {
    if (Platform.OS === 'android') {
      const value = await branch.getLatestReferringParams();
      if (value.code) {
        AsyncStorage.setItem('@OPENMED:ACCEPT_PRIVACY', 'ACCEPTED')
          .then(() => {
            this.props.routeScene('RegisterScene', { promoCode: value.code }, {
              navigatorStyle: {
                navBarHidden: true,
                tabBarHidden: true,
              },
              overrideBackPress: true
            });
          })
          .catch(error => console.log(error));

      }
    }
  }

  componentWillUnmount() {
    // if (this.unsubscribeFromBranch) {
    //   this.unsubscribeFromBranch = null;
    // }
  }

  /*onLinkOpen = (error, params) => {
    if (error) {
      console.log('Error from Branch: ', error);
      return null;
    }

    // params will never be null if error is null

    if (params['+non_branch_link']) {
      // Route non-Branch URL if appropriate.
      return null;
    }

    if (!params['+clicked_branch_link']) {
      // Indicates initialization success and some other conditions.
      // No link was opened.
      return null;
    }

    // A Branch link was opened.
    // Route link based on data in params.
    return null;
  };*/

  onNavigatorEvent = (e: NavigationEvent) => {
    handleNavigationEvent({
      event: e,
      screenName: 'SearchScene',
      reactId: this.reactId,
      isRootOfTab: true
    });
  };

  render() {
    const {
      routeScene,
      showLightBox,
      popToRoot,
      switchTab,
      dismissLightBox,
      routeBack
    } = this.props;

    return (
      <SearchContainer
        routeScene={routeScene}
        routeBack={routeBack}
        switchTab={switchTab}
        showLightBox={showLightBox}
        popToRoot={popToRoot}
        dismissLightBox={dismissLightBox}
      />
    );
  }
}

SearchScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  routeBack: PropTypes.func.isRequired,
  routeScene: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  popToRoot: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
};

export default SearchScene;
