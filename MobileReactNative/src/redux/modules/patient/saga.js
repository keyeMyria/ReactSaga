// @flow

import { translate } from 'AppLanguages';
import { OpenMed_Service } from 'AppServices';

import {
  take,
  put,
  call,
  fork,
  all,
  select
} from 'redux-saga/effects';

import {
  patientActionCreators,
  GET_PATIENTS,
  ADD_PATIENT,
  UPDATE_PATIENT,
  UPDATE_PATIENT_INSURANCE,
  REMOVE_PATIENT_INSURANCE,
  ADD_PATIENT_INSURANCE,
  REFRESH_PATIENTS,
  UPDATE_PATIENT_STATUS,
  ADD_PATIENT_CARD,
  GET_PATIENT_CARD,
  REMOVE_PATIENT_CARD,
  GET_PATIENT_PAYMENT_HISTORY,
  SET_PATIENT_ACTIVE_CARD,
  GET_PRIMARY_CARE_DOCTOR,
  SET_PRIMARY_CARE_DOCTOR,
  REMOVE_PRIMARY_CARE_DOCTOR
} from './actions';

import { selectActivePatient, selectCurrentUser } from './selectors';
import { authActionCreators } from '../auth/actions';

export function* asyncGetPatients({ resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'users/patients',
        method: 'GET',
        params: null
      }
    );

    if (response.result === 'ok') {
      // TODO : Add myself to patient list
      const currentUser = yield select(selectCurrentUser);
      const patients = response.data.users;
      let activePatient = {};

      const newPatients = patients.map((p) => {
        const newPatient = Object.assign({}, p);
        // if (newPatient.has_photo) {
        //   newPatient.photo =
        //     ImageUtils.getProfileImage(p.id);
        // }
        if (newPatient.id === currentUser.id) {
          activePatient = newPatient;
        }
        return newPatient;
      });
      yield put(patientActionCreators.setCurrentPatient(activePatient));
      yield put(patientActionCreators.getPatientsSuccess(newPatients));
      if (resolve) {
        resolve(true);
      }
    } else if (resolve) {
      resolve(false);
    }
  } catch (e) {
    if (reject) {
      reject(e);
    }
  }
}

export function* asyncRefreshPatients() {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'users/patients',
        method: 'GET',
        params: null
      }
    );

    if (response.result === 'ok') {
      const patients = response.data.users;
      const activePatient = yield select(selectActivePatient);

      const newActivePatient = patients.filter(p => p.id === activePatient.id).pop();
      if (newActivePatient) {
        yield put(patientActionCreators.setCurrentPatient(newActivePatient));
        yield put(patientActionCreators.getPatientsSuccess(patients));
      }
    }
  } catch (e) {
    console.log(e);
  }
}

export function* asyncAddPatient({ payload, resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'patients/add-to-account',
        method: 'POST',
        params: payload
      }
    );

    if (response.result === 'ok') {
      yield put(patientActionCreators.addPatientSuccess(response.data.user));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncUpdatePatient({ payload, resolve, reject }) {
  const { id } = payload;

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `patients/${id}`,
        method: 'PUT',
        params: payload
      }
    );

    if (response.result === 'ok') {
      const currentUser = yield select(selectCurrentUser);
      const { id: userId } = response.data.user;

      if (currentUser.id === userId) {
        yield put(authActionCreators.setUser(response.data.user));
      }
      yield put(patientActionCreators.updatePatientSuccess(response.data.user));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncAddPatientInsurance({ payload, resolve, reject }) {
  const { insurance } = payload;

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'patient-insurance',
        method: 'POST',
        params: insurance
      }
    );

    if (response.result === 'ok') {
      yield put(patientActionCreators.addPatientInsuranceSuccess({
        patient_id: insurance.user_id, insuranceData: response.data.insurance
      }));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncUpdatePatientInsurance({ payload, resolve, reject }) {
  const { user_id, id, insurance } = payload;

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `patient-insurance/${id}`,
        method: 'PUT',
        params: insurance
      }
    );

    if (response.result === 'ok') {
      yield put(patientActionCreators.updatePatientInsuranceSuccess({
        patient_id: user_id, insurance_id: id, insuranceData: response.data.insurance
      }));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncRemovePatientInsurance({ payload, resolve, reject }) {
  const { user_id, id } = payload;

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `patient-insurance/${id}`,
        method: 'DELETE',
        params: null
      }
    );

    if (response.result === 'ok') {
      yield put(patientActionCreators.removePatientInsuranceSuccess({
        patient_id: user_id, insurance_id: id
      }));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncUpdatePatientStatus({ payload, resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'patient/existing',
        method: 'POST',
        params: payload
      }
    );

    if (response.result === 'ok') {
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject(e);
  }
}

export function* asyncAddPatientCard({ payload, resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'stripe-card',
        method: 'POST',
        params: payload
      }
    );
    if (response.result === 'ok') {
      yield put(patientActionCreators.addPatientCardSuccess({
        cardData: response.data.stripe_card
      }));
      resolve();
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncGetPatientCard({ resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'stripe-card',
        method: 'GET',
        params: null
      }
    );
    if (response.result === 'ok') {
      yield put(patientActionCreators.getPatientCardSuccess({
        cardData: response.data.stripe_cards
      }));
      resolve(response);
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncGetPatientPaymentHistory({ resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'patient/payments-history',
        method: 'GET',
        params: null
      }
    );
    if (response.result === 'ok') {
      yield put(patientActionCreators.getPatientPaymentHistorySuccess({
        paymentHistory: response.data.user_payment_history.rows
      }));
      resolve();
    } else {
      reject(response.errors || response.message || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncRemovePatientCard({ payload, resolve, reject }) {
  const { id } = payload;

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `stripe-card/${id}`,
        method: 'DELETE',
        params: null
      }
    );

    if (response.result === 'ok') {
      yield put(patientActionCreators.removePatientCardSuccess({
        card_id: id
      }));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncSetPatientActiveCard({ payload, resolve, reject }) {
  const { data, id } = payload;
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `stripe-card/${id}`,
        method: 'PUT',
        params: data
      }
    );
    if (response.result === 'ok') {
      yield put(patientActionCreators.setPatientActiveCardSuccess({
        cardData: response.data.stripe_card, card_id: id
      }));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncGetPrimaryCareDoctor({ resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: `patients/primary-doctor`,
        method: 'GET',
        params: null
      }
    );
    if (response.code === 200) {
      yield put(patientActionCreators.getPrimaryCareDoctorSuccess({
        primaryCareDoctors: response.data.provider_to_patient
      }));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncSetPrimaryCareDoctor({ payload, resolve, reject }) {
  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'patients/primary-doctor',
        method: 'POST',
        params: payload
      }
    );
    if (response.code === 200) {
      yield put(patientActionCreators.setPrimaryCareDoctorSuccess({
        primaryCareDoctors: response.data.provider_to_patient
      }));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* asyncRemovePrimaryCareDoctor({ payload, resolve, reject }) {

  try {
    const response = yield call(
      OpenMed_Service,
      {
        api: 'patients/primary-doctor',
        method: 'DELETE',
        params: payload
      }
    );

    if (response.code === 200) {
      yield put(patientActionCreators.removePrimaryCareDoctorSuccess({
        primaryCareDoctors: response.data, payload
      }));
      resolve();
    } else {
      reject(response.errors || response.error || translate('unknownError'));
    }
  } catch (e) {
    reject('Check your internet connection please.');
  }
}

export function* watchGetPatients() {
  while (true) {
    const action: Action = yield take(GET_PATIENTS);
    yield* asyncGetPatients(action);
  }
}

export function* watchAddPatient() {
  while (true) {
    const action: Action = yield take(ADD_PATIENT);
    yield* asyncAddPatient(action);
  }
}

export function* watchUpdatePatient() {
  while (true) {
    const action: Action = yield take(UPDATE_PATIENT);
    yield* asyncUpdatePatient(action);
  }
}

export function* watchUpdatePatientInsurance() {
  while (true) {
    const action: Action = yield take(UPDATE_PATIENT_INSURANCE);
    yield* asyncUpdatePatientInsurance(action);
  }
}

export function* watchRemovePatientInsurance() {
  while (true) {
    const action: Action = yield take(REMOVE_PATIENT_INSURANCE);
    yield* asyncRemovePatientInsurance(action);
  }
}

export function* watchAddPatientInsurance() {
  while (true) {
    const action: Action = yield take(ADD_PATIENT_INSURANCE);
    yield* asyncAddPatientInsurance(action);
  }
}

export function* watchRefreshPatients() {
  while (true) {
    const action: Action = yield take(REFRESH_PATIENTS);
    yield* asyncRefreshPatients(action);
  }
}

export function* watchUpdatePatientStatus() {
  while (true) {
    const action: Action = yield take(UPDATE_PATIENT_STATUS);
    yield* asyncUpdatePatientStatus(action);
  }
}

export function* watchAddPatientCard() {
  while (true) {
    const action: Action = yield take(ADD_PATIENT_CARD);
    yield* asyncAddPatientCard(action);
  }
}

export function* watchGetPatientCard() {
  while (true) {
    const action: Action = yield take(GET_PATIENT_CARD);
    yield* asyncGetPatientCard(action);
  }
}

export function* watchRemovePatientCard() {
  while (true) {
    const action: Action = yield take(REMOVE_PATIENT_CARD);
    yield* asyncRemovePatientCard(action);
  }
}

export function* watchGetPatientPaymentHistory() {
  while (true) {
    const action: Action = yield take(GET_PATIENT_PAYMENT_HISTORY);
    yield* asyncGetPatientPaymentHistory(action);
  }
}

export function* watchSetPatientActiveCard() {
  while (true) {
    const action: Action = yield take(SET_PATIENT_ACTIVE_CARD);
    yield* asyncSetPatientActiveCard(action);
  }
}

export function* watchGetPrimaryCareDoctor() {
  while (true) {
    const action: Action = yield take(GET_PRIMARY_CARE_DOCTOR);
    yield* asyncGetPrimaryCareDoctor(action);
  }
}

export function* watchSetPrimaryCareDoctor() {
  while (true) {
    const action: Action = yield take(SET_PRIMARY_CARE_DOCTOR);
    yield* asyncSetPrimaryCareDoctor(action);
  }
}

export function* watchRemovePrimaryCareDoctor() {
  while (true) {
    const action: Action = yield take(REMOVE_PRIMARY_CARE_DOCTOR);
    yield* asyncRemovePrimaryCareDoctor(action);
  }
}


export default function* (): Iterable {
  yield all([
    fork(watchGetPatients),
    fork(watchRefreshPatients),
    fork(watchAddPatient),
    fork(watchUpdatePatient),
    fork(watchUpdatePatientInsurance),
    fork(watchRemovePatientInsurance),
    fork(watchAddPatientInsurance),
    fork(watchUpdatePatientStatus),
    fork(watchAddPatientCard),
    fork(watchGetPatientPaymentHistory),
    fork(watchRemovePatientCard),
    fork(watchGetPatientCard),
    fork(watchSetPatientActiveCard),
    fork(watchGetPrimaryCareDoctor),
    fork(watchSetPrimaryCareDoctor),
    fork(watchRemovePrimaryCareDoctor)
  ]);
}
