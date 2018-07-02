// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, StyleSheet, FlatList } from 'react-native';
import { Avatar, NormalButton, CheckButton } from 'AppComponents';
import StarRating from 'react-native-star-rating';
import {
  TEXT,
  TINT,
  BORDER,
  WHITE,
  LINE,
  BORDER_COLOR,
  GRAY_ICON,
  LIGHT_TINT,
} from 'AppColors';
import _ from 'lodash';
import { getDistance } from 'AppUtilities';
import { WINDOW_WIDTH } from 'AppConstants';
import { SFMedium, SFRegular } from 'AppFonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import I18n from 'react-native-i18n';
import moment from 'moment';
import moment_timezone from 'moment-timezone';

const AVATAR_SIZE = 50;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginTop: 10
  },
  background: {
    position: 'absolute',
    backgroundColor: WHITE,
    left: 10,
    right: 10,
    top: 10,
    bottom: 0,
    zIndex: -1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER_COLOR
  },
  selectedBorder: {
    borderColor: LIGHT_TINT
  },
  name: {
    color: TEXT,
    fontSize: 16,
    marginTop: 10,
    maxWidth: WINDOW_WIDTH - 150
  },
  booking: {
    width: WINDOW_WIDTH - 85,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 55,
    marginBottom: 15,
    marginRight: 15
  },
  bookingTimes: {
    width: WINDOW_WIDTH - 105,
    marginLeft: 20,
    marginRight: 20
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 20,
    marginBottom: 7,
    marginRight: 20
  },
  header: {
    marginTop: 8,
    marginLeft: 10
  },
  specialty: {
    flexDirection: 'row',
    marginTop: 3,
    maxWidth: WINDOW_WIDTH - 120,
    flexWrap: 'nowrap',
  },
  location: {
    fontSize: 12,
    color: LINE,
    alignSelf: 'flex-end',
    marginLeft: 5,
  },
  review: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3
  },
  reviewCount: {
    fontSize: 11,
    color: TEXT,
    alignSelf: 'center',
    marginLeft: 5
  },
  buttonsContainer: {
    width: WINDOW_WIDTH - 110,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  requestButtonLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 10,
    color: TEXT,
    paddingHorizontal: 20
  },
  selectedAddButton: {
    marginRight: 10
  },
  timeBlock: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    width: 70,
    height: 50,
    marginLeft: 5,
    marginRight: 5
  },
  textHour: {
    color: TINT,
    fontSize: 11
  },
  textDay: {
    color: TEXT,
    marginTop: 3,
    fontSize: 11
  },
});

export class ProviderListItem extends PureComponent {

  onSelectProvider = (dataSource) => {
    const { selectedProviders, resetAppointment } = this.props;

    if (!this.isSelected(dataSource)) {
      const newProviders = _.concat(selectedProviders, [dataSource]);
      resetAppointment({ providers: newProviders });
    }
  };

  onRemoveSelectProvider = (dataSource) => {
    const { selectedProviders, resetAppointment } = this.props;

    const newSelectedProviders = _.filter(selectedProviders, selectedProvider =>
      selectedProvider.provider.id !== dataSource.provider.id ||
      selectedProvider.practice.id !== dataSource.practice.id);
    resetAppointment({ providers: newSelectedProviders });
  };

  isSelected = (dataSource) => {
    const { selectedProviders } = this.props;

    return !!_.find(selectedProviders, selectedProvider =>
      selectedProvider.provider.id === dataSource.provider.id &&
      selectedProvider.practice.id === dataSource.practice.id);
  };

  renderAddButton = (isSelected) => {
    const { dataSource } = this.props;

    if (isSelected) {
      return (
        <CheckButton
          onPress={() => this.onRemoveSelectProvider(dataSource)}
          size={34}
          style={styles.selectedAddButton}
        />
      );
    }

    return (
      <CheckButton
        onPress={() => this.onSelectProvider(dataSource)}
        size={34}
        style={styles.selectedAddButton}
        checked={false}
      />
    );
  };

  renderRow = ({ item: slot }) => {
    const { dataSource } = this.props;
    const timezone = _.get(dataSource.practice, 'timezone.code', '');
    const isoString = moment.unix(slot.datetime);

    return (
      <TouchableOpacity
        onPress={() => this.requestAppointment(slot.datetime)}
        style={styles.timeBlock}
      >
        <SFMedium allowFontScaling={false} style={styles.textHour}>
          {moment_timezone(isoString).tz(timezone).format('hh:mm A')}
        </SFMedium>
        <SFMedium allowFontScaling={false} style={styles.textDay}>
          {moment_timezone(isoString).tz(timezone).format('MM/DD/YY')}
        </SFMedium>
      </TouchableOpacity>
    );
  }

  requestAppointment = (directBookingTime = null) => {
    const { dataSource, onShowProvider, onMakeAppointment, onDirectBooking } = this.props;

    let apptTypes = _.get(dataSource.practice, 'appointment_types', []);
    // eslint-disable-next-line
    apptTypes = apptTypes.filter(type => !(type.is_direct_booking && type.booking_time_intervals.length === 0));

    if (directBookingTime) {
      const directBookingTypes = apptTypes.filter(type => type.is_direct_booking);
      if (directBookingTypes.length === 1) { // process direct booking
        onDirectBooking(dataSource, directBookingTime, directBookingTypes[0]);
      } else { // Show provider detail page to select appt type
        onShowProvider(dataSource);
      }
    } else {
      const requestTypes = apptTypes.filter(type => type.is_appointment_request);
      if (apptTypes.length === 0 || requestTypes.length === 1) { // process request appointment
        onMakeAppointment(dataSource);
      } else { // Show provider detail page to select appt type
        onShowProvider(dataSource);
      }
    }
  };

  isRequestAvailable = () => {
    let apptTypes = _.get(this.props.dataSource.practice, 'appointment_types', []);
    // eslint-disable-next-line
    apptTypes = apptTypes.filter(type => !(type.is_direct_booking && type.booking_time_intervals.length === 0));

    const requestAvailable = apptTypes.filter(appt => appt.is_appointment_request);

    // `Consult` by default for non-appt types providers
    if (apptTypes.length === 0) { return true; }

    if (apptTypes.length > 0 && requestAvailable.length <= 0) {
      return false;
    }

    return true;
  }

  render() {
    const {
      dataSource,
      avatar,
      onShowProvider,
      userLocation: region
    } = this.props;

    const specialties = _.get(dataSource.provider, 'specialties', []);
    const specialty = _.uniq(_.map(specialties, 'name')).join(', ');
    const isSelected = this.isSelected(dataSource);

    const apptTypes = _.get(dataSource.practice, 'appointment_types', []);
    const bookingsTimes = apptTypes.reduce((prev, curr) => {
      return prev.concat(curr.booking_time_intervals || []);
    }, []);
    const bookings = _.sortBy(_.uniqBy(bookingsTimes, 'datetime'), 'datetime');

    const reviewAmount = _.get(dataSource.provider, 'rating_count', 0);
    // eslint-disable-next-line max-len
    const reviewDescription = `${reviewAmount} ${I18n.t(reviewAmount === 1 ? 'review' : 'reviews')}`;
    const starRating = parseFloat(dataSource.provider.rating);

    return (
      <View style={styles.container}>
        <TouchableOpacity disabled={isSelected} onPress={() => onShowProvider(dataSource)}>
          <View style={[styles.background, isSelected ? styles.selectedBorder : {}]} />
          <View style={styles.content}>
            <Avatar
              size={AVATAR_SIZE}
              source={avatar}
              placeholder={dataSource.provider}
              placeholderSize={18}
              style={styles.avatar}
            />
            <View style={styles.header}>
              <SFMedium allowFontScaling={false} style={styles.name}>
                {[dataSource.provider.pre_name,
                  dataSource.provider.first_name,
                  dataSource.provider.last_name].filter(v => !!v).join(' ')}
              </SFMedium>
              <View style={styles.specialty}>
                <Icon name={'near-me'} size={18} color={GRAY_ICON} />
                <SFRegular style={styles.location}>
                  {region
                    ? getDistance(dataSource.practice, region)
                    : ''}
                  {specialties.length > 0 ? `, ${specialty}` : ''}
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
              {this.isRequestAvailable() &&
                <View style={styles.buttonsContainer}>
                  <NormalButton
                    text={I18n.t('requestAppointment').toUpperCase()}
                    textStyle={styles.requestButtonLabel}
                    onPress={() => this.requestAppointment()}
                    borderWidth={1}
                    singleColorButton={true}
                  />
                  {this.renderAddButton(isSelected)}
                </View>
              }
            </View>
          </View>
          {bookings.length > 0 &&
            <View style={styles.booking}>
              <FlatList
                style={styles.bookingTimes}
                data={bookings}
                extraData={this.state}
                horizontal={true}
                renderItem={this.renderRow}
                keyExtractor={(slot) => `#$${slot.appointment_type_id}:${slot.datetime}`}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={true}
                bounces={true}
                automaticallyAdjustContentInsets={false}
              />
            </View>
          }
        </TouchableOpacity>
      </View>
    );
  }
}

ProviderListItem.propTypes = {
  dataSource: PropTypes.object.isRequired,
  avatar: PropTypes.any,
  userLocation: PropTypes.object,
  selectedProviders: PropTypes.array,
  onShowProvider: PropTypes.func.isRequired,
  onMakeAppointment: PropTypes.func.isRequired,
  resetAppointment: PropTypes.func.isRequired,
  onDirectBooking: PropTypes.func.isRequired,
};

ProviderListItem.defaultProps = {
  avatar: null,
  practice: {},
  region: null,
  selectedProviders: [],
};
