// @flow

import type { Action } from 'AppTypes';
import {
  GET_INSURANCES_SUCCESS,
  SET_SELF_PLAYING,
  GET_SPECIALITIES_SUCCESS
} from './actions';
import { defaultReducers } from '../defaultReducers';

const DEFAULT = defaultReducers.insurance;

export default function insurance(state = DEFAULT, action: Action = {}) {
  const { type, payload } = action;

  switch (type) {
    case GET_INSURANCES_SUCCESS: {
      return {
        ...state,
        insurances: payload
      };
    }
    case SET_SELF_PLAYING: {
      return {
        ...state,
        selfPaying: payload
      };
    }
    case GET_SPECIALITIES_SUCCESS: {
      return {
        ...state,
        specialties: payload
      };
    }
    default:
      return state;
  }
}
