// @flow

import { translate } from 'AppLanguages';
import {
  take,
  put,
  call,
  fork,
  all,
  select,
  takeLatest
} from 'redux-saga/effects';

import {
  providerActionCreators,
  GET_PROVIDER_REQUEST,
  GET_PROVIDERS_REQUEST,
  GET_REGION_PROVIDERS_REQUEST,
  GET_SERVE_PROVIDERS_REQUEST,
  ADD_SERVE_PROVIDER_REQUEST,
  DELETE_SERVE_PROVIDER_REQUEST,
  GIVE_FEEDBACK_TO_PROVIDER,
  GET_PROVIDER_DETAIL,
} from './actions';

import { OpenMed_Service } from 'AppServices';
import qs from 'qs';

export function* asyncGetProvider({ payload, resolve, reject }) {
  const { id, query } = payload;
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `provider/${id}`,
        method: 'GET',
        params: query
      }
    );

    if (response.result === 'ok') {
      yield put(providerActionCreators.getProviderSuccess(response.data));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject();
  }
}

export function* asyncGetProviders({ payload, resolve, reject }) {
  const { query } = payload;

  const searchText = yield select(state => state.search.searchText);
  const activePatient = yield select(state => state.patient.activePatient);

  const newQuery = Object.assign({}, query);
  if (searchText !== '') {
    newQuery.q = searchText;
  }

  if (activePatient) {
    newQuery.user_id = activePatient.id;
  }

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `search/providers?${qs.stringify(newQuery)}`,
        method: 'GET',
        params: null
      }
    );

    if (response.result === 'ok') {
      resolve(response.data.provider_to_patient);
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject(e);
  }
}

export function* asyncGetRegionProviders({ payload, resolve, reject }) {
  const {
    region, userLocation, insurance_plan_ids, medicare
  } = payload;

  const activePatient = yield select(state => state.patient.activePatient);
  const specialtyId = yield select(state => state.provider.filter.specialtyId);
  const searchText = yield select(state => state.search.searchText);
  // const sortType = yield select(state => state.provider.filter.sortBy);

  const params = {
    q: searchText,
    top_left: {
      latitude: region.latitude + region.latitudeDelta,
      longitude: region.longitude - region.longitudeDelta
    },
    bottom_right: {
      latitude: region.latitude - region.latitudeDelta,
      longitude: region.longitude + region.longitudeDelta
    }
  };

  if (activePatient) {
    params.user_id = activePatient.id;
  }

  if (medicare !== null) {
    params.medicare = medicare;
  }

  if (insurance_plan_ids !== null) {
    params.insurance_plan_ids = insurance_plan_ids;
  }

  if (specialtyId) {
    params.specialty_category_ids = [specialtyId];
  }

  // if (sortType) {
  //   params.sort_type = sortType;
  //   params.sort_direction = 'asc';
  // }

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `search/map?${qs.stringify(params)}`,
        method: 'GET',
        params: null,
      }
    );

    if (response.result === 'ok') {
      if (!userLocation) {
        yield put(providerActionCreators.getRegionProvidersSuccess(response.data.practices));
      }
      resolve(response.data.practices);
    } else {
      reject();
    }
  } catch (e) {
    reject(e);
  }
}

export function* asyncGetServeProviders({ payload }) {
  const { user_id } = payload;

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `patients/favorite?user_id=${user_id}`,
        method: 'GET',
        params: null
      }
    );

    if (response.result === 'ok') {
      if (response.data) {
        // eslint-disable-next-line max-len
        yield put(providerActionCreators.getServeProvidersSuccess(response.data.provider_to_patient));
      }
    }
  } catch (e) {
    console.log(e);
  }
}

export function* asyncAddServeProvider({ payload }) {
  const { provider, user_id, is_existing } = payload;

  const params = {
    user_id,
    practice_id: provider.practice.id,
    provider_id: provider.provider.id
  };

  if (is_existing !== null) {
    params.is_existing = is_existing;
  }

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'patients/favorite',
        method: 'POST',
        params
      }
    );

    if (response.result === 'ok') {
      yield put(providerActionCreators.getServeProvidersRequest({ user_id: payload.user_id }));
    }
  } catch (e) {
    console.log(e);
  }
}

export function* asyncDeleteServeProvider({ payload }) {
  const { provider, user_id } = payload;

  const params = {
    user_id,
    practice_id: provider.practice.id,
    provider_id: provider.provider.id
  };

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'patients/favorite',
        method: 'POST',
        params
      }
    );

    if (response.result === 'ok') {
      yield put(providerActionCreators.getServeProvidersRequest({ user_id: payload.user_id }));
    }
  } catch (e) {
    console.log(e);
  }
}

export function* asyncGiveFeedbackToProvider({ payload, resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'provider/rate',
        method: 'POST',
        params: payload
      }
    );

    if (response.result === 'ok') {
      resolve();
    } else {
      reject(response.message
        || response.errors
        || response.error
        || translate('unknownError'));
    }
  } catch (e) {
    reject(e);
  }
}

export function* asyncGetProviderDetail({ payload, resolve, reject }) {
  const { provider_id, practice_id, user_id } = payload;

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `provider/${provider_id}/practice/${practice_id}?user_id=${user_id}`,
        method: 'GET',
        params: null
      }
    );

    if (response.result === 'ok') {
      // eslint-disable-next-line
      yield put(providerActionCreators.getProviderDetailSuccess({ providerData: response.data.provider_to_patient }));
      resolve(response.data.provider_to_patient);
    } else {
      reject(response.message
        || response.errors
        || response.error
        || translate('unknownError'));
    }
  } catch (e) {
    reject(e);
  }
}

export function* watchGetProvider() {
  while (true) {
    const action: Action = yield take(GET_PROVIDER_REQUEST);
    yield* asyncGetProvider(action);
  }
}

export function* watchGetProviders() {
  while (true) {
    const action: Action = yield take(GET_PROVIDERS_REQUEST);
    yield* asyncGetProviders(action);
  }
}

export function* watchGetRegionProviders() {
  yield takeLatest(GET_REGION_PROVIDERS_REQUEST, asyncGetRegionProviders);
}

export function* watchGetServeProviders() {
  while (true) {
    const action: Action = yield take(GET_SERVE_PROVIDERS_REQUEST);
    yield* asyncGetServeProviders(action);
  }
}

export function* watchAddServeProvider() {
  while (true) {
    const action: Action = yield take(ADD_SERVE_PROVIDER_REQUEST);
    yield* asyncAddServeProvider(action);
  }
}

export function* watchDeleteServeProvider() {
  while (true) {
    const action: Action = yield take(DELETE_SERVE_PROVIDER_REQUEST);
    yield* asyncDeleteServeProvider(action);
  }
}

export function* watchGiveFeedbackToProvider() {
  while (true) {
    const action: Action = yield take(GIVE_FEEDBACK_TO_PROVIDER);
    yield* asyncGiveFeedbackToProvider(action);
  }
}

export function* watchGetProviderDetail() {
  while (true) {
    const action: Action = yield take(GET_PROVIDER_DETAIL);
    yield* asyncGetProviderDetail(action);
  }
}

export default function* (): Iterable {
  yield all([
    fork(watchGetProvider),
    fork(watchGetProviders),
    fork(watchGetRegionProviders),
    fork(watchGetServeProviders),
    fork(watchAddServeProvider),
    fork(watchDeleteServeProvider),
    fork(watchGiveFeedbackToProvider),
    fork(watchGetProviderDetail),
  ]);
}
