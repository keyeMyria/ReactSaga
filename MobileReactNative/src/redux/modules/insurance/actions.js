// @flow

import { createAction } from 'redux-actions';
import { createPromiseAction } from '../utils';

/**
 * Action Types
 */

export const GET_INSURANCES = 'insurance/GET_INSURANCES';
export const GET_INSURANCES_SUCCESS = 'insurance/GET_INSURANCES_SUCCESS';
export const SET_SELF_PLAYING = 'insurance/SET_SELF_PLAYING';
export const GET_SPECIALTIES = 'insurance/GET_SPECIALTIES';
export const GET_SPECIALITIES_SUCCESS = 'insurance/GET_SPECIALITIES_SUCCESS';

/**
 * Action Creators
 */
export const insuranceActionCreators = {
  getInsurances: createAction(GET_INSURANCES),
  getInsurancesSuccess: createAction(GET_INSURANCES_SUCCESS),
  setSelfPaying: createAction(SET_SELF_PLAYING),
  getSpecialties: createPromiseAction(GET_SPECIALTIES),
  getSpecialtiesSuccess: createAction(GET_SPECIALITIES_SUCCESS)
};
