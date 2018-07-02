// @flow

import { createAction } from 'redux-actions';
import { createPromiseAction } from '../utils';

/**
 * Action Types
 */

export const SETTING_SMS_FLAG = 'setting/SETTING_SMS_FLAG';
export const SETTING_SMS_FLAG_SUCCESS = 'setting/SETTING_SMS_FLAG_SUCCESS';
export const SETTING_USER_INFO = 'setting/SETTING_USER_INFO';
export const SETTING_USER_INFO_SUCCESS = 'setting/SETTING_USER_INFO_SUCCESS';
export const GET_REFERRAL_CODE = 'setting/GET_REFERRAL_CODE';
export const GET_REFERRAL_CODE_SUCCESS = 'setting/GET_REFERRAL_CODE_SUCCESS';
export const SET_REFERRAL_CODE = 'setting/SET_REFERRAL_CODE';
export const SET_REDEEM = 'setting/SET_REDEEM';
export const GET_REFERRAL_HISTORY = 'setting/GET_REFERRAL_HISTORY';
export const GET_REFERRAL_HISTORY_SUCCESS = 'setting/GET_REFERRAL_HISTORY_SUCCESS';


/**
 * Action Creators
 */
export const settingActionCreators = {
  settingSmsFlag: createPromiseAction(SETTING_SMS_FLAG),
  settingSmsFlagSuccess: createAction(SETTING_SMS_FLAG_SUCCESS),
  settingUserInfo: createPromiseAction(SETTING_USER_INFO),
  settingUserInfoSuccess: createAction(SETTING_USER_INFO_SUCCESS),
  getReferralCode: createPromiseAction(GET_REFERRAL_CODE),
  getReferralCodeSuceess: createAction(GET_REFERRAL_CODE_SUCCESS),
  setReferralCode: createPromiseAction(SET_REFERRAL_CODE),
  setRedeem: createPromiseAction(SET_REDEEM),
  getReferralHistory: createPromiseAction(GET_REFERRAL_HISTORY),
  getReferralHistorySuccess: createAction(GET_REFERRAL_HISTORY_SUCCESS)
};
