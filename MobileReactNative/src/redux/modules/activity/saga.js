// @flow

import {
  take,
  put,
  call,
  fork,
  all,
  takeLatest
} from 'redux-saga/effects';

import {
  activityActionCreators,
  GET_ACTIVITIES,
  READ_ACTIVITY
} from './actions';

import {
  OpenMed_Service
} from 'AppServices';

export function* asyncGetActivities() {
  try {
    const response = yield call(OpenMed_Service,
      { api: 'notification',
        method: 'GET',
        params: null
      });

    if (response.result === 'ok') {
      yield put(activityActionCreators.getActivitiesSuccess(response.data.notifications));
    }
  } catch (e) {
    console.log(e);
  }
}

export function* asyncReadActivity({ payload }) {
  const { id } = payload;

  try {
    const response = yield call(OpenMed_Service,
      { api: `notification/${id}/read`,
        method: 'POST',
        params: null
      });

    if (response.result === 'ok') {
      yield put(activityActionCreators.readActivitySuccess());
      yield put(activityActionCreators.getActivities());
    }
  } catch (e) {
    console.log(e);
  }
}

export function* watchGetActivities() {
  while (true) {
    const action: Action = yield take(GET_ACTIVITIES);
    yield* asyncGetActivities(action);
  }
}

export function* watchReadActivity() {
  while (true) {
    const action: Action = yield take(READ_ACTIVITY);
    yield* asyncReadActivity(action);
  }
}

export default function* (): Iterable {
  yield all([
    fork(watchGetActivities),
    fork(watchReadActivity)
  ]);
}
