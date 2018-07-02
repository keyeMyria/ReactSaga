// @flow

import { AsyncStorage } from 'react-native';
import config from 'react-native-config';
import { set, isEmpty, includes } from 'lodash';
import { emitter } from 'AppUtilities';
import DeviceInfo from 'react-native-device-info';
import fetch from 'react-native-fetch-polyfill';

const black_list = ['patient', 'users/login', 'social/facebook', 'users/forgot'];

export async function OpenMed_Service({
  api,
  third_party,
  method,
  params
}) {
  const headers = {};

  let path = `${config.API_URL}${api}`;

  if (third_party) {
    path = api;
  }

  // ISO 639-1 locale name
  let currentLocale = DeviceInfo.getDeviceLocale();
  if (includes(currentLocale, '-')) {
    const curLocal = currentLocale.split('-')[0];
    currentLocale = curLocal;
  }

  set(headers, 'Cache-Control', 'no-cache');
  set(headers, 'Content-Type', 'application/json');
  set(headers, 'X-Mobile-App', true);
  set(headers, 'X-Language', currentLocale.toLowerCase());
  set(headers, 'x-app-version', DeviceInfo.getVersion());
  set(headers, 'x-device-type', DeviceInfo.getSystemName().toLowerCase());

  if (!includes(black_list, api)) {
    const token = await AsyncStorage.getItem('@OPENMED:ACCESS_TOKEN');
    if (token) {
      set(headers, 'X-Auth-Token', token);
    }
  }

  const reqBody = {
    method,
    headers,
    timeout: 30 * 1000
  };

  if (!isEmpty(params)) {
    reqBody.body = JSON.stringify(params);
  }

  console.log('end point = ', path);
  console.log('req body = ', reqBody);

  return fetch(path, reqBody)
    .then(response => response.json())
    .then((data) => {
      console.log('response json data = ', data);
      if (data.errors || data.error || data.message) {
        if (third_party) {
          return {
            result: 'error',
            data
          };
        }
        if (data.code === 401 && api !== 'users/patients') {
          emitter.emit('AppRoot:TOKEN_EXPIRED');
        } else {
          if (data.code === 403 && data.number === 1006) {
            emitter.emit('AppRoot:VERSION_UPDATED', data.links);
          }
          return {
            result: 'error',
            ...data
          };
        }
      }
      if (third_party) {
        return {
          result: 'ok',
          data
        };
      }
      return {
        result: 'ok',
        ...data
      };
    })
    .catch(() => {
      return {
        result: 'error',
        message: 'Please check your internet connection!'
      };
    });
}
