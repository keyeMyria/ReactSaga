// @flow

import React, { PureComponent } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  WHITE,
  PRIMARY_COLOR,
  TEXT,
  GRAY_ICON,
  PURPLISH_GREY,
  BORDER_COLOR,
} from 'AppColors';
import { SFRegular } from 'AppFonts';
import { uniq, map } from 'lodash';
import MetrialIcon from 'react-native-vector-icons/MaterialIcons';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/Ionicons';
import { Avatar } from 'AppComponents';
import { getDistance } from 'AppUtilities';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from 'AppConstants';
import * as Progress from 'react-native-progress';
import I18n from 'react-native-i18n';


const styles = StyleSheet.create({
  dataContainer: {
    marginHorizontal: 10,
    marginTop: 15,
    borderRadius: 8,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    height: WINDOW_HEIGHT * 0.13
  },
  background: {
    position: 'absolute',
    backgroundColor: WHITE,
    left: 0,
    right: 0,
    top: 10,
    bottom: 0,
    zIndex: -1,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8
  },
  subDataContainer: {
    flexDirection: 'column',
    width: WINDOW_WIDTH * 0.65,
    marginHorizontal: 10,
    marginTop: 15,
  },
  name: {
    color: TEXT,
    fontSize: 14
  },
  row: {
    marginTop: 5,
    flexDirection: 'row'
  },
  arrowView: {
    height: 90,
    justifyContent: 'center',
    marginRight: 10,
    width: WINDOW_WIDTH * 0.5
  },
  subTitle: {
    color: GRAY_ICON,
    fontSize: 12,
    paddingLeft: 5,
    paddingTop: 2
  }
});


export class PrimaryCareDoctorList extends PureComponent {
  render() {
    const { provider, onProviderSelect } = this.props;
    const reviewDescription = `${provider.provider.rating_count} ${I18n.t(provider.provider.rating_count === 1 ? 'review' : 'reviews')}`;
    return (
      <TouchableOpacity onPress={() => { onProviderSelect(provider); }} >
        <View style={styles.dataContainer}>
          <View style={styles.background} />
          <View style={{ width: 60, borderRadius: 30, marginLeft: 10 }}>
            <Avatar
              placeholderSize={25}
              size={60}
              source={{ uri: provider.provider.photo_url }}
              placeholder={{
                first_name: provider.provider.first_name,
                last_name: provider.provider.last_name
              }}
            />
          </View>
          <View style={styles.subDataContainer}>
            <SFRegular style={styles.name}>
              {provider.provider.full_name}
            </SFRegular>
            <View style={styles.row}>
              <MetrialIcon name={'near-me'} size={18} color={GRAY_ICON} />
              <SFRegular style={styles.location}>
                {this.props.region
                  ? getDistance(provider.practice, this.props.region)
                  : ''}
                {provider.provider.specialties[0].name}
              </SFRegular>
            </View>
            <View style={styles.row}>
              <StarRating
                disabled
                rating={Number(provider.provider.rating)}
                maxStars={5}
                starSize={13}
                emptyStar={'ios-star-outline'}
                fullStar={'ios-star'}
                halfStar={'ios-star-half'}
                iconSet={'Ionicons'}
                starColor={'#F2AD24'}
                halfStarEnable
              />
              <SFRegular style={[styles.subTitle, { paddingTop: 0 }]}>
                {reviewDescription}
              </SFRegular>
            </View>
          </View>
          <View style={styles.arrowView}>
            <Icon name={'ios-arrow-forward'} size={18} style={{ color: PURPLISH_GREY }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

PrimaryCareDoctorList.defaultProps = {
  avatar: null,
  region: null,
  selectedProviders: [],
};
