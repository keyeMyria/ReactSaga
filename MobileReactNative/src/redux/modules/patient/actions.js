// @flow

import { createAction } from 'redux-actions';
import { createPromiseAction } from '../utils';

/**
 * Action Types
 */

export const SET_CURRENT_PATIENT = 'patient/SET_CURRENT_PATIENT';
export const GET_PATIENTS = 'patient/GET_PATIENTS';
export const GET_PATIENTS_SUCCESS = 'patient/GET_PATIENTS_SUCCESS';
export const ADD_PATIENT = 'patient/ADD_PATIENT';
export const ADD_PATIENT_SUCCESS = 'patient/ADD_PATIENT_SUCCESS';
export const UPDATE_PATIENT = 'patient/UPDATE_PATIENT';
export const UPDATE_PATIENT_SUCCESS = 'patient/UPDATE_PATIENT_SUCCESS';
export const UPDATE_PATIENT_INSURANCE = 'patient/UPDATE_PATIENT_INSURANCE';
export const UPDATE_PATIENT_INSURANCE_SUCCESS = 'patient/UPDATE_PATIENT_INSURANCE_SUCCESS';
export const REMOVE_PATIENT_INSURANCE = 'patient/REMOVE_PATIENT_INSURANCE';
export const REMOVE_PATIENT_INSURANCE_SUCCESS = 'patient/REMOVE_PATIENT_INSURANCE_SUCCESS';
export const ADD_PATIENT_INSURANCE = 'patient/ADD_PATIENT_INSURANCE';
export const ADD_PATIENT_INSURANCE_SUCCESS = 'patient/ADD_PATIENT_INSURANCE_SUCCESS';
export const REFRESH_PATIENTS = 'patient/REFRESH_PATIENTS';
export const UPDATE_PATIENT_STATUS = 'patient/UPDATE_PATIENT_STATUS';
export const ADD_PATIENT_CARD = 'patient/ADD_PATIENT_CARD';
export const ADD_PATIENT_CARD_SUCCESS = 'patient/ADD_PATIENT_CARD_SUCCESS';
export const GET_PATIENT_CARD = 'patient/GET_PATIENT_CARD';
export const GET_PATIENT_CARD_SUCCESS = 'patient/GET_PATIENT_CARD_SUCCESS';
export const GET_PATIENT_PAYMENT_HISTORY = 'patient/GET_PATIENT_PAYMENT_HISTORY';
export const GET_PATIENT_PAYMENT_HISTORY_SUCCESS = 'patient/GET_PATIENT_PAYMENT_HISTORY_SUCCESS';
export const REMOVE_PATIENT_CARD = 'patient/REMOVE_PATIENT_CARD';
export const REMOVE_PATIENT_CARD_SUCCESS = 'patient/REMOVE_PATIENT_CARD_SUCCESS';
export const SET_PATIENT_ACTIVE_CARD = 'patient/SET_PATIENT_ACTIVE_CARD';
export const SET_PATIENT_ACTIVE_CARD_SUCCESS = 'patient/SET_PATIENT_ACTIVE_CARD_SUCCESS';
export const GET_PRIMARY_CARE_DOCTOR = 'patient/GET_PRIMARY_CARE_DOCTOR';
export const GET_PRIMARY_CARE_DOCTOR_SUCCESS = 'patient/GET_PRIMARY_CARE_DOCTOR_SUCCESS';
export const SET_PRIMARY_CARE_DOCTOR = 'patient/SET_PRIMARY_CARE_DOCTOR';
export const SET_PRIMARY_CARE_DOCTOR_SUCCESS = 'patient/SET_PRIMARY_CARE_DOCTOR_SUCCESS';
export const REMOVE_PRIMARY_CARE_DOCTOR = 'patient/REMOVE_PRIMARY_CARE_DOCTOR';
export const REMOVE_PRIMARY_CARE_DOCTOR_SUCCESS = 'patient/REMOVE_PRIMARY_CARE_DOCTOR_SUCCESS';

/**
 * Action Creators
 */

export const patientActionCreators = {
  setCurrentPatient: createAction(SET_CURRENT_PATIENT),
  refreshPatients: createAction(REFRESH_PATIENTS),
  getPatients: createPromiseAction(GET_PATIENTS),
  getPatientsSuccess: createAction(GET_PATIENTS_SUCCESS),
  addPatient: createPromiseAction(ADD_PATIENT),
  addPatientSuccess: createAction(ADD_PATIENT_SUCCESS),
  updatePatient: createPromiseAction(UPDATE_PATIENT),
  updatePatientSuccess: createAction(UPDATE_PATIENT_SUCCESS),
  updatePatientInsurance: createPromiseAction(UPDATE_PATIENT_INSURANCE),
  updatePatientInsuranceSuccess: createAction(UPDATE_PATIENT_INSURANCE_SUCCESS),
  removePatientInsurance: createPromiseAction(REMOVE_PATIENT_INSURANCE),
  removePatientInsuranceSuccess: createAction(REMOVE_PATIENT_INSURANCE_SUCCESS),
  addPatientInsurance: createPromiseAction(ADD_PATIENT_INSURANCE),
  addPatientInsuranceSuccess: createAction(ADD_PATIENT_INSURANCE_SUCCESS),
  updatePatientStatus: createPromiseAction(UPDATE_PATIENT_STATUS),
  addPatientCard: createPromiseAction(ADD_PATIENT_CARD),
  addPatientCardSuccess: createAction(ADD_PATIENT_CARD_SUCCESS),
  getPatientCard: createPromiseAction(GET_PATIENT_CARD),
  getPatientCardSuccess: createAction(GET_PATIENT_CARD_SUCCESS),
  getPatientPaymentHistory: createPromiseAction(GET_PATIENT_PAYMENT_HISTORY),
  getPatientPaymentHistorySuccess: createAction(GET_PATIENT_PAYMENT_HISTORY_SUCCESS),
  removePatientCard: createPromiseAction(REMOVE_PATIENT_CARD),
  removePatientCardSuccess: createAction(REMOVE_PATIENT_CARD_SUCCESS),
  setPatientActiveCard: createPromiseAction(SET_PATIENT_ACTIVE_CARD),
  setPatientActiveCardSuccess: createAction(SET_PATIENT_ACTIVE_CARD_SUCCESS),
  getPrimaryCareDoctor: createPromiseAction(GET_PRIMARY_CARE_DOCTOR),
  getPrimaryCareDoctorSuccess: createPromiseAction(GET_PRIMARY_CARE_DOCTOR_SUCCESS),
  setPrimaryCareDoctor: createPromiseAction(SET_PRIMARY_CARE_DOCTOR),
  setPrimaryCareDoctorSuccess: createPromiseAction(SET_PRIMARY_CARE_DOCTOR_SUCCESS),
  removePrimaryCareDoctor: createPromiseAction(REMOVE_PRIMARY_CARE_DOCTOR),
  removePrimaryCareDoctorSuccess: createPromiseAction(REMOVE_PRIMARY_CARE_DOCTOR_SUCCESS)
};
