// @flow

import { translate } from 'AppLanguages';
import { OpenMed_Service } from 'AppServices';

import {
  put,
  call,
  fork,
  all,
  take,
} from 'redux-saga/effects';

import {
  settingActionCreators,
  SETTING_SMS_FLAG,
  SETTING_USER_INFO,
  GET_REFERRAL_CODE,
  SET_REFERRAL_CODE,
  GET_REFERRAL_HISTORY,
  SET_REDEEM
} from './actions';

export function* asyncSettingSmsFlag({ payload, resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'user/use-sms',
        method: 'POST',
        params: payload
      }
    );
    if (response.result === 'ok') {
      yield put(settingActionCreators.settingSmsFlagSuccess(payload.use_sms));
      resolve(payload.use_sms);
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncGetUserInfo({ resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'users/info',
        method: 'GET',
        params: null
      }
    );
    if (response.result === 'ok') {
      yield put(settingActionCreators.settingUserInfoSuccess(response.data.user));

      resolve(response.data.user);
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncGetReferralCode({ resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'user-friend/info',
        method: 'GET',
        params: null
      }
    );
    if (response.code === 200) {
      yield put(settingActionCreators.getReferralCodeSuceess(response.data));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncSetReferralCode({ payload, resolve, reject }) {
  // const { users } = payload;
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'user-friend',
        method: 'POST',
        params: payload
      }
    );
    if (response.code === 200) {
      resolve(response.code);
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncSetRedeem({ payload, resolve, reject }) {
  // const { users } = payload;
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'user-friend/redeem',
        method: 'POST',
        params: payload
      }
    );
    if (response.code === 200) {
      resolve(response.code);
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncGetReferralHistory({ payload, resolve, reject }) {
  const { user_id, page } = payload;
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `patient/${user_id}/user-friends?limit=25&page=${page}`,
        method: 'GET',
        params: null
      }
    );
    if (response.code === 200) {
      // yield put(settingActionCreators.getReferralHistorySuccess(response.data));
      resolve(response.data);
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* watchSettingSmsFlag() {
  while (true) {
    const action: Action = yield take(SETTING_SMS_FLAG);
    yield* asyncSettingSmsFlag(action);
  }
}

export function* watchUserInfo() {
  while (true) {
    const action: Action = yield take(SETTING_USER_INFO);
    yield* asyncGetUserInfo(action);
  }
}

export function* watchGetReferralCode() {
  while (true) {
    const action: Action = yield take(GET_REFERRAL_CODE);
    yield* asyncGetReferralCode(action);
  }
}

export function* watchSetReferralCode() {
  while (true) {
    const action: Action = yield take(SET_REFERRAL_CODE);
    yield* asyncSetReferralCode(action);
  }
}

export function* watchSetRedeem() {
  while (true) {
    const action: Action = yield take(SET_REDEEM);
    yield* asyncSetRedeem(action);
  }
}


export function* watchGetReferralHistory() {
  while (true) {
    const action: Action = yield take(GET_REFERRAL_HISTORY);
    yield* asyncGetReferralHistory(action);
  }
}

export default function* (): Iterable {
  yield all([
    fork(watchSettingSmsFlag),
    fork(watchUserInfo),
    fork(watchGetReferralHistory),
    fork(watchUserInfo),
    fork(watchGetReferralCode),
    fork(watchSetReferralCode),
    fork(watchSetRedeem)
  ]);
}
