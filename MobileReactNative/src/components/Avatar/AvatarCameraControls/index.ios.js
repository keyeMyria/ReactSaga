import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { SFRegular } from 'AppFonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WHITE, BLACK } from 'AppColors';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from 'AppConstants';
import LinearGradient from 'react-native-linear-gradient';
import I18n from 'react-native-i18n';

const styles = StyleSheet.create({
  container: {
    height: WINDOW_HEIGHT * 0.4,
    width: WINDOW_WIDTH,
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: BLACK,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    opacity: 0.5
  },
  iconCameraRoll: {
    width: 40,
    height: 33,
    tintColor: WHITE,
  },
  textButton: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 20,
  },
  textSaveButton: {
    color: BLACK,
    fontWeight: 'bold',
    fontSize: 20,
  },
  saveButton: {
    width: WINDOW_WIDTH / 2,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },
  button: {
    width: 80,
    ...Platform.select({
      ios: {
        height: 40,
      },
      android: {
        height: 60,
      }
    }),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  icon: {
    fontSize: 30,
    color: WHITE,
  },
  transparent: {
    opacity: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)'
  },
  outerRing: {
    width: WINDOW_WIDTH / 5,
    height: WINDOW_WIDTH / 5,
    backgroundColor: 'transparent',
    borderRadius: WINDOW_WIDTH / 7,
    borderWidth: 2.5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerButton: {
    width: WINDOW_WIDTH / 6.3,
    height: WINDOW_WIDTH / 6.3,
    borderRadius: WINDOW_WIDTH / 9,
  },
});

export function AvatarCameraControls({
  onCapture,
  routeCameraRoll,
  isReviewMode,
  imageSelectedFromCamera,
  onRetake,
  onDone,
  flashIcon,
  toggleFlash,
  flipPicture,
  flipIcon,
  cameraRollIcon
}) {
  if (isReviewMode) {
    if (imageSelectedFromCamera) {
      return (
        <View style={[styles.container, styles.transparent]} >
          <View style={styles.container} />
          <View >
            <TouchableOpacity onPress={onDone} style={styles.saveButton}>
              <SFRegular style={styles.textSaveButton} fontSize={20}>Save</SFRegular>
            </TouchableOpacity>
          </View>
          <View style={[{ flexDirection: 'row', marginBottom: 20 }]}>
            <View >
              <TouchableOpacity
                style={styles.button}
                onPress={() => routeCameraRoll(isReviewMode)}
              >
                <Image
                  source={require('img/icons/icon_camera_roll.png')}
                  style={styles.iconCameraRoll}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={onRetake} >
              <Image source={require('img/icons/icon_camera.png')} style={styles.iconCameraRoll} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.container, styles.transparent]} >
        <View style={styles.container} />
        <TouchableOpacity onPress={onDone} style={styles.saveButton}>
          <SFRegular style={styles.textSaveButton} fontSize={20}>{I18n.t('save')}</SFRegular>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRetake} style={styles.button}>
          <SFRegular style={styles.textButton} fontSize={20}>{I18n.t('retake')}</SFRegular>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={[styles.container, styles.transparent]} >
      <View style={styles.container} />
      {false &&
        <View style={[{ flexDirection: 'row', marginBottom: 10 }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => routeCameraRoll(isReviewMode)}
          >
            <Icon name={cameraRollIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={flipPicture} style={styles.button}>
            <Icon name={flipIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFlash} style={styles.button}>
            <Icon name={flashIcon} style={styles.icon} />
          </TouchableOpacity>
        </View>
      }
      <TouchableOpacity
        style={[styles.button, styles.outerRing, { marginBottom: 20 }]}
        onPress={onCapture}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF']}
          style={styles.innerButton}
          start={{ x: 0.0, y: 0.5 }}
        />
      </TouchableOpacity>
    </View>
  );
}

AvatarCameraControls.propTypes = {
  routeCameraRoll: PropTypes.func.isRequired,
  onCapture: PropTypes.func.isRequired,
  isReviewMode: PropTypes.bool,
  imageSelectedFromCamera: PropTypes.bool,
  onDone: PropTypes.func.isRequired,
  onRetake: PropTypes.func.isRequired,
  flashIcon: PropTypes.string.isRequired,
  toggleFlash: PropTypes.func.isRequired,
  flipIcon: PropTypes.string.isRequired,
  cameraRollIcon: PropTypes.string.isRequired,
  flipPicture: PropTypes.func.isRequired,
};

AvatarCameraControls.defaultProps = {
  isReviewMode: false,
  imageSelectedFromCamera: false,
};
