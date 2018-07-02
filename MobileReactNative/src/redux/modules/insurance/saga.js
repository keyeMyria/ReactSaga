// @flow

import {
  take,
  put,
  call,
  fork,
  all,
} from 'redux-saga/effects';

import {
  insuranceActionCreators,
  GET_INSURANCES,
  GET_SPECIALTIES
} from './actions';

import {
  OpenMed_Service
} from 'AppServices';

export function* asyncGetInsurances() {
  try {
    const response = yield call(OpenMed_Service,
      { api: 'insurance-providers',
        method: 'GET',
        params: null,
        token_type: 'basic'
      });

    if (response.result === 'ok') {
      yield put(insuranceActionCreators.getInsurancesSuccess(response.data.insurance_providers));
    }
  } catch (e) {
    console.log(e);
  }
}

export function* asyncGetSpecialties({ resolve, reject }) {
  try {
    const response = yield call(OpenMed_Service,
      { api: 'specialty-categories',
        method: 'GET',
        params: null
      });

    if (response.result === 'ok') {
      yield put(insuranceActionCreators.getSpecialtiesSuccess(response.data));
      resolve();
    } else {
      reject();
    }
  } catch (e) {
    reject();
  }
}

export function* watchGetInsurances() {
  while (true) {
    const action: Action = yield take(GET_INSURANCES);
    yield* asyncGetInsurances(action);
  }
}

export function* watchGetSpecialties() {
  while (true) {
    const action: Action = yield take(GET_SPECIALTIES);
    yield* asyncGetSpecialties(action);
  }
}

export default function* (): Iterable {
  yield all([
    fork(watchGetInsurances),
    fork(watchGetSpecialties)
  ]);
}
