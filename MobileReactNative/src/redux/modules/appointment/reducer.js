// @flow

import type { Action } from 'AppTypes';
import {
  CREATE_APPOINTMENT_SUCCESS,
  PROPOSE_NEW_APPOINTMENT_SUCCESS,
  ACCEPT_APPOINTMENT_SUCCESS,
  DECLINE_APPOINTMENT_SUCCESS,
  GET_APPOINTMENTS_SUCCESS,
  SET_APPOINTMENT_TIME,
  RESET_APPOINTMENT,
  SET_PROVIDER,
  SET_PROVIDERS,
  ADD_PROVIDER
} from './actions';
import { defaultReducers } from '../defaultReducers';

const DEFAULT = defaultReducers.appointment;

export default function appointment(state = DEFAULT, action: Action = {}) {
  const { type, payload } = action;

  switch (type) {
    case SET_PROVIDER: {
      return {
        ...state,
        providers: [payload.provider]
      };
    }
    case SET_PROVIDERS: {
      return {
        ...state,
        providers: payload.providers
      };
    }
    case ADD_PROVIDER: {
      return {
        ...state,
        providers: [
          ...state.providers,
          payload.provider
        ]
      };
    }
    case SET_APPOINTMENT_TIME: {
      return {
        ...state,
        appointmentTime: payload.time,
        isFirstAvailable: !payload.time
      };
    }
    case RESET_APPOINTMENT: {
      return {
        ...state,
        appointmentTime: payload.time,
        isFirstAvailable: !payload.time,
        providers: payload.providers || []
      };
    }
    case GET_APPOINTMENTS_SUCCESS: {
      return {
        ...state,
        appointments: payload
      };
    }
    case DECLINE_APPOINTMENT_SUCCESS:
    case ACCEPT_APPOINTMENT_SUCCESS:
    case PROPOSE_NEW_APPOINTMENT_SUCCESS:
    case CREATE_APPOINTMENT_SUCCESS: {
      const newAppointments = state.appointments.map(appt => {
        if (appt.id === payload.id) {
          return {
            ...appt,
            ...payload,
          };
        }
        return appt;
      });

      return {
        ...state,
        appointments: newAppointments,
        appointment: payload
      };
    }
    default:
      return state;
  }
}
