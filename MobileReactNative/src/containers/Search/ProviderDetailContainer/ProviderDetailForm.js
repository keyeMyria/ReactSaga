// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import I18n from 'react-native-i18n';
import { Avatar } from 'AppComponents';
import {
  TEXT,
  LINE,
  TINT,
  GRAY_ICON
} from 'AppColors';
import _ from 'lodash';
import { WINDOW_WIDTH } from 'AppConstants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SFMedium, SFRegular } from 'AppFonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StarRating from 'react-native-star-rating';

const AVATAR_SIZE = 60;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row'
  },
  name: {
    color: TEXT,
    fontSize: 16,
    maxWidth: WINDOW_WIDTH - 150
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    marginTop: 25
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
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

class ProviderDetailForm extends PureComponent {
  checkFavorite = (provider) => {
    const { favoriteProviders } = this.props;

    return _.find(favoriteProviders, serveProvider =>
      serveProvider.provider.id === provider.provider.id &&
      serveProvider.practice.id === provider.practice.id);
  };

  renderFavouriteIcon = (serveProvider) => {
    const { dataSource, onAddFavorite, onDeleteFavorite } = this.props;

    if (serveProvider) {
      return (
        <TouchableOpacity
          onPress={() => onDeleteFavorite(serveProvider)}
        >
          <FontAwesome name={'heart'} size={20} color={TINT} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => onAddFavorite(dataSource)}
      >
        <FontAwesome name={'heart-o'} size={20} color={TINT} />
      </TouchableOpacity>
    );
  };

  render() {
    const { dataSource, isAuthenticated, onGiveFeedback } = this.props;
    const getAvatar = (p) => {
      return p.photo_url
        ? { uri: p.photo_url }
        : null;
    };

    const serveProvider = this.checkFavorite(dataSource);
    const specialty = _.uniq(_.map(dataSource.provider.specialties, 'name')).join(', ');

    const reviewAmount = _.get(dataSource.provider, 'rating_count', 0);
    // eslint-disable-next-line
    const reviewDescription = `${reviewAmount} ${I18n.t(reviewAmount === 1 ? 'review' : 'reviews')}`;

    return (
      <View style={styles.content}>
        <View style={styles.row}>
          <Avatar
            size={AVATAR_SIZE}
            source={getAvatar(dataSource.provider)}
            placeholder={dataSource.provider}
            style={styles.avatar}
          />
          <View style={styles.header}>
            <View style={styles.nameContainer}>
              <SFMedium allowFontScaling={false} style={styles.name}>
                {dataSource.provider.full_name}
              </SFMedium>
              {isAuthenticated && this.renderFavouriteIcon(serveProvider)}
            </View>
            {!_.isEmpty(specialty) &&
              <SFRegular style={styles.specialty}>
                {specialty}
              </SFRegular>
            }
            <View style={styles.specialty}>
              <Icon name={'near-me'} size={18} color={GRAY_ICON} />
              <SFRegular style={styles.location}>
                {dataSource.practice.full_address}
              </SFRegular>
            </View>
            <View style={styles.review}>
              <StarRating
                disabled={false}
                rating={parseFloat(dataSource.provider.rating)}
                maxStars={5}
                starSize={17}
                emptyStar={'ios-star-outline'}
                fullStar={'ios-star'}
                halfStar={'ios-star-half'}
                iconSet={'Ionicons'}
                starColor={'#F2AD24'}
                halfStarEnable={true}
                selectedStar={() => onGiveFeedback(dataSource)}
              />
              <SFMedium style={styles.reviewCount}>
                {reviewDescription}
              </SFMedium>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

ProviderDetailForm.propTypes = {
  dataSource: PropTypes.shape({}).isRequired,
  favoriteProviders: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onAddFavorite: PropTypes.func.isRequired,
  onDeleteFavorite: PropTypes.func.isRequired,
  onGiveFeedback: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default ProviderDetailForm;
