// @flow

import type { Action } from 'AppTypes';
import {
  GET_ACTIVITIES_SUCCESS,
  READ_ACTIVITY_SUCCESS,
  READ_ACTIVITY
} from './actions';
import { defaultReducers } from '../defaultReducers';
import { find } from 'lodash';

const DEFAULT = defaultReducers.activity;

export default function activity(state = DEFAULT, action: Action = {}) {
  const { type, payload } = action;

  switch (type) {
    case GET_ACTIVITIES_SUCCESS: {
      // const confirmedActivity = find(payload, a => {
      //   return !a.is_read || find(a.appointment_to_practices, appointment => {
      //     return appointment.patient_actions.includes('confirm');
      //   });
      // });
      return {
        ...state,
        activities: payload,
        activity: payload && payload.length > 0 ? payload[0] : null
      };
    }
    case READ_ACTIVITY: {
      return {
        ...state,
        activity: null
      };
    }
    case READ_ACTIVITY_SUCCESS: {
      return {
        ...state,
        activity: null
      };
    }
    default:
      return state;
  }
}
