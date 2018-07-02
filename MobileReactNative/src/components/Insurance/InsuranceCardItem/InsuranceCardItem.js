// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import I18n from 'react-native-i18n';
import { TINT, TEXT, WHITE, DARK_GRAY } from 'AppColors';
import { SFRegular, SFMedium } from 'AppFonts';
import { find } from 'lodash';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    backgroundColor: WHITE,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    fontSize: 18,
    color: TEXT
  },
  label: {
    fontSize: 14,
    color: TEXT,
  },
  content: {
    fontSize: 14,
    color: TEXT
  },
  row: {
    flexDirection: 'row',
    marginTop: 3,
  }
});

export function InsuranceCardItem({
  dataSource,
  insurances,
  onClick,
  onRemove
}) {
  const insuranceData = dataSource || {};
  const selectedInsurance = find(insurances, { id: insuranceData.insurance_provider_id });
  const plans = selectedInsurance ? selectedInsurance.insurance_plans : [];
  const plan = find(plans, { id: insuranceData.insurance_plan_id });

  const insuranceText = selectedInsurance && plan
    ? `${selectedInsurance.name}/${plan.name}`
    : insuranceData.medicaid
      ? I18n.t('medicaid')
      : insuranceData.medicare
        ? I18n.t('medicare')
        : insuranceData.self_pay
          ? I18n.t('iAmSelfPaying')
          : I18n.t('none');

  const splits = insuranceText.split('/');
  const insuranceName = splits[0];
  const planNames = [];
  let planName = splits[1];
  if (splits.length > 2) {
    for (let i = 1; i < splits.length; i++) {
      planNames.push(splits[i]);
    }
    planName = planNames.join('/');
  }

  return (
    <TouchableOpacity onPress={() => onClick(dataSource)} style={styles.container}>
      <View style={{ paddingRight: 10 }}>
        {insuranceName &&
          <SFMedium style={styles.name}>{insuranceName}</SFMedium>
        }
        {planName &&
          <SFMedium style={[styles.name, { fontSize: 12, color: DARK_GRAY }]}>
            {planName}
          </SFMedium>
        }
        <View style={styles.row}>
          <SFRegular style={styles.label}>{`${I18n.t('groupId')} : `}</SFRegular>
          <SFRegular style={styles.content}>
            {insuranceData.group_id ? insuranceData.group_id : '-'}
          </SFRegular>
        </View>
        <View style={styles.row}>
          <SFRegular style={styles.label}>{`${I18n.t('subscriberId')} : `}</SFRegular>
          <SFRegular style={styles.content}>
            {insuranceData.subscriber_id ? insuranceData.subscriber_id : '-'}
          </SFRegular>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(dataSource)}
        hitSlop={{ left: 5, right: 5, top: 5, bottom: 5 }}
      >
        <MaterialIcon
          style={{ marginRight: 15 }}
          name={'delete'}
          size={20}
          color={TINT}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

InsuranceCardItem.propTypes = {
  dataSource: PropTypes.object.isRequired,
  insurances: PropTypes.array.isRequired,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
};
