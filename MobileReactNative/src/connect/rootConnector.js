// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Linking, Alert, Platform } from 'react-native';
import FCM, {
  FCMEvent,
  RemoteNotificationResult,
  WillPresentNotificationResult,
  NotificationType
} from 'react-native-fcm';
import I18n from 'react-native-i18n';
import DeepLinking from 'react-native-deep-linking';
import querystring from 'querystring';
import { connectAuth, connectAppointment } from 'AppRedux';
import { WHITE, DARK_GRAY, PRIMARY_COLOR } from 'AppColors';
import { compose } from 'recompose';
import { emitter } from 'AppUtilities';
import { get } from 'lodash';
import DeviceInfo from 'react-native-device-info';
import RNExitApp from 'react-native-exit-app';

export default function rootConnector(Component: ReactClass<*>): ReactClass<*> {
  class RootConnector extends PureComponent {
    constructor(props) {
      super(props);

      this.state = {
        phoneConfirmed: false,
        emailConfirmed: false,
      };

      this.isVersionUpdatingRequired = false;
    }

    static propTypes = {
      auth: PropTypes.shape({}).isRequired,
      setDeviceToken: PropTypes.func.isRequired,
      fetchAppointmentDetail: PropTypes.func.isRequired,
    };

    componentWillMount() {
      /**
       * If reset password was required,
       * Block the entire app by opening reset password scene
       */
      if (this.props.auth.user && this.props.auth.user.reset_password_required) {
        this.props.routeScene('ResetPasswordScene', null, {
          title: I18n.t('resetPassword'),
          backButtonTitle: '',
          navigatorStyle: {
            navBarHidden: true,
            tabBarHidden: true,
            navBarBackgroundColor: WHITE,
            navBarTextColor: DARK_GRAY,
            navBarButtonColor: PRIMARY_COLOR,
          }
        });
      }
    }
    componentDidMount() {
      DeepLinking.addScheme('openmed://');
      Linking.addEventListener('url', this.handleUrl);

      DeepLinking.addRoute('/home?reason=email_confirmed', () => {
        if (!this.state.emailConfirmed) {
          this.setState({ emailConfirmed: true });
          Alert.alert('OpenMed', I18n.t('emailConfirmed'));
        }
      });

      DeepLinking.addRoute('/home?reason=phone_confirmed', () => {
        if (!this.state.phoneConfirmed) {
          this.setState({ phoneConfirmed: true });
          Alert.alert('OpenMed', I18n.t('phoneConfirmed'));
        }
      });

      DeepLinking.addRoute(/\/forgot-password\?(.*)/, (response) => {
        const query = querystring.parse(response.match[1]);
        const code = query.code;
        if (code) {
          setTimeout(() => {
            this.props.switchTab(1);
            this.props.routeScene('ResetPasswordScene', { code }, {
              title: I18n.t('resetPassword'),
              backButtonTitle: '',
              navigatorStyle: {
                navBarHidden: true,
                tabBarHidden: true,
                navBarBackgroundColor: WHITE,
                navBarTextColor: DARK_GRAY,
                navBarButtonColor: PRIMARY_COLOR,
              }
            });
          }, 500);
        }
      });

      Linking.getInitialURL().then((url) => {
        if (url) {
          Linking.openURL(url);
        }
      }).catch(err => console.error('An error occurred', err));

      // push notification config
      if (Platform.OS === 'ios') {
        FCM.requestPermissions()
          .then(() => console.log('granted'))
          .catch(() => console.log('user rejected')); // for iOS
      }

      FCM.getFCMToken().then((device_token) => {
        // store fcm token in your server
        this.props.setDeviceToken({ device_token });
      });

      FCM.getInitialNotification()
        .then((notif) => {
          this.checkNotification(notif);
        })
        .catch(error => console.log('error = ', error));

      // this shall be called regardless of app state: running, background or not running.
      // Won't be called when app is killed by user in iOS
      this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
        emitter.emit('Notification:ActivityUpdated');
        // there are two parts of notif.
        // notif.notification contains the notification payload, notif.data contains data payload
        if (notif.local_notification) {
          // this is a local notification
        }
        if (notif.opened_from_tray) {
          this.checkNotification(notif);
        }

        if (Platform.OS === 'ios') {
          switch (notif._notificationType) {
            case NotificationType.Remote:
              notif.finish(RemoteNotificationResult.NewData);
              break;
            case NotificationType.NotificationResponse:
              notif.finish();
              break;
            case NotificationType.WillPresent:
              notif.finish(WillPresentNotificationResult.All);
              break;
            default:
              break;
          }
        }
      });

      FCM.on(FCMEvent.RefreshToken, (device_token) => {
        // fcm token may not be available on first load, catch it here
        this.props.setDeviceToken({ device_token });
      });

      // Register version updated event listener
      emitter.on('AppRoot:VERSION_UPDATED', this.onVersionUpdateRequired);
    }

    componentWillUnmount() {
      emitter.removeListener('AppRoot:VERSION_UPDATED', this.onVersionUpdateRequired);
      Linking.removeEventListener('url', this.handleUrl);
      this.notificationListener.remove();
    }

    checkNotification = (notif) => {
      const appointmentDetail = get(notif, 'payload', '{}');
      const jsonObject = JSON.parse(appointmentDetail);
      const appointmentId = get(jsonObject, 'appointment_to_practice.id');
      if (appointmentId) {
        emitter.emit('Notification:BannerClicked', appointmentId);
      }
    };

    onVersionUpdateRequired = (links) => {
      if (!this.isVersionUpdatingRequired) {
        this.isVersionUpdatingRequired = true;

        const systemName = DeviceInfo.getSystemName().toLowerCase();
        Alert.alert(
          'OpenMed',
          I18n.t('newVersionAvailable')[systemName],
          [
            {
              text: I18n.t('ok'),
              onPress: () => {
                if (systemName === 'ios') {
                  // eslint-disable-next-line
                  Linking.openURL(get(links, 'ios', ''));
                } else {
                  Linking.openURL(get(links, 'android', ''));
                }
                setTimeout(() => {
                  RNExitApp.exitApp();
                }, 1000);
              }
            }
          ]
        );
      }
    };

    handleUrl = ({ url }) => {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          DeepLinking.evaluateUrl(url);
        }
      });
    };

    render() {
      return (
        <Component {...this.props} />
      );
    }
  }

  RootConnector.displayName = `RootConnector(${Component.name})`;

  return compose(connectAuth(), connectAppointment())(RootConnector);
}
