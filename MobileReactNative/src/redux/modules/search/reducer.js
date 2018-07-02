// @flow

import type { Action } from 'AppTypes';
import {
  SEARCH_PROVIDERS,
  SEARCH_PROVIDERS_SUCCESS,
  SEARCH_PLACES_SUCCESS,
  SET_SEARCH_TEXT,
  SET_SEARCH_LOCATION,
  GET_PLACE_DETAILS_FROM_COOR_SUCCESS
} from './actions';
import { defaultReducers } from '../defaultReducers';

const DEFAULT = defaultReducers.search;

export default function search(state = DEFAULT, action: Action = {}) {
  const { type, payload } = action;

  switch (type) {
    case SEARCH_PROVIDERS: {
      const { searchLocation, searchText } = payload;
      let newState = searchLocation ? { ...state, searchLocation } : state;
      newState = searchText ? { ...newState, searchText } : state;
      return newState;
    }
    case SEARCH_PROVIDERS_SUCCESS: {
      return {
        ...state,
        searchedProviders: {
          total: payload.pagination.total,
          count: payload.pagination.count,
          results: payload.rows
        }
      };
    }
    case SEARCH_PLACES_SUCCESS: {
      return {
        ...state,
        searchedPlaces: payload
      };
    }
    case SET_SEARCH_TEXT: {
      return {
        ...state,
        searchText: payload.searchText
      };
    }
    case SET_SEARCH_LOCATION: {
      return {
        ...state,
        searchLocation: {
          ...state.searchLocation,
          ...payload.searchLocation
        }
      };
    }
    case GET_PLACE_DETAILS_FROM_COOR_SUCCESS: {
      return {
        ...state,
        searchLocation: {
          ...state.searchLocation,
          ...payload.searchLocation
        }
      };
    }
    default:
      return state;
  }
}
