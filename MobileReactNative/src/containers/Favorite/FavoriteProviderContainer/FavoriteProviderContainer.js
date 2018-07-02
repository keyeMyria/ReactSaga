// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  VirtualizedList
} from 'react-native';
import { compose } from 'recompose';
import {
  connectProvider,
  connectAuth,
  connectAppointment,
  connectPatient,
  connectInsurance
} from 'AppRedux';
import { dismissKeyboard, promisify, AlertMessage } from 'AppUtilities';
import I18n from 'react-native-i18n';
import {
  NormalButton,
  Loading,
  ProviderListTopNav,
  PatientListModal,
  MarkerInfo,
  Avatar
} from 'AppComponents';
import {
  TEXT,
  WHITE,
  DARK_GRAY,
  PRIMARY_COLOR,
  LINE,
  TINT,
  BORDER,
  GRAY_ICON
} from 'AppColors';
import _ from 'lodash';
import { WINDOW_WIDTH } from 'AppConstants';
import MapView from 'react-native-maps';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SFMedium, SFRegular } from 'AppFonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StarRating from 'react-native-star-rating';

const AVATAR_SIZE = 60;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row'
  },
  flex: {
    flex: 1
  },
  mapView: {
    width: WINDOW_WIDTH,
    height: WINDOW_WIDTH * 0.7
  },
  name: {
    color: TEXT,
    fontSize: 16,
    maxWidth: WINDOW_WIDTH - 150
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20
  },
  header: {
    marginLeft: 10
  },
  specialty: {
    width: WINDOW_WIDTH - 120,
    flexDirection: 'row',
    marginTop: 5
  },
  location: {
    fontSize: 12,
    color: LINE,
    alignSelf: 'flex-end',
    marginLeft: 5
  },
  review: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  reviewCount: {
    fontSize: 11,
    color: TEXT,
    alignSelf: 'center',
    marginLeft: 5
  },
  timeBlock: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    width: 70,
    height: 60,
    marginLeft: 5,
    marginRight: 5
  },
  textHour: {
    color: TINT,
    fontSize: 11
  },
  textDay: {
    color: TEXT,
    marginTop: 5,
    fontSize: 11
  },
  buttonContainer: {
    paddingTop: 10,
    paddingBottom: 30,
    alignItems: 'center'
  },
  requestButton: {
    width: WINDOW_WIDTH * 0.6,
  },
  requestButtonLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14,
    color: WHITE
  },
  timeLabel: {
    fontSize: 14,
    color: TEXT,
    marginBottom: 10
  },
  slotsContainer: {
    alignItems: 'center',
    marginBottom: 15
  },
  pickLabel: {
    fontSize: 14
  },
  directSlots: {
    paddingVertical: 10
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

export class FavoriteProviderContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isNavBarExpanded: false,
      isChecking: false
    };
  }

  expandNavBar = () => {
    const { isNavBarExpanded } = this.state;
    this.setState({ isNavBarExpanded: !isNavBarExpanded });

    if (isNavBarExpanded) {
      this.patientListModal.hide();
    } else {
      dismissKeyboard();
      this.patientListModal.show();
    }
  };

  onAddPatient = () => {
    this.expandNavBar();

    this.props.routeScene('AddProfileScene', null, {
      title: I18n.t('addMember'),
      backButtonTitle: '',
      navigatorStyle: {
        navBarHidden: false,
        tabBarHidden: false,
        navBarBackgroundColor: WHITE,
        navBarTextColor: DARK_GRAY,
        navBarButtonColor: PRIMARY_COLOR,
      },
      overrideBackPress: true
    });
  };

  onPatientSelected = (item) => {
    const { patient, setCurrentPatient } = this.props;
    const { activePatient } = patient;

    if (activePatient.id === item.id) {
      return;
    }

    setCurrentPatient(item);
    this.expandNavBar();
  };

  handlePressFilterButton = () => {
    const { showLightBox, routeBack, dismissLightBox } = this.props;

    showLightBox('ProviderFilterDialog',
      {
        onStartOver: () => {
          dismissLightBox();
          setTimeout(() => {
            routeBack();
          }, 500);
        }
      },
      { backgroundColor: 'rgba(0, 0, 0, 0.3)',
        tapBackgroundToDismiss: true,
        animationIn: 'slideLeftIn',
        animationOut: 'slideRightOut',
      });
  };

  onAddFavorite = (provider, existence = false) => {
    const { activePatient } = this.props.patient;
    const { addServeProviderRequest } = this.props;

    if (activePatient) {
      const data = {
        user_id: activePatient.id,
        practice_id: provider.practice.id,
        provider_id: provider.id
      };

      if (existence) {
        data.is_existing = true;
      }

      this.setState({ isChecking: true });
      promisify(addServeProviderRequest, data)
        .then(() => {
        })
        .catch((e) => AlertMessage.fromRequest(e))
        .finally(() => this.setState({ isChecking: false }));
    }
  };

  onDeleteFavorite = (serveProvider) => {
    const { deleteServeProviderRequest } = this.props;
    const { activePatient } = this.props.patient;

    Alert.alert('OpenMed', I18n.t('areYouSureYouWantToRemoveFavorite'),
      [
        { text: I18n.t('no'), onPress: () => { } },
        {
          text: I18n.t('yes'),
          onPress: () => {
            this.setState({ isChecking: true });

            if (activePatient) {
              const data = {
                user_id: activePatient.id,
                practice_id: serveProvider.practice.id,
                provider_id: serveProvider.id
              };

              this.setState({ isChecking: true });
              promisify(deleteServeProviderRequest, data)
                .then(() => {})
                .catch((e) => AlertMessage.fromRequest(e))
                .finally(() => this.setState({ isChecking: false }));
            }
          }
        }
      ]
    );
  };

  checkFavorite = (provider) => {
    const { serveProviders } = this.props.provider;

    return _.find(serveProviders, serveProvider =>
      serveProvider.provider.id === provider.id &&
      serveProvider.practice.id === provider.practice.id
    );
  };

  hasInsuranceDetails = () => {
    const { activePatient } = this.props.patient;
    const { insurances: patientInsurances } = activePatient;
    const { insurances } = this.props.insurance;

    if (patientInsurances) {
      const validInsurances = patientInsurances.filter(insurance => {
        const insuranceData = insurance || {};
        const selectedInsurance = _.find(insurances, { id: insuranceData.insurance_provider_id });
        const plans = selectedInsurance ? selectedInsurance.insurance_plans : [];
        const plan = _.find(plans, { id: insuranceData.insurance_plan_id });

        return (selectedInsurance && plan)
          || insuranceData.medicaid
          || insuranceData.medicare
          || insuranceData.self_pay;
      });

      if (validInsurances.length > 0) {
        return true;
      }
    }

    return false;
  };

  hasActivityInMonth = () => {
    const { activePatient } = this.props.patient;

    const currentDate = moment(new Date());
    let lastUpdatedAt = activePatient.last_appointment_at ? activePatient.last_appointment_at : 0;

    // calculate days passed from the last updated date of insurance details
    activePatient.insurances.map(ins => {
      lastUpdatedAt = ins.updated_at && ins.updated_at > lastUpdatedAt
        ? ins.updated_at
        : lastUpdatedAt;
      return ins;
    });

    // calculate different time as days
    const lastUpdatedDate = moment.unix(lastUpdatedAt);
    const duration = moment.duration(currentDate.diff(lastUpdatedDate));
    const passedDays = duration.asDays();

    return passedDays <= 31;
  };

  makeAppointment = (provider, practice, slot) => {
    const {
      switchTab,
      auth,
      resetAppointment,
      showLightBox,
      routeScene,
      patient
    } = this.props;

    if (!auth.user) {
      switchTab(3, true);
    } else if (!this.hasInsuranceDetails()) {
      Alert.alert(
        'OpenMed',
        I18n.t('inputInsuranceCardDetails'),
        [
          {
            text: I18n.t('ok'),
            onPress: () => {
              routeScene('EditInsuranceScene',
                {
                  patientInsurance: patient.activePatient.insurances[0],
                  mode: 2
                },
                {
                  navigatorStyle: {
                    navBarHidden: true,
                    tabBarHidden: false
                  }
                });
            }
          }
        ]
      );
    } else if (!this.hasActivityInMonth()) {
      const { insurance } = this.props;
      const { activePatient } = patient;
      const { insurances } = insurance;

      const insuranceData = activePatient.insurances[0];
      const selectedInsurance = _.find(insurances, { id: insuranceData.insurance_provider_id });
      const plans = selectedInsurance ? selectedInsurance.insurance_plans : [];
      const plan = _.find(plans, { id: insuranceData.insurance_plan_id });

      /*eslint-disable*/
      const alertMessage = selectedInsurance && plan
        ? I18n.t('hasInsuranceChanged', { insurance: selectedInsurance.name, insurance_plan: plan.name, member_id: insuranceData.group_id ? insuranceData.group_id : '-', subscriber_id: insuranceData.subscriber_id ? insuranceData.subscriber_id : '-' })
        : insuranceData.medicaid
          ? I18n.t('hasInsuranceMedicareChanged', { insurance: I18n.t('medicaid'), member_id: insuranceData.group_id ? insuranceData.group_id : '-', subscriber_id: insuranceData.subscriber_id ? insuranceData.subscriber_id : '-' })
          : insuranceData.medicare
            ? I18n.t('hasInsuranceMedicareChanged', { insurance: I18n.t('medicare'), member_id: insuranceData.group_id ? insuranceData.group_id : '-', subscriber_id: insuranceData.subscriber_id ? insuranceData.subscriber_id : '-' })
            : I18n.t('hasInsuranceSelfPayingChanged');
      /*eslint-disable*/

      Alert.alert(
        'OpenMed',
        alertMessage,
        [
          {
            text: activePatient.insurances.length > 1 ? I18n.t('seeAll') : I18n.t('no'),
            onPress: () => switchTab(3)
          },
          {
            text: I18n.t('yes'),
            onPress: () => {
              const bookingDetail = {
                time: slot ? slot.datetime : undefined,
                providers: [provider]
              };

              resetAppointment(bookingDetail);

              if (slot) { // direct booking
                this.requestDirectBooking(bookingDetail);
              } else {
                showLightBox('ConfirmTimeDialog',
                  { onChangeTime: this.onChanageTime, onFirstAvailable: this.onFirstAvailable },
                  { backgroundBlur: 'light',
                    backgroundColor: 'transparent',
                    tapBackgroundToDismiss: true
                  });
              }
            }
          }
        ]
      );
    } else {
      const bookingDetail = {
        time: slot ? slot.datetime : undefined,
        providers: [provider]
      };

      resetAppointment(bookingDetail);

      if (slot) { // direct booking
        this.requestDirectBooking(bookingDetail);
      } else {
        showLightBox('ConfirmTimeDialog',
          { onChangeTime: this.onChanageTime, onFirstAvailable: this.onFirstAvailable },
          { backgroundBlur: 'light',
            backgroundColor: 'transparent',
            tapBackgroundToDismiss: true
          });
      }
    }
  };

  requestDirectBooking = (bookingDetail) => {
    const { createAppointment, routeScene, setLastVisited } = this.props;
    const { providers, time: appointmentTime } = bookingDetail;
    const { filter } = this.props.provider;
    const { activePatient } = this.props.patient;

    const appointmentToPractices = providers.map(provider => {
      return { provider_id: provider.id, practice_id: provider.pratice.id };
    });
    let specialtyId = filter.specialtyId;
    if (!specialtyId) {
      const providersSpecialties = _.map(providers, 'specialties');
      const specialties = _.intersectionBy(...providersSpecialties, 'id');
      specialtyId = specialties.length
        ? specialties[0].id
        : this.props.insurance.specialties.popular_specialties[0].id;
    }
    const appointment = {
      reason: this.state.note || ' ',
      user_id: activePatient.id,
      appointment_to_practices: appointmentToPractices,
      specialty_id: specialtyId,
      is_direct_booking: true
    };
    if (appointmentTime) {
      appointment.desired_time = appointmentTime;
    }

    this.setState({ isChecking: true });

    promisify(createAppointment, { appointment })
      .then(() => {
        setLastVisited({ lastVisited: moment().unix() });

        routeScene('ConfirmDialog', null, {
          navigatorStyle: {
            navBarHidden: true,
            tabBarHidden: false
          }
        });
      })
      .catch(error => {
        if (error.number) {
          this.showError(error.message, error.number);
        } else {
          AlertMessage.fromRequest(error);
        }
      })
      .finally(() => this.setState({ isChecking: false }));
  };

  onChanageTime = () => {
    const { dismissLightBox, showLightBox } = this.props;

    dismissLightBox();
    setTimeout(() => {
      showLightBox('SelectTimeDialog', { onConfirmTimeRequest: this.onConfirmTimeRequest }, {
        backgroundBlur: 'light',
        backgroundColor: 'transparent',
        tapBackgroundToDismiss: true
      });
    }, 500);
  };

  showError = (error, code) => {
    const { resendEmail, resendPhone, patient } = this.props;

    if (code === 1004) {
      Alert.alert(
        'OpenMed',
        I18n.t(`error_${code}`),
        [
          {
            text: I18n.t('resendEmail'),
            onPress: () => {
              resendEmail({ user_id: patient.activePatient.id, type: 0 });
              Alert.alert('OpenMed', I18n.t('pleaseConfirmEmail'));
            }
          },
          { text: I18n.t('cancel') }
        ]
      );
    } else if (code === 1005) {
      Alert.alert(
        'OpenMed',
        I18n.t(`error_${code}`),
        [
          {
            text: I18n.t('resendSms'),
            onPress: () => {
              resendPhone({ user_id: patient.activePatient.id, type: 1 });
              Alert.alert('OpenMed', I18n.t('pleaseConfirmSms'));
            }
          },
          { text: I18n.t('cancel') }
        ]
      );
    } else {
      Alert.alert(
        'OpenMed',
        error
      );
    }
  };

  sendAppointmentRequest = (directBooking) => {
    const { createAppointment, routeScene, setLastVisited } = this.props;
    const { providers, appointmentTime } = this.props.appointment;
    const { filter } = this.props.provider;
    const { activePatient } = this.props.patient;

    const appointmentToPractices = providers.map(provider => {
      return { provider_id: provider.id, practice_id: provider.practice.id };
    });
    let specialtyId = filter.specialtyId;
    if (!specialtyId) {
      const providersSpecialties = _.map(providers, 'specialties');
      const specialties = _.intersectionBy(...providersSpecialties, 'id');
      specialtyId = specialties.length
        ? specialties[0].id
        : this.props.insurance.specialties.popular_specialties[0].id;
    }
    const appointment = {
      specialty_id: specialtyId,
      appointment_to_practices: appointmentToPractices,
      reason: this.state.note || ' ',
      user_id: activePatient.id
    };
    if (appointmentTime) {
      appointment.desired_time = appointmentTime;
    }

    this.setState({ isChecking: true });

    promisify(createAppointment, { appointment })
      .then(() => {
        setLastVisited({ lastVisited: moment().unix() });

        routeScene('ConfirmDialog', directBooking, {
          navigatorStyle: {
            navBarHidden: true,
            tabBarHidden: false
          }
        });
      })
      .catch(error => {
        if (error.number) {
          this.showError(error.message, error.number);
        } else {
          AlertMessage.fromRequest(error);
        }
      })
      .finally(() => this.setState({ isChecking: false }));
  };

  onFirstAvailable = () => {
    const { dismissLightBox } = this.props;
    dismissLightBox();

    setTimeout(() => {
      this.sendAppointmentRequest(null);
    }, 500);
  };

  onConfirmTimeRequest = () => {
    const { dismissLightBox } = this.props;
    dismissLightBox();

    setTimeout(() => {
      this.sendAppointmentRequest(null);
    }, 500);
  };

  renderSlots = (directSlots) => {
    const { selectedProvider } = this.props;

    return (
      <View>
        <View style={styles.slotsContainer}>
          <SFMedium allowFontScaling={false} style={styles.pickLabel}>
            {I18n.t('pickATime')}
          </SFMedium>
          <VirtualizedList
            style={[styles.directSlots,
              { width: directSlots.length * 80 > WINDOW_WIDTH
                ? WINDOW_WIDTH
                : directSlots.length * 80 }
              ]}
            initialNumberToRender={10}
            keyExtractor={(item, index) => `#${index}`}
            data={directSlots}
            getItem={(data, index) => data[index]}
            getItemCount={(data) => data.length}
            horizontal
            contentContainerStyle={{ flexGrow: 1, overflow: 'hidden' }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={directSlots.length * 80 > WINDOW_WIDTH}
            bounces={false}
            automaticallyAdjustContentInsets={false}
            removeClippedSubviews={false}
            enableEmptySections
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    this.makeAppointment(selectedProvider, selectedProvider.practice, item)}
                  style={styles.timeBlock}
                >
                  <SFMedium allowFontScaling={false} style={styles.textHour}>
                    {moment.unix(item.datetime).format('hh:mm A')}
                  </SFMedium>
                  <SFMedium allowFontScaling={false} style={styles.textDay}>
                    {moment.unix(item.datetime).format('MM/DD/YY')}
                  </SFMedium>
                </TouchableOpacity>
              );
            }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <SFMedium style={styles.timeLabel}>
            {I18n.t('timesAboveDoNotWork')}
          </SFMedium>
          <NormalButton
            text={I18n.t('requestDifferentTime').toUpperCase()}
            style={styles.requestButton}
            textStyle={styles.requestButtonLabel}
            dropShadow={true}
            pressed={true}
            onPress={() => this.makeAppointment(selectedProvider, selectedProvider.practice)}
          />
        </View>
      </View>
    );
  };

  renderRequestButton = () => {
    const { selectedProvider } = this.props;

    return (
      <View style={styles.buttonContainer}>
        <NormalButton
          text={I18n.t('requestAppointment').toUpperCase()}
          style={styles.requestButton}
          textStyle={styles.requestButtonLabel}
          dropShadow={true}
          pressed={true}
          onPress={() => this.makeAppointment(selectedProvider, selectedProvider.practice)}
        />
      </View>
    );
  };

  renderFavouriteIcon = (serveProvider) => {
    const { selectedProvider } = this.props;

    if (serveProvider) {
      return (
        <TouchableOpacity
          onPress={() => this.onDeleteFavorite(selectedProvider)}
        >
          <FontAwesome name={'heart'} size={20} color={TINT} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => this.checkExistence(selectedProvider)}
      >
        <FontAwesome name={'heart-o'} size={20} color={TINT} />
      </TouchableOpacity>
    );
  };

  checkExistence = (selectedProvider) => {
    Alert.alert('OpenMed', I18n.t('areYouExistingPatient'),
      [
        { text: I18n.t('no'), onPress: () => this.onAddFavorite(selectedProvider) },
        { text: I18n.t('yes'), onPress: () => this.onAddFavorite(selectedProvider, true) }
      ]
    );
  };

  renderAddFavoriteButton = () => {
    const { selectedProvider } = this.props;

    return (
      <View style={styles.buttonContainer}>
        <NormalButton
          text={I18n.t('addToFavorites').toUpperCase()}
          style={styles.requestButton}
          textStyle={styles.requestButtonLabel}
          dropShadow={true}
          pressed={true}
          onPress={() => this.checkExistence(selectedProvider)}
        />
      </View>
    );
  };

  renderButton = () => {
    const { selectedProvider } = this.props;
    const directSlots = selectedProvider.booking_time_intervals || [];

    if (this.checkFavorite(selectedProvider)) {
      if (directSlots.length > 0) {
        return this.renderSlots(directSlots);
      }

      return this.renderRequestButton();
    }

    return this.renderAddFavoriteButton();
  };

  render() {
    const { isNavBarExpanded, isChecking } = this.state;
    const { selectedProvider, patient, routeBack, auth } = this.props;
    const getAvatar = (p) => {
      return p.photo_url
        ? { uri: p.photo_url }
        : null;
    };
    const initRegion = {
      latitude: selectedProvider.practice.latitude,
      longitude: selectedProvider.practice.longitude,
      latitudeDelta: 0.00322,
      longitudeDelta: 0.00121
    };
    const directSlots = selectedProvider.booking_time_intervals || [];
    const serveProvider = this.checkFavorite(selectedProvider);
    const specialty = _.uniq(_.map(selectedProvider.specialties, 'name')).join(', ');

    const reviewAmount = _.get(selectedProvider, 'rating_count', 0);
    // eslint-disable-next-line max-len
    const reviewDescription = `${reviewAmount} ${I18n.t(reviewAmount === 1 ? 'review' : 'reviews')}`;
    const starRating = parseFloat(selectedProvider.rating);

    return (
      <View style={styles.flex}>
        <ProviderListTopNav
          activePatient={patient.activePatient}
          onFilter={this.handlePressFilterButton}
          onBack={routeBack}
          backTitle={this.checkFavorite(selectedProvider) ? I18n.t('done') : I18n.t('cancel')}
          onExpanded={this.expandNavBar}
          isExpanded={isNavBarExpanded}
        />
        <MapView
          ref={ref => this.map = ref}
          style={[styles.mapView,
            { height: directSlots.length > 0 ? WINDOW_WIDTH * 0.4 : WINDOW_WIDTH * 0.7 }
            ]}
          region={initRegion}
          showsMyLocationButton={false}
          rotateEnabled={false}
          showsCompass={false}
        >
          <MarkerInfo region={initRegion} text={selectedProvider.practice.address} />
        </MapView>
        <View style={styles.content}>
          <View style={styles.row}>
            <Avatar
              size={AVATAR_SIZE}
              source={getAvatar(selectedProvider)}
              placeholder={selectedProvider.provider}
              style={styles.avatar}
            />
            <View style={styles.header}>
              <View style={styles.nameContainer}>
                <SFMedium allowFontScaling={false} style={styles.name}>
                  {selectedProvider.full_name}
                </SFMedium>
                {auth.user && this.renderFavouriteIcon(serveProvider)}
              </View>
              <SFRegular style={styles.specialty}>
                {specialty}
              </SFRegular>
              <View style={styles.specialty}>
                <Icon name={'near-me'} size={18} color={GRAY_ICON} />
                <SFRegular style={styles.location}>
                  {[selectedProvider.practice.address,
                    selectedProvider.practice.city,
                    selectedProvider.practice.region,
                    selectedProvider.practice.zip].filter(v => !!v).join(', ')}
                </SFRegular>
              </View>
              {reviewAmount !== 0 &&
                <View style={styles.review}>
                  <StarRating
                    disabled
                    rating={starRating}
                    maxStars={5}
                    starSize={17}
                    emptyStar={'ios-star-outline'}
                    fullStar={'ios-star'}
                    halfStar={'ios-star-half'}
                    iconSet={'Ionicons'}
                    starColor={'#F2AD24'}
                    halfStarEnable
                  />
                  <SFMedium style={styles.reviewCount}>
                    {reviewDescription}
                  </SFMedium>
                </View>
              }
            </View>
          </View>
        </View>
        {this.renderButton()}
        <PatientListModal
          ref={ref => this.patientListModal = ref}
          patients={patient.patients}
          onAddPatient={this.onAddPatient}
          onPatientSelected={this.onPatientSelected}
          onBackgroundClicked={this.expandNavBar}
        />
        {isChecking && <Loading />}
      </View>
    );
  }
}

FavoriteProviderContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  switchTab: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
  selectedProvider: PropTypes.object.isRequired,
  provider: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  appointment: PropTypes.object.isRequired,
  insurance: PropTypes.object.isRequired,
  createAppointment: PropTypes.func.isRequired,
  resetAppointment: PropTypes.func.isRequired,
  getAppointments: PropTypes.func.isRequired,
  addServeProviderRequest: PropTypes.func.isRequired,
  deleteServeProviderRequest: PropTypes.func.isRequired,
  setLastVisited: PropTypes.func.isRequired,
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectAppointment(),
  connectProvider(),
  connectInsurance(),
)(FavoriteProviderContainer);
