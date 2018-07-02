/**
 * @providesModule AppUtilities
 */

export { Logger } from './Logger';
export escapeScreenName from './escapeScreenName';
export { setStatusBarHidden } from './statusbar';
export { overrideLogs } from './global-injector';
export { default as shallowCompare } from './shallowCompare';
export { AlertMessage } from './alert-message';
export { ImageUtils } from './image-utils';
export { Storage, CachedImage } from './storage';
export { dismissKeyboard } from './dismiss-keyboard';
export { formatNumber } from './format-number';
export { formatDate, formatStringToISODate, formatTimeToAPString } from './format-date';
export { promisify } from './promisify';
export { generateShortName, generateFullName } from './generate-shortname';
export { requestCameraAccess } from './camera-permissions';
export { requestContactAccess } from './contact-permissions';
export { getDistance } from './calc-distance';
export { requestLocationAccess } from './location-permission';
export { default as withEmitter, emitter } from './withEmitter';
export { handleNavigationEvent } from './handleNavigationEvent';
export { Geohash } from './geohash-utils';
export { checkInsuranceCard } from './check-insurance';
export { addAnimations } from './addAnimations';
export { makeCancelable } from './make-cancelable';
export { toggle } from './toggle';
export {
  getContacts,
  checkGetContactsPermission,
  requestGetContactsPermission
} from './device-contacts';
export { requestContactsAccess } from './contacts-permission';
