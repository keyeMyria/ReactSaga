// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  TouchableOpacity, Alert
} from 'react-native';
import { compose } from 'recompose';
import {
  Loading,
  SimpleTopNav,
  MarkerInfo,
  Avatar,
  NormalButton,
  AlertMessage
} from 'AppComponents';
import MapView from 'react-native-maps';
import { SFMedium } from 'AppFonts';
import { connectPatient, connectProvider } from 'AppRedux';
import { WINDOW_WIDTH } from 'AppConstants';
import { filter, get } from 'lodash';
import {
  WHITE,
  DARK_GRAY,
  GRAY_ICON,
  PRIMARY_COLOR,
  TEXT,
  TINT
} from 'AppColors';
import { withEmitter, promisify } from 'AppUtilities';
import MetrialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import I18n from 'react-native-i18n';
import StarRating from 'react-native-star-rating';

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  mapView: {
    width: WINDOW_WIDTH,
    height: WINDOW_WIDTH * 0.7
  },
  dataContainer: {
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'center',
    backgroundColor: WHITE,
    marginTop: 40,
    height: 90,
    borderRadius: 8,
    flexDirection: 'row',
  },
  subDataContainer: {
    height: 60,
    marginTop: 8,
    width: 200,
    marginLeft: 20,
  },
  name: {
    color: TEXT,
    fontSize: 14
  },
  row: {
    marginTop: 10,
    flexDirection: 'row'
  },
  subTitle: {
    color: GRAY_ICON,
    fontSize: 12,
    paddingLeft: 5,
    paddingTop: 2
  },
  button: {
    width: WINDOW_WIDTH * 0.75,
    marginHorizontal: 10
  },
  textStyle: {
    fontFamily: 'SFUIText-Bold',
  }
});

@withEmitter('_emitter')
class PrimaryCareDoctorDetailContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isChecking: false
    };
  }

  onSetPrimaryDoctor = (family = 0) => {
    const {
      setPrimaryCareDoctor, selectedProvider, patient, routeBack
    } = this.props;

    this.setState({ isChecking: true });
    promisify(setPrimaryCareDoctor, {
      practice_id: selectedProvider.practice.id,
      provider_id: selectedProvider.provider.id,
      user_id: patient.activePatient.id,
      family
    }).then(() => {
      this.props.getServeProvidersRequest({ user_id: patient.activePatient.id });
      this.setState({ isChecking: false });
    }).catch(error => AlertMessage.fromRequest(error))
      .finally(() => {
        this.setState({ isChecking: false });
        routeBack();
      });
  }

  askPCPForFamilyMember = () => {
    Alert.alert(
      'OpenMed',
      I18n.t('wantToAddPCPForFamily'),
      [
        {
          text: I18n.t('no'),
          onPress: () => this.onSetPrimaryDoctor(0)
        },
        {
          text: I18n.t('yes'),
          onPress: () => this.onSetPrimaryDoctor(1)
        }
      ]
    );
  }

  renderButton = () => {
    const { selectedProvider, patient } = this.props;
    const activeProvider = filter(patient.primaryCareDoctors, p =>
      p.user_id === patient.activePatient.id);

    if (activeProvider.length !== 0) {
      if (activeProvider[0].provider.id === selectedProvider.provider.id) {
        return null;
      }
    }
    return (
      <View style={{ marginTop: 60, alignItems: 'center' }}>
        <NormalButton
          text={I18n.t('setPrimaryCare')}
          style={styles.button}
          textStyle={styles.textStyle}
          pressed={true}
          onPress={() => this.askPCPForFamilyMember()}
          dropShadow={true}
        />
      </View>
    );
  }

  render() {
    const { isChecking } = this.state;
    const { selectedProvider, patient, routeBack } = this.props;
    const initRegion = {
      latitude: selectedProvider.practice.latitude,
      longitude: selectedProvider.practice.longitude,
      latitudeDelta: 0.00322,
      longitudeDelta: 0.00121
    };

    const specialties = get(selectedProvider.provider, 'specialties', []);
    const specialty = specialties.map((data, index) => {
      if (index === 0) {
        return data.name;
      }
      return ` ${data.name}`;
    });

    const reviewDescription = `${selectedProvider.provider.rating_count} ${I18n.t(selectedProvider.provider.rating_count === 1 ? 'review' : 'reviews')}`;

    return (
      <View style={styles.flex}>
        <SimpleTopNav
          onBack={routeBack}
          title={selectedProvider.provider.full_name}
        />
        <MapView
          ref={ref => this.map = ref}
          style={[styles.mapView,
            { height: WINDOW_WIDTH * 0.7 }
          ]}
          region={initRegion}
          showsMyLocationButton={false}
          rotateEnabled={false}
          showsCompass={false}
        >
          <MarkerInfo region={initRegion} text={selectedProvider.practice.full_address} />
        </MapView>
        <View style={styles.dataContainer}>
          <Avatar
            placeholderSize={25}
            size={60}
            source={{ uri: selectedProvider.provider.photo_url }}
            placeholder={{
              first_name: selectedProvider.provider.first_name,
              last_name: selectedProvider.provider.last_name
            }}
          />
          <View style={styles.subDataContainer}>
            <SFMedium style={styles.name}>
              {selectedProvider.provider.full_name}
            </SFMedium>
            <SFMedium style={styles.location}>
              {specialties.length > 0 ? `${specialty} ` : ''}
            </SFMedium>
            <View style={styles.row}>
              <MetrialIcon name={'near-me'} size={18} color={GRAY_ICON} />
              <SFMedium style={styles.subTitle}>
                {selectedProvider.practice.full_address}
              </SFMedium>
            </View>
            <View style={styles.row}>
              <StarRating
                disabled
                rating={Number(selectedProvider.provider.rating)}
                maxStars={5}
                starSize={13}
                emptyStar={'ios-star-outline'}
                fullStar={'ios-star'}
                halfStar={'ios-star-half'}
                iconSet={'Ionicons'}
                starColor={'#F2AD24'}
                halfStarEnable
              />
              <SFMedium style={[styles.subTitle, { paddingTop: 0 }]}>
                {reviewDescription}
              </SFMedium>
            </View>
          </View>
          <View style={styles.arrowView}>
            <TouchableOpacity>
              <FontAwesome
                name={selectedProvider.is_favorite ? 'heart' : 'heart-o'}
                size={20}
                color={TINT}
              />
            </TouchableOpacity>
          </View>
        </View>
        {this.renderButton()}
        {isChecking && <Loading />}
      </View>
    );
  }
}

PrimaryCareDoctorDetailContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  selectedProvider: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  setPrimaryCareDoctor: PropTypes.func.isRequired,
  getServeProvidersRequest: PropTypes.func.isRequired,
};

export default compose(
  connectPatient(),
  connectProvider()
)(PrimaryCareDoctorDetailContainer);
