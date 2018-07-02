import { Platform } from 'react-native';
import Contacts from 'react-native-contacts';
import UnifiedContacts from 'react-native-unified-contacts';

const isIOS = Platform.OS === 'ios';

const getUnifiedContacts = () => (
  new Promise((resolve, reject) => (
    UnifiedContacts.getContacts((err, contacts) => {
      console.log('error -= ', err);
      console.log('contacts -= ', contacts);
      return err ? reject(err) : resolve(contacts);
    })
  ))
);

const checkUnifiedContactsPermission = () => (
  new Promise((resolve, reject) => (
    UnifiedContacts.userCanAccessContacts(canAccess => (
      canAccess ? resolve(canAccess) : reject(canAccess)
    ))
  ))
);

const requestGetUnifiedContactsPermission = () => (
  new Promise((resolve, reject) => (
    UnifiedContacts.requestAccessToContacts(granted => (
      granted ? resolve(granted) : reject(granted)
    ))
  ))
);

export const getContacts = () => {
  if (isIOS) {
    return getUnifiedContacts();
  }
  return new Promise((resolve, reject) => {
    return Contacts.requestPermission((error, permission) => {
      if (error || permission === 'denied') {
        return reject(error);
      }
      return Contacts.getAll((err, contacts) => {
        if (err) {
          return reject(err);
        }
        return resolve(contacts);
      });
    });
  });
};

export const checkGetContactsPermission = () => {
  if (isIOS) {
    return checkUnifiedContactsPermission();
  }
  return new Promise((resolve, reject) =>
    Contacts.check((err, permission) => {
      if (err) {
        return reject(err);
      }
      return resolve(permission);
    }));
};

export const requestGetContactsPermission = () => {
  if (isIOS) {
    return requestGetUnifiedContactsPermission();
  }
  return new Promise((resolve, reject) =>
    Contacts.requestPermission((err, permission) => {
      if (err) {
        return reject(err);
      }
      return resolve(permission);
    }));
};
