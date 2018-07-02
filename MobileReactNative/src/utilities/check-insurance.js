export function checkInsuranceCard(insurance) {
  // Check if `I am Self Paying`
  if (insurance.medicaid === null
    && insurance.medicare === null
    && insurance.insurance_plan_id === null
    && insurance.insurance_provider_id === null
    && insurance.selfPaying === true
  ) {
    return true;
  }

  // Check front & back images and ids if user select other than `I am Self Paying`
  if (
    ((insurance.medicaid === true || insurance.medicare === true)
      || (insurance.insurance_plan_id !== null && insurance.insurance_provider_id !== null))
    && (insurance.card_back_url !== null
      && insurance.card_front_url !== null
      && insurance.group_id !== null
      && insurance.subscriber_id !== null)
  ) {
    return true;
  }

  return false;
}
