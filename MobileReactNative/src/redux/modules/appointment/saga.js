// @flow

import {
  take,
  put,
  call,
  fork,
  all,
  select
} from 'redux-saga/effects';

import {
  appointmentActionCreators,
  GET_APPOINTMENTS,
  CREATE_APPOINTMENT,
  PROPOSE_NEW_APPOINTMENT,
  ACCEPT_APPOINTMENT,
  DECLINE_APPOINTMENT,
  UPDATE_APPOINTMENT,
  FETCH_APPOINTMENT_DETAIL
} from './actions';

import {
  OpenMed_Service
} from 'AppServices';
import { activityActionCreators } from '../activity/actions';
import { translate } from 'AppLanguages';

export function* asyncGetAppointments({ payload }) {
  const { id } = payload;

  try {
    const response = yield call(OpenMed_Service,
      { api: `appointment-requests/calendar?user_id=${id}`,
        method: 'GET',
        params: null
      });

    if (response.result === 'ok') {
      // eslint-disable-next-line
      yield put(appointmentActionCreators.getAppointmentsSuccess(response.data.appointment_to_practices));
    }
  } catch (e) {
    console.log(e);
  }
}

export function* asyncCreateAppointment({ payload, resolve, reject }) {
  const { appointment } = payload;

  const activePatientId = yield select(state => state.patient.activePatient.id);

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'appointment-requests',
        method: 'POST',
        params: { ...appointment }
      }
    );

    if (response.result === 'ok') {
      // eslint-disable-next-line
      yield put(appointmentActionCreators.createAppointmentSuccess(response.data.appointment_request));
      yield put(activityActionCreators.getActivities());
      yield put(appointmentActionCreators.getAppointments({ id: activePatientId }));
      resolve(response.data.appointment_request);
    } else {
      reject(response.message
        || response.errors
        || response.error_description
        || translate('unknownError'));
    }
  } catch (e) {
    reject('Please check your internet connection', 0);
  }
}

export function* asyncUpdateAppointment({ payload, resolve, reject }) {
  const { appointment_request_id, reason, desired_time, patientId } = payload;

  const activePatientId = yield select(state => state.patient.activePatient.id);

  try {
    const response = yield call(OpenMed_Service,
      { api: `appointment-requests/${appointment_request_id}`,
        method: 'PUT',
        params: { reason, desired_time, user_id: patientId }
      });

    if (response.result === 'ok') {
      yield put(appointmentActionCreators.getAppointments({ id: activePatientId }));
      resolve();
    } else {
      reject(
        response.message
        || response.errors
        || response.error_description
        || translate('unknownError'
        ));
    }
  } catch (e) {
    reject('Please check your internet connection', 0);
  }
}

export function* asyncProposeNewAppointment({ payload, resolve, reject }) {
  const { appointmentId, desiredTime, userId } = payload;

  try {
    const response = yield call(OpenMed_Service,
      { api: `appointment-requests/${appointmentId}/patient-propose`,
        method: 'POST',
        params: desiredTime ? { user_id: userId, desired_time: desiredTime } : { user_id: userId }
      });

    if (response.result === 'ok') {
      yield put(appointmentActionCreators.proposeNewAppointmentSuccess(response.data));
      yield put(activityActionCreators.getActivities());
      yield put(appointmentActionCreators.getAppointments({ id: userId }));
      resolve();
    } else {
      reject(
        response.message
        || response.errors
        || response.error_description
        || translate('unknownError'
        ));
    }
  } catch (e) {
    reject();
  }
}

export function* asyncAcceptAppointment({ payload, resolve, reject }) {
  const { appointmentId, time, patientId } = payload;

  try {
    const response = yield call(OpenMed_Service,
      { api: `appointment-requests/${appointmentId}/patient-accept`,
        method: 'POST',
        params: { selected_time: time, user_id: patientId }
      });

    if (response.result === 'ok') {
      yield put(
        appointmentActionCreators.acceptAppointmentSuccess(response.data.appointment_to_practice)
      );
      yield put(activityActionCreators.getActivities());
      yield put(appointmentActionCreators.getAppointments({ id: patientId }));
      resolve(response.data.appointment_to_practice);
    } else {
      reject(
        response.message
        || response.errors
        || response.error_description
        || translate('unknownError'
      ));
    }
  } catch (e) {
    reject();
  }
}

export function* asyncDeclineAppointment({ payload, resolve, reject }) {
  const { appointmentId } = payload;

  const activePatientId = yield select(state => state.patient.activePatient.id);

  try {
    const response = yield call(OpenMed_Service,
      { api: `appointment-requests/${appointmentId}/patient-cancel`,
        method: 'POST',
        params: null
      });

    if (response.result === 'ok') {
      // eslint-disable-next-line
      yield put(appointmentActionCreators.declineAppointmentSuccess(response.data.appointment_to_practice));
      yield put(activityActionCreators.getActivities());
      yield put(appointmentActionCreators.getAppointments({ id: activePatientId }));
      resolve(response.data.appointment_to_practice);
    } else {
      reject(
        response.message
        || response.errors
        || response.error_description
        || translate('unknownError'
        ));
    }
  } catch (e) {
    reject();
  }
}

export function* asyncFetchAppointmentDetail({ payload, resolve, reject }) {
  const { appointmentId } = payload;

  try {
    const response = yield call(OpenMed_Service,
      { api: `appointment-requests/calendar/${appointmentId}`,
        method: 'GET',
        params: null
      });

    if (response.result === 'ok') {
      resolve(response.data.appointment_to_practice);
    } else {
      reject(
        response.message
        || response.errors
        || response.error_description
        || translate('unknownError'
        ));
    }
  } catch (e) {
    reject();
  }
}

export function* watchGetAppointments() {
  while (true) {
    const action: Action = yield take(GET_APPOINTMENTS);
    yield* asyncGetAppointments(action);
  }
}

export function* watchCreateAppointment() {
  while (true) {
    const action: Action = yield take(CREATE_APPOINTMENT);
    yield* asyncCreateAppointment(action);
  }
}

export function* watchProposeNewAppointment() {
  while (true) {
    const action: Action = yield take(PROPOSE_NEW_APPOINTMENT);
    yield* asyncProposeNewAppointment(action);
  }
}

export function* acceptAppointment() {
  while (true) {
    const action: Action = yield take(ACCEPT_APPOINTMENT);
    yield* asyncAcceptAppointment(action);
  }
}

export function* watchDeclineAppointment() {
  while (true) {
    const action: Action = yield take(DECLINE_APPOINTMENT);
    yield* asyncDeclineAppointment(action);
  }
}

export function* watchUpdateAppointment() {
  while (true) {
    const action: Action = yield take(UPDATE_APPOINTMENT);
    yield* asyncUpdateAppointment(action);
  }
}

export function* watchFetchAppointmentDetail() {
  while (true) {
    const action: Action = yield take(FETCH_APPOINTMENT_DETAIL);
    yield* asyncFetchAppointmentDetail(action);
  }
}

export default function* (): Iterable {
  yield all([
    fork(watchGetAppointments),
    fork(watchCreateAppointment),
    fork(watchProposeNewAppointment),
    fork(acceptAppointment),
    fork(watchDeclineAppointment),
    fork(watchUpdateAppointment),
    fork(watchFetchAppointmentDetail),
  ]);
}
