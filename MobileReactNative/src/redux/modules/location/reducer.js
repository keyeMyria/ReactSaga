// @flow

import type { Action } from 'AppTypes';
import {
  SET_LOCATION,
  GEO_REQUEST_SUCCESS,
  GEO_CODE_REQUEST_SUCCESS
} from './actions';
import { defaultReducers } from '../defaultReducers';

const DEFAULT = defaultReducers.location;

export default function location(state = DEFAULT, action: Action = {}) {
  const { type, payload } = action;

  switch (type) {
    case SET_LOCATION: {
      return {
        ...state,
        region: payload
      };
    }
    case GEO_REQUEST_SUCCESS: {
      return {
        ...state,
        geoRegion: payload
      };
    }
    case GEO_CODE_REQUEST_SUCCESS: {
      return {
        ...state,
        geoData: payload
      };
    }
    default:
      return state;
  }
}
