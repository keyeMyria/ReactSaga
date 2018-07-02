// @flow

import { translate } from 'AppLanguages';
import {
  put,
  call,
  fork,
  all,
  select,
  take,
  takeLatest
} from 'redux-saga/effects';

import {
  searchActionCreators,
  SEARCH_PROVIDERS,
  SEARCH_PLACES,
  GET_PLACE_DETAILS,
  GET_PLACE_DETAILS_FROM_COOR
} from './actions';

import {
  OpenMed_Service
} from 'AppServices';
import qs from 'qs';

export function* asyncSearchPlaces({ payload }) {
  const { query } = payload;
  const { name, location, radius, key } = query;

  try {
    let response = yield call(OpenMed_Service,
      { api: `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${name}&types=establishment&location=${location}&radius=${radius}&key=${key}`,
        method: 'GET',
        params: null,
        third_party: true
      });

    if (response.result === 'ok') {
      let results = response.data.predictions;
      response = yield call(OpenMed_Service,
        { api: `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${name}&location=${location}&radius=${radius}&key=${key}`,
          method: 'GET',
          params: null,
          third_party: true
        });
      if (response.result === 'ok') {
        results = [...results, ...response.data.predictions];
        yield put(searchActionCreators.searchPlacesSuccess(results));
      }
    } else {
      yield put(searchActionCreators.searchPlacesSuccess([]));
    }
  } catch (e) {
    console.log(e);
  }
}

export function* asyncGetPlaceDetails({ payload, resolve, reject }) {
  const { id, key } = payload;
  const options = {
    key,
    placeid: id,
  };

  try {
    const response = yield call(OpenMed_Service,
      { api: `https://maps.googleapis.com/maps/api/place/details/json?${qs.stringify(options)}`,
        method: 'GET',
        params: null,
        third_party: true
      });

    if (response.result === 'ok') {
      resolve(response.data);
    } else {
      reject();
    }
  } catch (e) {
    reject();
  }
}

export function* asyncGetPlaceDetailsFromCoordinates({ payload }) {
  const { query } = payload;

  try {
    const response = yield call(OpenMed_Service,
      { api: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${query.region.latitude},${query.region.longitude}&key=${query.key}`,
        method: 'GET',
        params: null,
        third_party: true
      });

    if (response.result === 'ok') {
      const fullAddress = response.data.results[0].formatted_address.split(', ');
      fullAddress.splice(0, 1);

      yield put(searchActionCreators.getPlaceDetailsFromCoordinatesSuccess({
        searchLocation: {
          ...query.region,
          name: fullAddress.join(', ')
        }
      }));
    }
  } catch (e) {
    console.log(e);
  }
}

export function* asyncSearchProviders({ payload, resolve, reject }) {
  const { query } = payload;

  const emptyData = {
    count: 0,
    total: 0,
    results: []
  };

  const searchText = yield select(state => state.search.searchText);
  const activePatient = yield select(state => state.patient.activePatient);

  const newQuery = Object.assign({}, query);
  newQuery.q = searchText;

  if (activePatient) {
    newQuery.user_id = activePatient.id;
  }

  try {
    const response = yield call(OpenMed_Service,
      { api: `search/providers?${qs.stringify(newQuery)}`,
        method: 'GET',
        params: null
      });

    if (response.result === 'ok') {
      // yield put(searchActionCreators.searchProvidersSuccess(response.data.provider_to_patient));
      resolve(response.data.provider_to_patient);
    } else {
      reject(emptyData);
    }
    // } else {
    //   yield put(searchActionCreators.searchProvidersSuccess(emptyData));
    // }
  } catch (e) {
    reject(emptyData);
  }
}

export function* watchSearchProviders() {
  yield takeLatest(SEARCH_PROVIDERS, asyncSearchProviders);
  // while (true) {
  //   const action: Action = yield take(SEARCH_PROVIDERS);
  //   yield* asyncSearchProviders(action);
  // }
}

export function* watchSearchPlaces() {
  yield takeLatest(SEARCH_PLACES, asyncSearchPlaces);
}

export function* watchGetPlaceDetails() {
  yield takeLatest(GET_PLACE_DETAILS, asyncGetPlaceDetails);
}

export function* watchGetPlaceDetailsFromCoordinates() {
  yield takeLatest(GET_PLACE_DETAILS_FROM_COOR, asyncGetPlaceDetailsFromCoordinates);
}

export default function* (): Iterable {
  yield all([
    fork(watchSearchProviders),
    fork(watchSearchPlaces),
    fork(watchGetPlaceDetails),
    fork(watchGetPlaceDetailsFromCoordinates),
  ]);
}
