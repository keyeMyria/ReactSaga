// @flow

import config from 'react-native-config';

const getProfileImage = (
  id,
) => {
  return `${config.API_URL}users/${id}/image`;
};

const getInsuranceCardImage = (
  id,
  token,
  isFront
) => {
  if (isFront) {
    return `${config.API_URL}patients/${id}/insurance-card/front`;
  }
  return `${config.API_URL}patients/${id}/insurance-card/back`;
};

const getUnknownImage = (
  gender
) => {
  if (gender === 1) {
    return require('img/images/person-unknown-female.png');
  }
  return require('img/images/person-unknown-male.png');
};

export const ImageUtils = {
  getProfileImage, getInsuranceCardImage,
  getUnknownImage
};
