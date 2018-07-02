// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  FlatList,
  TouchableWithoutFeedback
} from 'react-native';
import {
  DARK_GRAY,
  PRIMARY_COLOR,
  WHITE,
  TINT,
  PATIENTS
} from 'AppColors';
import { STATUSBAR_HEIGHT, NAVBAR_HEIGHT } from 'AppConstants';
import { SFMedium, SFRegular } from 'AppFonts';
import { ImageUtils } from 'AppUtilities';
import I18n from 'react-native-i18n';
import * as Progress from 'react-native-progress';
import { OMImage } from 'AppComponents';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        top: NAVBAR_HEIGHT + STATUSBAR_HEIGHT
      },
      android: {
        top: NAVBAR_HEIGHT
      }
    }),
    bottom: 0,
    zIndex: 30
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  avatarView: {
    width: 50,
    height: 50,
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  scrollView: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: 'white'
  },
  addButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 25,
    borderColor: TINT,
    marginLeft: 10
  },
  buttonText: {
    fontSize: 12,
    color: DARK_GRAY
  },
  patientBlock: {
    alignItems: 'center',
    marginLeft: 10
  },
  patientName: {
    fontSize: 12,
    color: DARK_GRAY,
    marginTop: 5
  }
});

const ANIMATION_DURATION = 200;

export class PatientListModal extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isVisible: false,
      overlayOpacity: new Animated.Value(0),
      topViewPosition: new Animated.Value(-200),
    };
  }

  show = () => {
    this.setState({ isVisible: true });

    Animated.parallel([
      Animated.timing(this.state.overlayOpacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
      }),
      Animated.timing(this.state.topViewPosition, {
        toValue: 0,
        duration: ANIMATION_DURATION,
      }),
    ]).start();
  };

  hide = () => {
    this.setState({ isVisible: true });

    Animated.parallel([
      Animated.timing(this.state.overlayOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
      }),
      Animated.timing(this.state.topViewPosition, {
        toValue: -200,
        duration: ANIMATION_DURATION,
      }),
    ]).start(() => this.setState({ isVisible: false }));
  };

  isShown = () => {
    return this.state.isVisible;
  };

  render() {
    const { patients, onAddPatient, onPatientSelected, onBackgroundClicked } = this.props;
    const { isVisible, overlayOpacity, topViewPosition } = this.state;

    if (!isVisible) {
      return null;
    }

    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onBackgroundClicked}>
          <Animated.View style={[styles.backgroundOverlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.scrollView, { top: topViewPosition }]}>
          <FlatList
            horizontal
            data={patients}
            keyExtractor={item => `#${item.id}`}
            ListHeaderComponent={() => (
              <TouchableOpacity onPress={onAddPatient} style={styles.addButton}>
                <SFMedium allowFontScaling={false} style={styles.buttonText}>
                  {I18n.t('add').toUpperCase()}
                </SFMedium>
              </TouchableOpacity>
            )}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  onPress={() => onPatientSelected(item)}
                  style={styles.patientBlock}
                >
                  <View
                    style={[styles.avatarView,
                      { borderColor: PATIENTS[index % PATIENTS.length] }
                      ]}
                  >
                    <OMImage
                      style={styles.avatar}
                      resizeMode={'cover'}
                      borderRadius={25}
                      indicator={Progress.Circle}
                      indicatorProps={{
                        size: 10,
                        thickness: 0.5,
                        borderWidth: 0,
                        color: PRIMARY_COLOR,
                      }}
                      source={{ uri: item.image_url }}
                      placeholder={ImageUtils.getUnknownImage(item.gender)}
                      threshold={50}
                    />
                  </View>
                  <SFRegular
                    numberOfLines={1}
                    allowFontScaling={false}
                    style={styles.patientName}
                  >
                    {item.first_name}
                  </SFRegular>
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      </View>
    );
  }
}

PatientListModal.propTypes = {
  patients: PropTypes.array.isRequired,
  onAddPatient: PropTypes.func.isRequired,
  onPatientSelected: PropTypes.func.isRequired,
  onBackgroundClicked: PropTypes.func.isRequired,
};
