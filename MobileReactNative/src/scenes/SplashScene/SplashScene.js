// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  AsyncStorage,
} from 'react-native';
import { requestLocationAccess, AlertMessage, promisify } from 'AppUtilities';
import { startApp } from 'AppNavigator';
import { PRIMARY_COLOR } from 'AppColors';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from 'AppConstants';
import {
  connectAuth,
  connectInsurance,
  connectPatient,
  connectSharedAction
} from 'AppRedux';
import { compose } from 'recompose';
import { get } from 'lodash';

const logoImageSource = require('img/images/logo.png');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  logo: {
    width: WINDOW_WIDTH / 3,
    height: WINDOW_HEIGHT / 3,
    resizeMode: 'contain',
    marginTop: WINDOW_WIDTH / 3
  },
  loading: {
    position: 'absolute',
    top: (WINDOW_HEIGHT / 3) * 2
  }
});

class SplashScene extends PureComponent {
  constructor(props) {
    super(props);

    this.timer = null;
  }

  componentWillMount() {
    this.timer = setInterval(this.checkRehydration, 200);
  }

  checkRehydration = () => {
    AsyncStorage.getItem('@OPENMED:REHYDRATED')
      .then((value) => {
        if (value) {
          AsyncStorage.removeItem('@OPENMED:REHYDRATED');
          clearInterval(this.timer);

          const {
            auth,
            getPatients,
            clearReduxStore
          } = this.props;

          const user_id = get(auth, 'user.id');
          let promise = Promise.resolve(true);

          if (user_id) {
            promise = promisify(getPatients, { user_id });
          }

          promise
            .then((result) => {
              if (!result) {
                clearReduxStore();
                AsyncStorage.removeItem('@OPENMED:ACCESS_TOKEN');
              }
              return requestLocationAccess();
            })
            .then(() => startApp())
            .catch((error) => {
              if (error === 'permission denied') {
                console.log('Location Permission is not granted.');
                startApp();
              } else {
                AlertMessage.showMessage();
              }
            });
        }
      })
      .catch(() => {});
  };

  render() {
    return (
      <View style={styles.container}>
        <Image
          source={logoImageSource}
          style={styles.logo}
        />
        <ActivityIndicator
          style={styles.loading}
          size={'small'}
          color={PRIMARY_COLOR}
        />
      </View>
    );
  }
}

SplashScene.propTypes = {
  auth: PropTypes.shape({}).isRequired,
  getPatients: PropTypes.func.isRequired,
  clearReduxStore: PropTypes.func.isRequired,
};

export default compose(
  connectAuth(),
  connectInsurance(),
  connectPatient(),
  connectSharedAction()
)(SplashScene);
