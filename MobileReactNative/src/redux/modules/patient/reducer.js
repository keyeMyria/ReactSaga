// @flow

import type { Action } from 'AppTypes';
import {
  GET_PATIENTS_SUCCESS,
  ADD_PATIENT_SUCCESS,
  UPDATE_PATIENT_SUCCESS,
  SET_CURRENT_PATIENT,
  UPDATE_PATIENT_INSURANCE_SUCCESS,
  ADD_PATIENT_INSURANCE_SUCCESS,
  REMOVE_PATIENT_INSURANCE_SUCCESS,
  ADD_PATIENT_CARD_SUCCESS,
  GET_PATIENT_CARD_SUCCESS,
  GET_PATIENT_PAYMENT_HISTORY_SUCCESS,
  REMOVE_PATIENT_CARD_SUCCESS,
  SET_PATIENT_ACTIVE_CARD_SUCCESS,
  GET_PRIMARY_CARE_DOCTOR_SUCCESS,
  SET_PRIMARY_CARE_DOCTOR_SUCCESS,
  REMOVE_PRIMARY_CARE_DOCTOR_SUCCESS
} from './actions';
import { filter, sortBy, uniqBy, cloneDeep, flatten } from 'lodash';
import { defaultReducers } from '../defaultReducers';

const DEFAULT = defaultReducers.patient;

export default function patient(state = DEFAULT, action: Action = {}) {
  const { type, payload } = action;

  switch (type) {
    case GET_PATIENTS_SUCCESS: {
      return {
        ...state,
        patients: sortBy(payload, 'created_at')
      };
    }
    case ADD_PATIENT_SUCCESS: {
      return {
        ...state,
        activePatient: payload,
        patients: [...state.patients, payload]
      };
    }
    case UPDATE_PATIENT_SUCCESS: {
      const { id } = payload;
      const patients = state.patients.map((p) => {
        if (p.id !== id) {
          return p;
        }
        return payload;
      });

      return {
        ...state,
        activePatient: payload,
        patients
      };
    }
    case SET_CURRENT_PATIENT: {
      return {
        ...state,
        activePatient: payload
      };
    }
    case UPDATE_PATIENT_INSURANCE_SUCCESS: {
      const { patient_id, insurance_id, insuranceData } = payload;

      const patients = state.patients.map((p) => {
        if (p.id === patient_id) {
          const insurances = p.insurances.map((ins) => {
            if (ins.id === insurance_id) {
              return insuranceData;
            }
            return ins;
          });
          return {
            ...p,
            insurances
          };
        }
        return p;
      });

      const activeInsurances = state.activePatient.insurances.map((ins) => {
        if (ins.id === insurance_id) {
          return insuranceData;
        }
        return ins;
      });

      return {
        ...state,
        activePatient: { ...state.activePatient, insurances: activeInsurances },
        patients
      };
    }
    case ADD_PATIENT_INSURANCE_SUCCESS: {
      const { patient_id, insuranceData } = payload;

      const patients = state.patients.map((p) => {
        if (p.id === patient_id) {
          return {
            ...p,
            insurances: [
              ...p.insurances,
              insuranceData
            ]
          };
        }
        return p;
      });

      const insurance = filter(state.activePatient.insurances, (data) => {
        return !data.self_pay;
      });

      let insuranceObject = cloneDeep(insurance);
      insuranceObject = flatten(insuranceObject.concat(insuranceData));

      return {
        ...state,
        activePatient: {
          ...state.activePatient,
          insurances: insuranceObject
        },
        patients
      };
    }
    case REMOVE_PATIENT_INSURANCE_SUCCESS: {
      const { patient_id, insurance_id } = payload;

      const patients = state.patients.map((p) => {
        if (p.id === patient_id) {
          if (p.insurances.length === 1) {
            return {
              ...p,
              insurances: [{
                ...p.insurances[0],
                card_back_url: null,
                card_front_url: null,
                group_id: null,
                insurance_plan_id: null,
                insurance_provider_id: null,
                is_primary: true,
                medicaid: false,
                medicare: false,
                self_pay: true,
                subscriber_id: null
              }]
            };
          }
          return {
            ...p,
            insurances: filter(p.insurances, ins => ins.id !== insurance_id)
          };
        }
        return p;
      });

      if (state.activePatient.insurances.length === 1) {
        return {
          ...state,
          activePatient: {
            ...state.activePatient,
            insurances: [{
              ...state.activePatient.insurances[0],
              card_back_url: null,
              card_front_url: null,
              group_id: null,
              insurance_plan_id: null,
              insurance_provider_id: null,
              is_primary: true,
              medicaid: false,
              medicare: false,
              self_pay: true,
              subscriber_id: null
            }]
          },
          patients
        };
      }

      return {
        ...state,
        activePatient: {
          ...state.activePatient,
          insurances: filter(state.activePatient.insurances, ins => ins.id !== insurance_id)
        },
        patients
      };
    }
    case ADD_PATIENT_CARD_SUCCESS: {
      const activeCard = state.cardData.map((card) => {
        if (card.is_main && payload.cardData.is_main) {
          return {
            ...card,
            is_main: false
          };
        }
        return card;
      });
      activeCard.push(payload.cardData);
      return {
        ...state,
        cardData: activeCard,
        activeCard: payload.cardData
      };
    }
    case GET_PATIENT_CARD_SUCCESS: {
      return {
        ...state,
        cardData: payload.cardData
      };
    }
    case GET_PATIENT_PAYMENT_HISTORY_SUCCESS: {
      return {
        ...state,
        paymentHistory: payload.paymentHistory
      };
    }
    case REMOVE_PATIENT_CARD_SUCCESS: {
      const cardData = filter(state.cardData, ins => ins.id !== payload.card_id);
      const activeCard = cardData.map((card) => {
        return card;
      });
      return {
        ...state,
        cardData,
        activeCard
      };
    }
    case SET_PATIENT_ACTIVE_CARD_SUCCESS: {
      const activeCard = state.cardData.map((card) => {
        if (card.id === payload.card_id) {
          return payload.cardData;
        }
        if (card.is_main) {
          return {
            ...card,
            is_main: false
          };
        }
        return card;
      });

      return {
        ...state,
        cardData: activeCard,
        activeCard: payload.cardData
      };
    }
    case GET_PRIMARY_CARE_DOCTOR_SUCCESS: {
      return {
        ...state,
        primaryCareDoctors: payload.primaryCareDoctors,
      };
    }
    case SET_PRIMARY_CARE_DOCTOR_SUCCESS: {
      let data = [payload.primaryCareDoctors, state.primaryCareDoctors];
      data = uniqBy(data, 'user_id');
      return {
        ...state,
        primaryCareDoctors: data[0]
      };
    }
    case REMOVE_PRIMARY_CARE_DOCTOR_SUCCESS: {
      const primaryCareDoctors = state.primaryCareDoctors.map((data) => {
        if (data.user_id !== payload.payload.user_id) {
          return data;
        }
        return false;
      });
      return {
        ...state,
        primaryCareDoctors
      };
    }
    default:
      return state;
  }
}
