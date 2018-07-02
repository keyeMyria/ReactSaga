// @flow

import { createAction } from 'redux-actions';
import { createPromiseAction } from '../utils';

/**
 * Action Types
 */

export const GET_PLACE_DETAILS = 'search/GET_PLACE_DETAILS';
export const SEARCH_PLACES = 'search/SEARCH_PLACES';
export const SEARCH_PLACES_SUCCESS = 'search/SEARCH_PLACES_SUCCESS';
export const SEARCH_PROVIDERS = 'search/SEARCH_PROVIDERS';
export const SEARCH_PROVIDERS_SUCCESS = 'search/SEARCH_PROVIDERS_SUCCESS';
export const SET_SEARCH_TEXT = 'search/SET_SEARCH_TEXT';
export const SET_SEARCH_LOCATION = 'search/SET_SEARCH_LOCATION';
export const GET_PLACE_DETAILS_FROM_COOR = 'search/GET_PLACE_DETAILS_FROM_COOR';
export const GET_PLACE_DETAILS_FROM_COOR_SUCCESS = 'search/GET_PLACE_DETAILS_FROM_COOR_SUCCESS';

/**
 * Action Creators
 */
export const searchActionCreators = {
  getPlaceDetails: createPromiseAction(GET_PLACE_DETAILS),
  searchPlaces: createAction(SEARCH_PLACES),
  searchPlacesSuccess: createAction(SEARCH_PLACES_SUCCESS),
  searchProviders: createPromiseAction(SEARCH_PROVIDERS),
  searchProvidersSuccess: createAction(SEARCH_PROVIDERS_SUCCESS),
  setSearchText: createAction(SET_SEARCH_TEXT),
  setSearchLocation: createAction(SET_SEARCH_LOCATION),
  getPlaceDetailsFromCoordinates: createAction(GET_PLACE_DETAILS_FROM_COOR),
  getPlaceDetailsFromCoordinatesSuccess: createAction(GET_PLACE_DETAILS_FROM_COOR_SUCCESS),
};
