// @flow

import { createAction } from 'redux-actions';
import { createPromiseAction } from '../utils';

/**
 * Action Types
 */

export const SET_FILTER = 'provider/SET_FILTER';
export const GET_PROVIDER_REQUEST = 'provider/GET_PROVIDER_REQUEST';
export const GET_PROVIDER_REQUEST_SUCCESS = 'provider/GET_PROVIDER_REQUEST_SUCCESS';
export const GET_PROVIDERS_REQUEST = 'provider/GET_PROVIDERS_REQUEST';
export const GET_PROVIDERS_REQUEST_SUCCESS = 'provider/GET_PROVIDERS_REQUEST_SUCCESS';
export const GET_REGION_PROVIDERS_REQUEST = 'provider/GET_REGION_PROVIDERS_REQUEST';
export const GET_REGION_PROVIDERS_REQUEST_SUCCESS = 'provider/GET_REGION_PROVIDERS_REQUEST_SUCCESS';
export const GET_SERVE_PROVIDERS_REQUEST = 'provider/GET_SERVE_PROVIDERS_REQUEST';
export const GET_SERVE_PROVIDERS_REQUEST_SUCCESS = 'provider/GET_SERVE_PROVIDERS_REQUEST_SUCCESS';
export const ADD_SERVE_PROVIDER_REQUEST = 'provider/ADD_SERVE_PROVIDER_REQUEST';
export const DELETE_SERVE_PROVIDER_REQUEST = 'provider/DELETE_SERVE_PROVIDER_REQUEST';
export const GIVE_FEEDBACK_TO_PROVIDER = 'provider/GIVE_FEEDBACK_TO_PROVIDER';
export const GET_PROVIDER_DETAIL = 'provider/GET_PROVIDER_DETAIL';
export const GET_PROVIDER_DETAIL_SUCCESS = 'provider/GET_PROVIDER_DETAIL_SUCCESS';

/**
 * Action Creators
 */
export const providerActionCreators = {
  setFilter: createAction(SET_FILTER),
  getProviderRequest: createPromiseAction(GET_PROVIDER_REQUEST),
  getProviderSuccess: createAction(GET_PROVIDER_REQUEST_SUCCESS),
  getProvidersRequest: createPromiseAction(GET_PROVIDERS_REQUEST),
  getProvidersSuccess: createAction(GET_PROVIDERS_REQUEST_SUCCESS),
  getRegionProvidersRequest: createPromiseAction(GET_REGION_PROVIDERS_REQUEST),
  getRegionProvidersSuccess: createAction(GET_REGION_PROVIDERS_REQUEST_SUCCESS),
  getServeProvidersRequest: createAction(GET_SERVE_PROVIDERS_REQUEST),
  getServeProvidersSuccess: createAction(GET_SERVE_PROVIDERS_REQUEST_SUCCESS),
  addServeProviderRequest: createAction(ADD_SERVE_PROVIDER_REQUEST),
  deleteServeProviderRequest: createAction(DELETE_SERVE_PROVIDER_REQUEST),
  giveFeedBackToProvider: createPromiseAction(GIVE_FEEDBACK_TO_PROVIDER),
  getProviderDetail: createPromiseAction(GET_PROVIDER_DETAIL),
  getProviderDetailSuccess: createAction(GET_PROVIDER_DETAIL_SUCCESS),
};
