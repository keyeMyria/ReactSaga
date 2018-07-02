// @flow

import { translate } from 'AppLanguages';
import { AsyncStorage } from 'react-native';

import {
  take,
  put,
  call,
  fork,
  all,
} from 'redux-saga/effects';

import {
  authActionCreators,
  CHANGE_PASSWORD,
  FORGOT_PASSWORD,
  GET_PHOTO_BY_USER,
  LOGIN,
  REGISTER,
  RESEND_EMAIL,
  RESEND_PHONE,
  RESET_PASSWORD,
  SOCIAL_LOGIN,
  LOGOUT,
  GET_PATIENT_INVITE_CODE,
  SET_PATIENT_INVITE_CODE
} from './actions';

import {
  OpenMed_Service
} from 'AppServices';
import { patientActionCreators } from '../patient/actions';

export function* asyncLogin({ payload, resolve, reject }) {
  try {
    const response = yield call(OpenMed_Service,
      { api: 'users/login',
        method: 'POST',
        params: payload,
      });

    if (response.result === 'ok') {
      AsyncStorage.setItem('@OPENMED:ACCESS_TOKEN', response.data.authentication.token);

      yield put(authActionCreators.loginSuccess(response.data.user));
      yield put(patientActionCreators.setCurrentPatient(response.data.user));
      yield put(patientActionCreators.getPatients({ user_id: response.data.user.id }));

      resolve();
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncSocialLogin({ payload, resolve, reject }) {
  try {
    const response = yield call(OpenMed_Service,
      { api: 'social/facebook',
        method: 'POST',
        params: payload
      });

    if (response.result === 'ok') {
      AsyncStorage.setItem('@OPENMED:ACCESS_TOKEN', response.data.authentication.token);

      yield put(authActionCreators.socialLoginSuccess(response.data.user));
      yield put(patientActionCreators.setCurrentPatient(response.data.user));
      yield put(patientActionCreators.getPatients({ user_id: response.data.user.id }));
      resolve();
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncLogout({ resolve, reject }) {
  try {
    const response = yield call(OpenMed_Service,
      { api: 'users/logout',
        method: 'POST',
        params: null
      });

    if (response.result === 'ok') {
      resolve();
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncRegister({ payload, resolve, reject }) {
  try {
    const response = yield call(OpenMed_Service,
      { api: 'patients',
        method: 'POST',
        params: payload
      });

    if (response.result === 'ok') {
      AsyncStorage.setItem('@OPENMED:ACCESS_TOKEN', response.data.authentication.token);

      yield put(authActionCreators.socialLoginSuccess(response.data.user));
      yield put(patientActionCreators.setCurrentPatient(response.data.user));
      yield put(patientActionCreators.getPatients({ user_id: response.data.user.id }));
      resolve();
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncForgotPassword({ payload, resolve, reject }) {
  const { email } = payload;

  try {
    const response = yield call(OpenMed_Service,
      { api: 'users/forgot',
        method: 'POST',
        params: { email }
      });

    if (response.result === 'ok') {
      resolve();
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncResetPassword({ payload, resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: payload.code ? 'users/recovery' : 'user/set-password',
        method: 'POST',
        params: payload
      }
    );

    if (response.result === 'ok') {
      if (payload.code) {
        AsyncStorage.setItem('@OPENMED:ACCESS_TOKEN', response.data.authentication.token);

        yield put(authActionCreators.socialLoginSuccess(response.data.user));
        yield put(patientActionCreators.setCurrentPatient(response.data.user));
        yield put(patientActionCreators.getPatients({ user_id: response.data.user.id }));
      } else {
        yield put(authActionCreators.resetPasswordSuccess());
      }
      resolve();
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject(e);
  }
}

export function* asyncChangePassword({ payload, resolve, reject }) {
  try {
    const response = yield call(OpenMed_Service,
      { api: 'users/password',
        method: 'POST',
        params: payload
      });

    if (response.result === 'ok') {
      resolve();
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncGetPhotoByUser({ payload, resolve, reject }) {
  const { id, photoUpdateTime } = payload;

  try {
    const response = yield call(OpenMed_Service,
      { api: `patient/${id}/photo#${photoUpdateTime}`,
        method: 'GET',
        params: null
      });

    if (response.result === 'ok') {
      resolve();
    } else {
      reject();
    }
  } catch (e) {
    reject();
  }
}

export function* asyncResendEmail({ payload }) {
  try {
    yield call(OpenMed_Service,
      { api: 'patients/verification',
        method: 'POST',
        params: payload
      });
  } catch (e) {
    console.log(e);
  }
}

export function* asyncResendPhone({ payload }) {
  try {
    yield call(OpenMed_Service,
      { api: 'patients/verification',
        method: 'POST',
        params: payload
      });
  } catch (e) {
    console.log(e);
  }
}

export function* asyncSetPatientInviteCode({ payload, resolve, reject }) {
  const { code, password, password_confirm } = payload;
  const data = {
    password,
    password_confirm
  };
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `user/invite/${code}`,
        method: 'POST',
        params: data
      }
    );
    if (response.result === 'ok') {
      AsyncStorage.setItem('@OPENMED:ACCESS_TOKEN', response.data.authentication.token);

      yield put(authActionCreators.loginSuccess(response.data.user));
      yield put(patientActionCreators.setCurrentPatient(response.data.user));
      yield put(patientActionCreators.getPatients({ user_id: response.data.user.id }));
      resolve();
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncGetPatientInviteCode({ payload, resolve, reject }) {
  const { code } = payload;
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `user/invite/${code}`,
        method: 'GET',
        params: null
      }
    );
    if (response.result === 'ok') {
      resolve(response);
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* watchLogin() {
  while (true) {
    const action: Action = yield take(LOGIN);
    yield* asyncLogin(action);
  }
}

export function* watchSocialLogin() {
  while (true) {
    const action: Action = yield take(SOCIAL_LOGIN);
    yield* asyncSocialLogin(action);
  }
}

export function* watchRegister() {
  while (true) {
    const action: Action = yield take(REGISTER);
    yield* asyncRegister(action);
  }
}

export function* watchForgotPassword() {
  while (true) {
    const action: Action = yield take(FORGOT_PASSWORD);
    yield* asyncForgotPassword(action);
  }
}

export function* watchResetPassword() {
  while (true) {
    const action: Action = yield take(RESET_PASSWORD);
    yield* asyncResetPassword(action);
  }
}

export function* watchChangePassword() {
  while (true) {
    const action: Action = yield take(CHANGE_PASSWORD);
    yield* asyncChangePassword(action);
  }
}

export function* watchGetPhotoByUser() {
  while (true) {
    const action: Action = yield take(GET_PHOTO_BY_USER);
    yield* asyncGetPhotoByUser(action);
  }
}

export function* watchResendEmail() {
  while (true) {
    const action: Action = yield take(RESEND_EMAIL);
    yield* asyncResendEmail(action);
  }
}

export function* watchResendPhone() {
  while (true) {
    const action: Action = yield take(RESEND_PHONE);
    yield* asyncResendPhone(action);
  }
}

export function* watchLogout() {
  while (true) {
    const action: Action = yield take(LOGOUT);
    yield* asyncLogout(action);
  }
}

export function* watchGetPatientInviteCode() {
  while (true) {
    const action: Action = yield take(GET_PATIENT_INVITE_CODE);
    yield* asyncGetPatientInviteCode(action);
  }
}

export function* watchSetPatientInviteCode() {
  while (true) {
    const action: Action = yield take(SET_PATIENT_INVITE_CODE);
    yield* asyncSetPatientInviteCode(action);
  }
}

export default function* (): Iterable {
  yield all([
    fork(watchLogin),
    fork(watchSocialLogin),
    fork(watchRegister),
    fork(watchForgotPassword),
    fork(watchResetPassword),
    fork(watchChangePassword),
    fork(watchGetPhotoByUser),
    fork(watchResendEmail),
    fork(watchResendPhone),
    fork(watchLogout),
    fork(watchGetPatientInviteCode),
    fork(watchSetPatientInviteCode)
  ]);
}
