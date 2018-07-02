// @flow

import type { Action } from 'AppTypes';
import {
  LOGIN_SUCCESS,
  SOCIAL_LOGIN_SUCCESS,
  SET_USER,
  SET_DEVICE_TOKEN,
  ADD_RECENT_SEARCH,
  SET_LAST_VISITED,
  RESET_PASSWORD_SUCCESS,
} from './actions';
import { defaultReducers } from '../defaultReducers';
import { uniqBy } from 'lodash';

const DEFAULT = defaultReducers.auth;

export default function user(state = DEFAULT, action: Action = {}) {
  const { type, payload } = action;

  switch (type) {
    case LOGIN_SUCCESS: {
      return {
        ...state,
        user: {
          ...payload,
          fromFacebook: false
        }
      };
    }
    case SOCIAL_LOGIN_SUCCESS: {
      return {
        ...state,
        user: {
          ...payload,
          fromFacebook: true
        }
      };
    }
    case SET_USER: {
      return {
        ...state,
        user: payload
      };
    }
    case SET_DEVICE_TOKEN: {
      const { device_token } = payload;
      return {
        ...state,
        device_token
      };
    }
    case ADD_RECENT_SEARCH: {
      return {
        ...state,
        recentSearches: uniqBy([...state.recentSearches, payload], 'practice.id')
      };
    }
    case SET_LAST_VISITED: {
      return {
        ...state,
        lastVisited: payload.lastVisited
      };
    }
    case RESET_PASSWORD_SUCCESS: {
      return {
        ...state,
        user: {
          ...state.user,
          reset_password_required: false
        }
      };
    }
    default:
      return state;
  }
}
