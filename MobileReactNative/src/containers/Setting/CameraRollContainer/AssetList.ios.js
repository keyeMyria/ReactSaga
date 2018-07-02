import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
// import { CameraKitGalleryView } from 'react-native-camera-kit';

const IMAGES_PER_ROW = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const CUSTOM_ANIMATION = {
  duration: 100,
  create: {
    type: LayoutAnimation.Types.spring,
    property: LayoutAnimation.Properties.scaleXY,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    property: LayoutAnimation.Properties.scaleXY,
  },
  delete: {
    type: LayoutAnimation.Types.spring,
    property: LayoutAnimation.Properties.scaleXY,
  }
};

export class AssetList extends Component {
  static propTypes = {
    images: PropTypes.arrayOf(PropTypes.string),
    chooseAsset: PropTypes.func.isRequired,
    tab: PropTypes.string.isRequired,
    togglePreview: PropTypes.func.isRequired,
    hasPermission: PropTypes.bool,
    maxImages: PropTypes.number,
  };

  static defaultProps = {
    hasPermission: false,
    maxImages: 4,
    images: [],
  };

  unselectImage =(image) => {
    if (this.gallery) {
      this.gallery.unselectImage(image.selectedId);
    }
  };

  modifyImageData = (event) => {
    let image = event.nativeEvent;
    image = Object.assign({}, image, {
      uri: image.selected,
      previewImage: image.preview || image.selected,
      filePath: image.selected,
      imageLocation: image.location
    });
    delete image.selected;
    delete image.location;
    return image;
  };

  onTapImage = (event) => {
    const image = this.modifyImageData(event);
    this.props.chooseAsset(image);
  };

  onLongPress = (event) => {
    const image = this.modifyImageData(event);
    const { touchEnd } = image;
    LayoutAnimation.configureNext(CUSTOM_ANIMATION);
    this.props.togglePreview(!touchEnd, touchEnd ? '' : image.previewImage);
  };

  render() {
    return (
      <View />
    );
    // if (!this.props.hasPermission) {
    //   return (
    //     <View />
    //   );
    // }
    // const { tab, images, maxImages } = this.props;
    //
    // const albumName = tab === 'Videos' ? 'Videos' : undefined;
    // const selectedImages = images.map(img => img.selectedId);
    // const selection = { enable: (Object.keys(images).length < maxImages) };
    // return (
    //   <CameraKitGalleryView
    //     ref={gallery => this.gallery = gallery}
    //     albumName={albumName}
    //     style={styles.container}
    //     minimumInteritemSpacing={1}
    //     minimumLineSpacing={1}
    //     columnCount={IMAGES_PER_ROW}
    //     getUrlOnTapImage={true}
    //     selectedImages={selectedImages}
    //     onTapImage={this.onTapImage}
    //     onLongPressImage={this.onLongPress}
    //     selection={selection}
    //   />
    // );
  }
}
