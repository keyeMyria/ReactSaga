// @flow

const auth = {
  user: null,
  insurances: [],
  loggedUsers: [],
  device_token: null,
  recentSearches: [],
  lastVisited: null,
};

const provider = {
  data: null,
  providers: { data: [] },
  regionProviders: [],
  serveProviders: [],
  filter: {
    sortBy: 'closest'
  },
  page: 1,
  usProviders: []
};

const patient = {
  data: null,
  activePatient: {},
  patients: [],
  cardData: [],
  paymentHistory: [],
  activeCard: [],
  primaryCareDoctors: null
};

const appointment = {
  appointments: [],
  providers: [],
  appointment: {
    appointment_to_practices: []
  },
  appointmentTime: null,
  isFirstAvailable: true
};

const location = {
  data: null,
  region: {
    latitude: 38.138147150712115,
    longitude: -95.7154973139652,
  },
  geoRegion: null,
  geoData: [],
};

const insurance = {
  insurances: [],
  specialties: {},
  selfPaying: {}
};

const activity = {
  activities: [],
  activity: null
};

const search = {
  searchText: '',
  searchLocation: {},
  searchedProviders: {
    count: 0,
    total: 0,
    results: []
  },
  searchedPlaces: [],
};

const setting = {
  userInfo: null,
  smsFlag: false,
  referralCodeInfo: null,
  referralHistory: [],
};

export const defaultReducers = {
  auth,
  provider,
  patient,
  appointment,
  location,
  insurance,
  activity,
  search,
  setting
};
