import {
  Alert,
  Linking,
  Platform,
  PermissionsAndroid
} from 'react-native';

const isIOS = Platform.OS === 'ios';

async function requestContactsPermissionAndroid(onCancel, onSuccess) {
  console.log('requesting android permission....');
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'OpenMED Contacts Permission',
        message: 'OpenMED needs access to your Contacts.'
      }
    );
    console.log('granted = ', granted);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return onSuccess();
    }
  } catch (err) {
    console.warn(err);
  }
  return onCancel();
}

export function requestContactsAccess(onCancel = () => {}, onSuccess = () => {}) {
  console.log('requesting....');
  if (isIOS) {
    return Alert.alert(
      'OpenMED does not have access to your Contacts',
      'To enable access, tap Settings and turn on Contacts.',
      [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        {
          text: 'Settings',
          onPress: () => {
            onCancel();
            Linking.openURL('app-settings:');
          }
        }
      ]
    );
  }
  return requestContactsPermissionAndroid(onCancel, onSuccess);
}
