// @flow

import { createAction } from 'redux-actions';
import { createPromiseAction } from '../utils';

/**
 * Action Types
 */

export const SET_PROVIDER = 'appointment/SET_PROVIDER';
export const SET_PROVIDERS = 'appointment/SET_PROVIDERS';
export const ADD_PROVIDER = 'appointment/ADD_PROVIDER';
export const SET_APPOINTMENT_TIME = 'appointment/SET_APPOINTMENT_TIME';
export const RESET_APPOINTMENT = 'appointment/RESET_APPOINTMENT';
export const GET_APPOINTMENTS = 'appointment/GET_APPOINTMENTS';
export const GET_APPOINTMENTS_SUCCESS = 'appointment/GET_APPOINTMENTS_SUCCESS';
export const CREATE_APPOINTMENT = 'appointment/CREATE_APPOINTMENT';
export const CREATE_APPOINTMENT_SUCCESS = 'appointment/CREATE_APPOINTMENT_SUCCESS';
export const PROPOSE_NEW_APPOINTMENT = 'appointment/PROPOSE_NEW_APPOINTMENT';
export const PROPOSE_NEW_APPOINTMENT_SUCCESS = 'appointment/PROPOSE_NEW_APPOINTMENT_SUCCESS';
export const ACCEPT_APPOINTMENT = 'appointment/ACCEPT_APPOINTMENT';
export const ACCEPT_APPOINTMENT_SUCCESS = 'appointment/ACCEPT_APPOINTMENT_SUCCESS';
export const DECLINE_APPOINTMENT = 'appointment/DECLINE_APPOINTMENT';
export const DECLINE_APPOINTMENT_SUCCESS = 'appointment/DECLINE_APPOINTMENT_SUCCESS';
export const UPDATE_APPOINTMENT = 'appointment/UPDATE_APPOINTMENT';
export const FETCH_APPOINTMENT_DETAIL = 'appointment/FETCH_APPOINTMENT_DETAIL';

/**
 * Action Creators
 */
export const appointmentActionCreators = {
  setProvider: createAction(SET_PROVIDER),
  setProviders: createAction(SET_PROVIDERS),
  addProvider: createAction(ADD_PROVIDER),
  setAppointmentTime: createAction(SET_APPOINTMENT_TIME),
  resetAppointment: createAction(RESET_APPOINTMENT),
  getAppointments: createPromiseAction(GET_APPOINTMENTS),
  getAppointmentsSuccess: createAction(GET_APPOINTMENTS_SUCCESS),
  updateAppointment: createPromiseAction(UPDATE_APPOINTMENT),
  createAppointment: createPromiseAction(CREATE_APPOINTMENT),
  createAppointmentSuccess: createAction(CREATE_APPOINTMENT_SUCCESS),
  proposeNewAppointment: createPromiseAction(PROPOSE_NEW_APPOINTMENT),
  proposeNewAppointmentSuccess: createAction(PROPOSE_NEW_APPOINTMENT_SUCCESS),
  acceptAppointment: createPromiseAction(ACCEPT_APPOINTMENT),
  acceptAppointmentSuccess: createAction(ACCEPT_APPOINTMENT_SUCCESS),
  declineAppointment: createPromiseAction(DECLINE_APPOINTMENT),
  declineAppointmentSuccess: createAction(DECLINE_APPOINTMENT_SUCCESS),
  fetchAppointmentDetail: createPromiseAction(FETCH_APPOINTMENT_DETAIL),
};
