// @flow

import { createAction } from 'redux-actions';
import { createPromiseAction } from '../utils';

/**
 * Action Types
 */

export const LOGIN = 'auth/LOGIN';
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'auth/LOGIN_FAILURE';
export const SOCIAL_LOGIN = 'auth/SOCIAL_LOGIN';
export const SOCIAL_LOGIN_SUCCESS = 'auth/SOCIAL_LOGIN_SUCCESS';
export const SOCIAL_LOGIN_FAILURE = 'auth/SOCIAL_LOGIN_FAILURE';
export const INITIAL_USER = 'auth/INITIAL_USER';
export const SET_USER = 'auth/SET_USER';
export const ADD_LOGGED_USER = 'auth/ADD_LOGGED_USER';
export const REGISTER = 'auth/REGISTER';
export const FORGOT_PASSWORD = 'auth/FORGOT_PASSWORD';
export const RESET_PASSWORD = 'auth/RESET_PASSWORD';
export const RESET_PASSWORD_SUCCESS = 'auth/RESET_PASSWORD_SUCCESS';
export const CHANGE_PASSWORD = 'auth/CHANGE_PASSWORD';
export const GET_PHOTO_BY_USER = 'auth/GET_PHOTO_BY_USER';
export const RESEND_EMAIL = 'auth/RESEND_EMAIL';
export const RESEND_PHONE = 'auth/RESEND_PHONE';
export const SET_DEVICE_TOKEN = 'auth/SET_DEVICE_TOKEN';
export const LOGOUT = 'auth/LOGOUT';
export const ADD_RECENT_SEARCH = 'auth/ADD_RECENT_SEARCH';
export const SET_LAST_VISITED = 'auth/SET_LAST_VISITED';
export const GET_PATIENT_INVITE_CODE = 'patient/GET_PATIENT_INVITE_CODE';
export const GET_PATIENT_INVITE_CODE_SUCCESS = 'patient/GET_PATIENT_INVITE_CODE_SUCCESS';
export const SET_PATIENT_INVITE_CODE = 'patient/SET_PATIENT_INVITE_CODE';
export const SET_PATIENT_INVITE_CODE_SUCCESS = 'patient/SET_PATIENT_INVITE_CODE_SUCCESS';

/**
 * Action Creators
 */
export const authActionCreators = {
  login: createPromiseAction(LOGIN),
  loginSuccess: createAction(LOGIN_SUCCESS),
  loginFailure: createAction(LOGIN_FAILURE),
  socialLogin: createPromiseAction(SOCIAL_LOGIN),
  socialLoginSuccess: createAction(SOCIAL_LOGIN_SUCCESS),
  socialLoginFailure: createAction(SOCIAL_LOGIN_FAILURE),
  logout: createPromiseAction(LOGOUT),
  initialUser: createAction(INITIAL_USER),
  setUser: createAction(SET_USER),
  addLoggedUsers: createAction(ADD_LOGGED_USER),
  registerUser: createPromiseAction(REGISTER),
  forgotPassword: createPromiseAction(FORGOT_PASSWORD),
  resetPassword: createPromiseAction(RESET_PASSWORD),
  resetPasswordSuccess: createAction(RESET_PASSWORD_SUCCESS),
  changePassword: createPromiseAction(CHANGE_PASSWORD),
  getPhotoByUser: createPromiseAction(GET_PHOTO_BY_USER),
  resendEmail: createAction(RESEND_EMAIL),
  resendPhone: createAction(RESEND_PHONE),
  setDeviceToken: createPromiseAction(SET_DEVICE_TOKEN),
  addRecentSearch: createAction(ADD_RECENT_SEARCH),
  setLastVisited: createAction(SET_LAST_VISITED),
  getPatientInviteCode: createPromiseAction(GET_PATIENT_INVITE_CODE),
  getPatientInviteCodeSuccess: createAction(GET_PATIENT_INVITE_CODE_SUCCESS),
  setPatientInviteCode: createPromiseAction(SET_PATIENT_INVITE_CODE),
  setPatientInviteCodeSuccess: createAction(SET_PATIENT_INVITE_CODE_SUCCESS)
};
