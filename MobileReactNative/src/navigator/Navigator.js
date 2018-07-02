// @flow

import { Navigation } from 'react-native-navigation';
import { NativeModules } from 'react-native';
import { WHITE, PRIMARY_COLOR, TABBAR_ITEM_COLOR } from 'AppColors';
import I18n from 'react-native-i18n';
import {
  SPLASH_SCENE,
  FAVORITE_SCENE,
  SEARCH_SCENE,
  CALENDAR_SCENE,
  SETTING_SCENE
} from './constants';

import registerScreens from './registerScreens';

const { UIManager } = NativeModules;

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

registerScreens();

type Tab = {
  screen: string,
  icon?: number,
  selectedIcon?: number,
  navigatorStyle?: {
    navBarHidden?: boolean
  }
};

const navBarStyle = {
  navigatorStyle: {
    navBarHidden: true,
    tabBarHidden: false,
    statusBarHidden: false,
    statusBarTextColorScheme: 'dark',
    screenBackgroundColor: WHITE
  },
  iconInsets: {
    top: 0,
    bottom: -3,
    left: 0,
    right: 0
  }
};

const TABS: Array<Tab> = [
  {
    screen: FAVORITE_SCENE,
    label: I18n.t('favorites'),
    icon: require('img/icons/tab_bar/favorite.png'),
    selectedIcon: require('img/icons/tab_bar/favorite_active.png'),
    ...navBarStyle
  },
  {
    screen: SEARCH_SCENE,
    label: I18n.t('search'),
    icon: require('img/icons/tab_bar/search.png'),
    selectedIcon: require('img/icons/tab_bar/search_active.png'),
    ...navBarStyle
  },
  {
    screen: CALENDAR_SCENE,
    label: I18n.t('calendar'),
    icon: require('img/icons/tab_bar/calendar.png'),
    selectedIcon: require('img/icons/tab_bar/calendar_active.png'),
    ...navBarStyle
  },
  {
    screen: SETTING_SCENE,
    label: I18n.t('setting'),
    icon: require('img/icons/tab_bar/settings.png'),
    selectedIcon: require('img/icons/tab_bar/settings_active.png'),
    ...navBarStyle,
    navigatorStyle: {
      ...navBarStyle.navigatorStyle,
      statusBarTextColorScheme: 'light'
    }
  }
];

export function startApp() {
  Navigation.startTabBasedApp({
    tabs: TABS,
    tabsStyle: {
      tabBarButtonColor: TABBAR_ITEM_COLOR,
      tabBarSelectedButtonColor: PRIMARY_COLOR,
      tabBarBackgroundColor: WHITE,
      tabBarLabelColor: TABBAR_ITEM_COLOR,
      tabBarSelectedLabelColor: PRIMARY_COLOR,
      tabBarTextFontFamily: 'SFUIText-Regular',
      tabBarHideShadow: false,
      initialTabIndex: 1,
      // tabBarShowSelectedItemBorder: true,
      // tabBarSelectedItemBorderPosition: 'top',
      // tabBarSelectedItemBorderColor: PRIMARY_COLOR,
      // tabBarSelectedItemBorderWidth: 60,
      // tabBarSelectedItemBorderHeight: 3
    },
    appStyle: {
      tabBarButtonColor: TABBAR_ITEM_COLOR,
      tabBarSelectedButtonColor: PRIMARY_COLOR,
      tabBarBackgroundColor: WHITE,
      tabBarLabelColor: TABBAR_ITEM_COLOR,
      tabBarSelectedLabelColor: PRIMARY_COLOR,
      tabBarTextFontFamily: 'SFUIText-Regular',
      tabBarHideShadow: false,
      initialTabIndex: 1,
      forceTitlesDisplay: true
    },
    animationType: 'fade',
    portraitOnlyMode: true
  });
}

export function startSplashScene() {
  Navigation.startSingleScreenApp({
    screen: {
      screen: SPLASH_SCENE,
      navigatorStyle: {
        navBarHidden: true,
        statusBarHidden: true,
        statusBarTextColorScheme: 'dark',
      },
      portraitOnlyMode: true
    },
    appStyle: {
      orientation: 'portrait'
    },
    animationType: 'fade',
  });
}
