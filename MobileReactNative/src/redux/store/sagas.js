// @flow

import { fork, all } from 'redux-saga/effects';
import {
  authSaga,
  locationSaga,
  activitySaga,
  insuranceSaga,
  patientSaga,
  providerSaga,
  appointmentSaga,
  searchSaga,
  settingSaga
} from '../modules';

type Saga = Iterable<*>;

export default function* rootSaga(): Saga {
  yield all([
    fork(authSaga),
    fork(locationSaga),
    fork(activitySaga),
    fork(insuranceSaga),
    fork(patientSaga),
    fork(providerSaga),
    fork(appointmentSaga),
    fork(searchSaga),
    fork(settingSaga)
  ]);
}
