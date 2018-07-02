// // Rest apis
//
// // Auth
// export const API_AUTH = {
//   BASIC_AUTH: '/oauth/token',
//   LOGIN: '/oauth/token/user',
//   SOCIAL_LOGIN: '/social/facebook',
//   REGISTER: '/patient',
//   FORGOT_PASSWORD: '/user/reset-password',
//   RESET_PASSWORD: '/user/update-password',
//   CHANGE_PASSWORD: '/user/change-password',
//   GET_INSURANCES: '/insurance-providers',
//   GET_SPECIALTIES: '/specialties?with_popular=1',
//   RESEND_EMAIL: 'user-verification/resend-verification-email',
//   RESEND_PHONE: 'user-verification/resend-verification-sms'
// };
//
// // Provider
// export const API_PROVIDER = {
//   GET_PROVIDER: '/provider/',
//   GET_PROVIDERS: '/providers?',
//   GET_REGION_PROVIDERS: '/provider/geo-square-search?',
//   GET_SERVE_PROVIDERS: '/provider-serve-patients',
//   ADD_SERVE_PROVIDER: '/provider-serve-patient',
//   DELETE_SERVE_PROVIDER: '/provider-serve-patient/'
// };
//
// // patient
// const getPatients = (id) => api.get(`/patient/${id}/account-patients?with_insurance=true`)
// const getPatientDetail = (id) => api.get(`patient/${id}?with_insurance=1`)
// const updatePatient = (patient) => api.put(`/patient/${patient.id}?with_insurance=1`, patient)
// const deletePatient = (id) => api.delete(`/patient/${id}`)
//
// // appointment
// const getAppointments = (id, query) => api.get(`patient/${id}/appointments`, query)
// const createAppointment = (appointment) => api.post(`appointment-request`, appointment)
// const proposeNewAppointment = (appointmentId, desiredTime) => api.post(`appointment-to-practice/${appointmentId}/patient-propose-new-conditions`, { desired_time: desiredTime })
// const acceptAppointment = (appointmentId, time) => api.post(`appointment-to-practice/${appointmentId}/patient-accept`, { time })
// const declineAppointment = (appointmentId) => api.post(`appointment-to-practice/${appointmentId}/patient-cancel`)
//
// // activity
// const getActivities = () => api.get(`/activity?time=0&for_whole_account=1`)
// const readActivity = (id) => api.post(`/activity/${id}/read?for_whole_account=1`)
//
// // geo location
// const getGeoIp = () => {
//   const geoApi = apisauce.create({ baseURL: 'http://geoip.nekudo.com/api', headers: { 'Content-Type': 'application/json' }, timeout: 2000 })
//   return geoApi.get('/')
// }
//
// const getGeoCode = (address) => {
//   const geoApi = apisauce.create({ baseURL: 'https://maps.googleapis.com/maps/api', headers: { 'Content-Type': 'application/json' }, timeout: 2000 })
//   return geoApi.get('/geocode/json', { address })
// }
//
//
// // Patient
// export const API_PROVIDER = {
//   GET_PROVIDER: '/provider/',
//   GET_PROVIDERS: '/providers?',
//   GET_REGION_PROVIDERS: '/provider/geo-square-search?',
//   GET_SERVE_PROVIDERS: '/provider-serve-patients',
//   ADD_SERVE_PROVIDER: '/provider-serve-patient',
//   DELETE_SERVE_PROVIDER: '/provider-serve-patient/'
// };
