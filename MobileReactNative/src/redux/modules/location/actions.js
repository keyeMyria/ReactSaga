// @flow

import { createAction } from 'redux-actions';
import { createPromiseAction } from '../utils';

/**
 * Action Types
 */

export const SET_LOCATION = 'location/SET_LOCATION';
export const GEO_REQUEST = 'location/GEO_REQUEST';
export const GEO_REQUEST_SUCCESS = 'location/GEO_REQUEST_SUCCESS';
export const GEO_CODE_REQUEST = 'location/GEO_CODE_REQUEST';
export const GEO_CODE_REQUEST_SUCCESS = 'location/GEO_CODE_REQUEST_SUCCESS';

/**
 * Action Creators
 */
export const locationActionCreators = {
  setLocation: createAction(SET_LOCATION),
  geoRequest: createPromiseAction(GEO_REQUEST),
  geoSuccess: createAction(GEO_REQUEST_SUCCESS),
  geoCodeRequest: createPromiseAction(GEO_CODE_REQUEST),
  geoCodeSuccess: createAction(GEO_CODE_REQUEST_SUCCESS),
};
