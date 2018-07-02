// @flow

import {
  LOGOUT
} from '../modules/sharedActions';

import {
  resetReducer,
  auth,
  location,
  activity,
  insurance,
  patient,
  provider,
  appointment,
  search,
  setting
} from '../modules';

import { combineReducers } from 'redux';

const appReducer = combineReducers({
  auth,
  location,
  activity,
  insurance,
  patient,
  provider,
  appointment,
  search,
  setting
});

export default function rootReducer(state, action) {
  let finalState = appReducer(state, action);

  if (action.type === LOGOUT) {
    finalState = resetReducer(finalState, action);
  }

  return finalState;
}
