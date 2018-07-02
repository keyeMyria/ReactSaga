// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, StyleSheet, FlatList } from 'react-native';
import { Avatar, NormalButton } from 'AppComponents';
import {
  TEXT,
  TINT,
  BORDER,
  WHITE,
  LINE,
  BORDER_COLOR,
  GRAY_ICON,
} from 'AppColors';
import _ from 'lodash';
import { getDistance } from 'AppUtilities';
import { WINDOW_WIDTH } from 'AppConstants';
import { SFMedium, SFRegular } from 'AppFonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import I18n from 'react-native-i18n';
import StarRating from 'react-native-star-rating';
import moment_timezone from 'moment-timezone';
import moment from 'moment';

const AVATAR_SIZE = 60;

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
  booking: {
    width: WINDOW_WIDTH - 125,
    marginVertical: 15
  },
  name: {
    color: TEXT,
    fontSize: 16,
    marginTop: 15,
    width: WINDOW_WIDTH - 120
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 20,
    marginBottom: 15,
    marginRight: 20
  },
  header: {
    marginTop: 10,
    marginLeft: 10
  },
  specialty: {
    flexDirection: 'row',
    marginTop: 5
  },
  location: {
    width: WINDOW_WIDTH - 125,
    fontSize: 12,
    color: LINE,
    alignSelf: 'flex-end',
    marginLeft: 5
  },
  requestButton: {
    width: 200
  },
  requestButtonLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 11,
    color: TEXT
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
});

export class FavoriteProviderListItem extends PureComponent {

  requestAppointment = (directBookingTime = null) => {
    const {
      item,
      onShowProvider,
      // onMakeAppointment,
      // onDirectBooking
    } = this.props;
    //
    // let apptTypes = _.get(item.practice, 'appointment_types', []);
    // eslint-disable-next-line
    // apptTypes = apptTypes.filter(type => !(type.is_direct_booking && type.booking_time_intervals.length === 0));
    //
    // if (directBookingTime) {
    //   const directBookingTypes = apptTypes.filter(type => type.is_direct_booking);
    //   if (directBookingTypes.length === 1) { // process direct booking
    //     onDirectBooking(item, directBookingTime, directBookingTypes[0]);
    //   } else { // Show provider detail page to select appt type
    //     onShowProvider(item);
    //   }
    // } else {
    //   const requestTypes = apptTypes.filter(type => type.is_appointment_request);
    //   if (apptTypes.length === 0 || requestTypes.length === 1) { // process request appointment
    //     onMakeAppointment(item);
    //   } else { // Show provider detail page to select appt type
    //     onShowProvider(item);
    //   }
    // }
    onShowProvider(item);
  };

  renderRow = ({ item: slot }) => {
    const { item } = this.props;
    const timezone = _.get(item.practice, 'timezone.code', '');
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

  isRequestAvailable = () => {
    let apptTypes = _.get(this.props.item.practice, 'appointment_types', []);
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
      item,
      avatar,
      onShowProvider,
      region,
    } = this.props;

    const specialties = _.get(item.provider, 'specialties', []);
    const specialty = _.uniq(_.map(specialties, 'name')).join(', ');
    const apptTypes = _.get(item.practice, 'appointment_types', []);
    const bookingsTimes = apptTypes.reduce((prev, curr) => {
      return prev.concat(curr.booking_time_intervals || []);
    }, []);
    const bookings = _.sortBy(_.uniqBy(bookingsTimes, 'datetime'), 'datetime');

    const reviewAmount = _.get(item.provider, 'rating_count', 0);
    // eslint-disable-next-line max-len
    const reviewDescription = `${reviewAmount} ${I18n.t(reviewAmount === 1 ? 'review' : 'reviews')}`;
    const starRating = parseFloat(item.provider.rating);
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => onShowProvider(item)}>
          <View style={styles.background} />
          <View style={styles.content}>
            <Avatar
              size={50}
              source={avatar}
              placeholder={item.provider}
              style={styles.avatar}
            />
            <View style={styles.header}>
              <SFMedium allowFontScaling={false} style={styles.name}>
                {item.provider.full_name}
              </SFMedium>
              <View style={styles.specialty}>
                <Icon name={'near-me'} size={18} color={GRAY_ICON} />
                <SFRegular style={styles.location}>
                  {region
                    ? getDistance(item.practice, region)
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
              {bookings.length > 0 &&
                <FlatList
                  style={styles.booking}
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
              }
              {this.isRequestAvailable() &&
                <NormalButton
                  text={I18n.t('requestAppointment').toUpperCase()}
                  style={[styles.requestButton,
                    { marginTop: bookings.length > 0 ? 0 : 15 }
                  ]}
                  textStyle={styles.requestButtonLabel}
                  onPress={() => this.requestAppointment()}
                  borderWidth={1}
                />
              }
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

FavoriteProviderListItem.propTypes = {
  item: PropTypes.object.isRequired,
  avatar: PropTypes.any,
  region: PropTypes.object,
  selectedProviders: PropTypes.array,
  onShowProvider: PropTypes.func.isRequired,
  onMakeAppointment: PropTypes.func.isRequired,
  onDirectBooking: PropTypes.func.isRequired,
};

FavoriteProviderListItem.defaultProps = {
  avatar: null,
  region: null,
  selectedProviders: [],
};
