// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  Platform,
  LayoutAnimation,
  TouchableOpacity,
} from 'react-native';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from 'AppConstants';
import { AvatarCameraControls, SimpleViewEditor } from 'AppComponents';
import { WHITE, BLACK } from 'AppColors';
import { toggle } from 'AppUtilities';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { captureRef } from 'react-native-view-shot';
import { RNCamera } from 'react-native-camera';

const MASK_VIEW_HEIGHT = WINDOW_HEIGHT - (WINDOW_WIDTH * 0.63) - (WINDOW_HEIGHT * 0.4);

const cameraFlashModeIcons = {
  [RNCamera.Constants.FlashMode.off]: 'flash-off',
  [RNCamera.Constants.FlashMode.auto]: 'flash-auto',
  [RNCamera.Constants.FlashMode.on]: 'flash-on',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  image: {
    position: 'absolute',
    top: 60,
    left: 0,
    height: WINDOW_WIDTH * 0.63,
    width: WINDOW_WIDTH,
    opacity: 0.7,
  },
  icon: {
    fontSize: 30,
    color: WHITE
  },
  top: {
    height: 30,
    width: WINDOW_WIDTH,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: BLACK,
    opacity: 0.5,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    paddingTop: 30,
    paddingLeft: 20,
    position: 'absolute',
    left: 0,
    top: 0,
    flex: 1,
  },
  cameraContentReview: {
    flex: 1,
  },
  viewEditor: {
    overflow: 'visible'
  },
});

class ScanDocumentContainer extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      cameraOptions: {
        audio: false,
        type: RNCamera.Constants.Type.back,
        flashMode: RNCamera.Constants.FlashMode.auto,
      },
      isReviewMode: false,
      imageSelectedFromCamera: false,
      cameraOpacity: new Animated.Value(1),
      picture: {},
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
    };
  }

  routeBack = () => {
    if (this.state.isReviewMode) {
      this.onRetake();
    } else {
      this.props.routeBack();
    }
  }

  setCameraOptions = (options) => {
    this.setState({
      cameraOptions: {
        ...this.state.cameraOptions,
        ...options
      }
    });
  }

  toggleFlash = () => {
    const flashMode = toggle(this.state.cameraOptions.flashMode, [
      RNCamera.Constants.FlashMode.off,
      RNCamera.Constants.FlashMode.auto,
      RNCamera.Constants.FlashMode.on
    ]);
    this.setCameraOptions({ flashMode });
  }

  flipPicture = () => {
    Animated.sequence([
      Animated.timing(this.state.cameraOpacity, {
        toValue: 0.7,
        duration: 350
      }),
      Animated.timing(this.state.cameraOpacity, {
        toValue: 1,
        duration: 350
      })
    ]).start();

    const type = toggle(this.state.cameraOptions.type, [
      RNCamera.Constants.Type.front,
      RNCamera.Constants.Type.back
    ]);
    this.setCameraOptions({ type });
  }

  renderCameraContent = (isReviewMode) => {
    const {
      cameraOptions,
      picture,
      width,
      height
    } = this.state;

    if (!isReviewMode) {
      return (
        <View style={styles.cameraContentReview}>
          <RNCamera
            ref={cam => this.camera = cam}
            style={styles.container}
            type={cameraOptions.type}
            flashMode={cameraOptions.flashMode}
            ratio={'10:3'}
          />
          <View style={[styles.top, { height: MASK_VIEW_HEIGHT }]} />
          <TouchableOpacity onPress={this.routeBack} style={styles.button}>
            <Icon name="clear" style={styles.icon} />
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View
          style={[styles.image, { opacity: 1, top: MASK_VIEW_HEIGHT }]}
          ref={ref => this.imageWrap = ref}
        >
          <SimpleViewEditor
            imageWidth={width}
            imageHeight={height}
            style={styles.viewEditor}
            imageContainerHeight={WINDOW_WIDTH * 0.63}
            initialOffsetY={-1 * MASK_VIEW_HEIGHT}
            // imageMask={maskVisible && (
            //   <View style={[styles.image, styles.imageAndriod]}>
            //     <Image
            //       source={require('img/images/profile_mask_square.png')}
            //       style={[styles.image, styles.mask, { resizeMode: 'stretch' }]}
            //     />
            //   </View>
            // )}
          >
            <Image
              style={styles.cameraContentReview}
              source={{ uri: picture.uri }}
            />
          </SimpleViewEditor>
        </View>
        <View style={[styles.top, { height: MASK_VIEW_HEIGHT }]} />
        <TouchableOpacity onPress={this.routeBack} style={styles.button}>
          <Icon name="clear" style={styles.icon} />
        </TouchableOpacity>
      </View>
    );
  };

  handlePress = async () => {
    const options = { quality: 1, base64: false, forceUpOrientation: true };
    const data = await this.camera.takePictureAsync(options);

    this.setState({
      picture: { uri: data.uri },
      isReviewMode: true,
      width: data.width,
      height: data.height
    });
  };

  takeSnapShot = () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(captureRef(this.imageWrap, {
        format: 'jpg',
        quality: 1,
        result: 'data-uri',
      })), 300);
    });
  }

  doneCapturing = () => {
    this.takeSnapShot()
      .then(image => this.state.picture = image)
      .then(() => this.save());
  };

  save = () => {
    if (this.props.onImageSave) {
      this.props.onImageSave(this.state.picture);
    }
    this.props.routeBack();
  }

  onImageFromCameraRoll = (image, cb = () => {}) => {
    Image.getSize(image.uri, (width, height) => {
      this.setState({
        isReviewMode: true,
        picture: image,
        imageSelectedFromCamera: true,
        width,
        height,
      }, cb);
    }, () => {
      this.setState({
        isReviewMode: true,
        picture: image,
        imageSelectedFromCamera: true,
        width: 2 * WINDOW_WIDTH,
        height: 2 * WINDOW_HEIGHT,
      }, cb);
    });
  }

  routeCameraRoll = () => {
    this.props.routeScene('CameraRollScene', { onImageSelected: this.onImageFromCameraRoll }, {
      navigatorStyle: {
        navBarHidden: true,
        tabBarHidden: true,
        statusBarHidden: true,
      },
    });
  };

  onRetake = () => {
    LayoutAnimation.spring();
    this.setState({ isReviewMode: false, imageSelectedFromCamera: false });
  };

  render() {
    const {
      cameraOptions,
      isReviewMode,
      imageSelectedFromCamera,
      cameraOpacity,
    } = this.state;

    const flashIcon = cameraFlashModeIcons[cameraOptions.flashMode];
    const takePicIcon = require('img/icons/icon_camera_capture.png');

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.container, { opacity: cameraOpacity }]}>
          {this.renderCameraContent(isReviewMode)}
        </Animated.View>
        <AvatarCameraControls
          routeCameraRoll={this.routeCameraRoll}
          cameraIcon={takePicIcon}
          isReviewMode={isReviewMode}
          imageSelectedFromCamera={imageSelectedFromCamera}
          isPhotoMode={true}
          flipIcon="repeat"
          cameraRollIcon="photo"
          flipPicture={this.flipPicture}
          flashIcon={flashIcon}
          toggleFlash={this.toggleFlash}
          onDone={this.doneCapturing}
          onCapture={this.handlePress}
          onRetake={this.onRetake}
        />
      </View>
    );
  }
}

ScanDocumentContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  onImageSave: PropTypes.func.isRequired,
};

export default ScanDocumentContainer;
