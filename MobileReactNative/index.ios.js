// @flow

import { startSplashScene } from 'AppNavigator';
import crashlytics from 'react-native-fabric-crashlytics';
import { CachedImage } from 'AppUtilities';

if (__DEV__) {
  require('react-devtools');
}

crashlytics.init();

CachedImage.init()
  .then(() => startSplashScene())
  .catch(() => {});
