// @flow

import {
  take,
  put,
  call,
  fork,
  all,
} from 'redux-saga/effects';

import {
  locationActionCreators,
  GEO_REQUEST,
  GEO_CODE_REQUEST,
} from './actions';

import {
  OpenMed_Service
} from 'AppServices';

export function* asyncGeoRequest({ resolve, reject }) {
  try {
    const response = yield call(OpenMed_Service,
      { api: 'http://geoip.nekudo.com/api',
        third_party: true,
        method: 'GET',
        params: null
      });

    if (response.result === 'ok') {
      const region = {
        latitude: response.data.location.latitude,
        longitude: response.data.location.longitude,
        latitudeDelta: 10,
        longitudeDelta: 10
      };

      yield put(locationActionCreators.geoSuccess(region));
      resolve();
    } else {
      reject();
    }
  } catch (e) {
    reject();
  }
}

export function* asyncGeoCodeRequest({ payload, resolve, reject }) {
  const { address } = payload;

  try {
    const response = yield call(OpenMed_Service,
      { api: 'https://maps.googleapis.com/maps/api/geocode/json',
        third_party: true,
        method: 'GET',
        params: { address }
      });

    if (response.result === 'ok') {
      yield put(locationActionCreators.geoCodeSuccess(response.data.results));
      resolve();
    } else {
      reject();
    }
  } catch (e) {
    reject();
  }
}

export function* watchGeoRequest() {
  while (true) {
    const action: Action = yield take(GEO_REQUEST);
    yield* asyncGeoRequest(action);
  }
}

export function* watchGeoCodeRequest() {
  while (true) {
    const action: Action = yield take(GEO_CODE_REQUEST);
    yield* asyncGeoCodeRequest(action);
  }
}

export default function* (): Iterable {
  yield all([
    // fork(watchGetLocationRequest),
    fork(watchGeoRequest),
    fork(watchGeoCodeRequest)
  ]);
}
