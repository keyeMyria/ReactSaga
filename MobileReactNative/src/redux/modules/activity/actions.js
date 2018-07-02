// @flow

import { createAction } from 'redux-actions';
import { createPromiseAction } from '../utils';

/**
 * Action Types
 */

export const GET_ACTIVITIES = 'activity/GET_ACTIVITIES';
export const GET_ACTIVITIES_SUCCESS = 'activity/GET_ACTIVITIES_SUCCESS';
export const READ_ACTIVITY = 'activity/READ_ACTIVITY';
export const READ_ACTIVITY_SUCCESS = 'activity/READ_ACTIVITY_SUCCESS';

/**
 * Action Creators
 */
export const activityActionCreators = {
  getActivities: createAction(GET_ACTIVITIES),
  getActivitiesSuccess: createAction(GET_ACTIVITIES_SUCCESS),
  readActivity: createAction(READ_ACTIVITY),
  readActivitySuccess: createAction(READ_ACTIVITY_SUCCESS)
};
