// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Alert
} from 'react-native';
import { compose } from 'recompose';
import {
  connectProvider,
  connectPatient,
} from 'AppRedux';
import { promisify, AlertMessage, ImageUtils } from 'AppUtilities';
import I18n from 'react-native-i18n';
import {
  Loading,
  SimpleTopNav,
  NormalButton, OMImage
} from 'AppComponents';
import {
  WHITE, PRIMARY_COLOR, TEXT
} from 'AppColors';
import { SFMedium } from 'AppFonts';
import * as Progress from 'react-native-progress';
import { get } from 'lodash';
import StarRating from 'react-native-star-rating';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE
  },
  avatarView: {
    height: 100,
    width: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 20
  },
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    overflow: 'hidden'
  },
  name: {
    fontSize: 16,
    marginTop: 10,
    color: TEXT,
    alignSelf: 'center'
  },
  review: {
    alignItems: 'center',
    marginTop: 15
  },
  reviewCount: {
    fontSize: 11,
    color: TEXT,
    alignSelf: 'center',
    marginTop: 5
  },
  buttonSave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  buttonSaveLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  },
});

export class ReviewContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      rating: 0,
      isChecking: false
    };
  }

  giveFeedback = () => {
    const { giveFeedBackToProvider, patient, selectedProvider, routeBack } = this.props;
    const { rating } = this.state;

    this.setState({ isChecking: true });

    promisify(giveFeedBackToProvider, {
      rating,
      user_id: patient.activePatient.id,
      provider_id: selectedProvider.id,
      practice_id: selectedProvider.practice.id
    }).then(() => {
      Alert.alert('OpenMed', I18n.t('thanksForFeedback'),
        [
          {
            text: I18n.t('ok'),
            onPress: () => routeBack()
          }
        ]
      );
    })
      .catch((e) => AlertMessage.fromRequest(e))
      .finally(() => this.setState({ isChecking: false }));
  };

  render() {
    const { isChecking, rating } = this.state;
    const { selectedProvider, routeBack } = this.props;

    const name = [
      selectedProvider.pre_name,
      selectedProvider.first_name,
      selectedProvider.middle_name,
      selectedProvider.last_name
    ].filter(v => !!v).join(' ');

    const reviewAmount = get(selectedProvider, 'rating_count', 0);
    // eslint-disable-next-line max-len
    const reviewDescription = `${reviewAmount} ${I18n.t(reviewAmount === 1 ? 'review' : 'reviews')}`;

    return (
      <View style={styles.container}>
        <SimpleTopNav
          onBack={routeBack}
          title={I18n.t('rating')}
        />
        <View style={styles.avatarView}>
          <OMImage
            style={styles.avatar}
            resizeMode={'cover'}
            borderRadius={50}
            indicator={Progress.Circle}
            indicatorProps={{
              size: 10,
              thickness: 0.5,
              borderWidth: 0,
              color: PRIMARY_COLOR,
            }}
            source={{ uri: selectedProvider.photo_url }}
            placeholder={ImageUtils.getUnknownImage(selectedProvider.gender)}
            threshold={50}
          />
        </View>
        <SFMedium style={styles.name}>{name}</SFMedium>
        <View style={styles.review}>
          <StarRating
            disabled={false}
            rating={rating}
            maxStars={5}
            starSize={25}
            emptyStar={'ios-star-outline'}
            fullStar={'ios-star'}
            halfStar={'ios-star-half'}
            iconSet={'Ionicons'}
            starColor={'#F2AD24'}
            halfStarEnable={true}
            selectedStar={r => this.setState({ rating: r })}
          />
          <SFMedium style={styles.reviewCount}>
            {reviewDescription}
          </SFMedium>
        </View>
        {rating !== 0 &&
          <NormalButton
            text={I18n.t('giveFeedback').toUpperCase()}
            style={styles.buttonSave}
            textStyle={styles.buttonSaveLabel}
            pressed={true}
            borderRadius={0}
            onPress={this.giveFeedback}
          />
        }
        {isChecking && <Loading />}
      </View>
    );
  }
}

ReviewContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  selectedProvider: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  provider: PropTypes.object.isRequired,
  giveFeedBackToProvider: PropTypes.func.isRequired,
};

export default compose(
  connectPatient(),
  connectProvider(),
)(ReviewContainer);
