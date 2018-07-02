// @flow

import type { Action } from 'AppTypes';
import {
  GET_PROVIDER_REQUEST_SUCCESS,
  GET_PROVIDERS_REQUEST_SUCCESS,
  GET_REGION_PROVIDERS_REQUEST_SUCCESS,
  GET_SERVE_PROVIDERS_REQUEST_SUCCESS,
  GET_PROVIDER_DETAIL_SUCCESS,
  ADD_SERVE_PROVIDER_REQUEST,
  DELETE_SERVE_PROVIDER_REQUEST,
  SET_FILTER
} from './actions';
import { defaultReducers } from '../defaultReducers';

const DEFAULT = defaultReducers.provider;

export default function provider(state = DEFAULT, action: Action = {}) {
  const { type, payload } = action;

  switch (type) {
    case GET_PROVIDER_REQUEST_SUCCESS: {
      return {
        ...state,
        providers: payload
      };
    }
    case GET_PROVIDERS_REQUEST_SUCCESS: {
      const newProviders = state.page > 1
        ? {
          total_count: payload.total_count,
          data: [
            ...state.providers.data,
            payload.data
          ]
        }
        : payload;

      return {
        ...state,
        providers: newProviders
      };
    }
    case GET_REGION_PROVIDERS_REQUEST_SUCCESS: {
      return {
        ...state,
        regionProviders: payload
      };
    }
    case GET_SERVE_PROVIDERS_REQUEST_SUCCESS: {
      return {
        ...state,
        serveProviders: payload
      };
    }
    case SET_FILTER: {
      return {
        ...state,
        filter: {
          ...state.filter,
          ...payload
        }
      };
    }
    case GET_PROVIDER_DETAIL_SUCCESS: {
      const { providerData } = payload;

      const newServeProviders = state.serveProviders.map(p => {
        if (p.provider.id === providerData.provider.id
          && p.practice.id === providerData.practice.id
        ) {
          return providerData;
        }
        return p;
      });

      return {
        ...state,
        serveProviders: newServeProviders
      };
    }
    case ADD_SERVE_PROVIDER_REQUEST: {
      return {
        ...state,
        serveProviders: [...state.serveProviders, payload.provider]
      };
    }
    case DELETE_SERVE_PROVIDER_REQUEST: {
      const { provider: newProvider } = payload;
      const newServeProviders = state.serveProviders.filter(p => {
        if (p.provider.id !== newProvider.provider.id
          && p.practice.id !== newProvider.practice.id
        ) {
          return true;
        }
        return false;
      });

      return {
        ...state,
        serveProviders: newServeProviders
      };
    }
    default:
      return state;
  }
}
