// @flow

import type { Action } from 'AppTypes';
import { uniqBy, flatten, cloneDeep } from 'lodash';

import {
  SETTING_SMS_FLAG_SUCCESS,
  SETTING_USER_INFO_SUCCESS,
  GET_REFERRAL_CODE_SUCCESS,
  GET_REFERRAL_HISTORY_SUCCESS
} from './actions';
import { defaultReducers } from '../defaultReducers';

const DEFAULT = defaultReducers.setting;

export default function setting(state = DEFAULT, action: Action = {}) {
  const { type, payload } = action;

  switch (type) {
    case SETTING_SMS_FLAG_SUCCESS: {
      return {
        ...state,
        smsFlag: payload
      };
    }

    case SETTING_USER_INFO_SUCCESS: {
      return {
        ...state,
        userInfo: payload
      };
    }

    case GET_REFERRAL_CODE_SUCCESS: {
      return {
        ...state,
        referralCodeInfo: payload
      };
    }

    case GET_REFERRAL_HISTORY_SUCCESS: {
      console.log(state.referralHistory);
      console.log(payload);
      let tempArray = cloneDeep(state.referralHistory);
      tempArray = uniqBy(flatten(tempArray.concat(payload.user_friends.rows)), 'id');
      return {
        ...state,
        referralHistory: tempArray,
      };
    }

    default:
      return state;
  }
}
