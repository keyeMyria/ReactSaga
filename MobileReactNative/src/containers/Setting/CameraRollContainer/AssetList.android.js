import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, LayoutAnimation } from 'react-native';
// import { CameraKitGalleryView } from 'react-native-camera-kit';

const IMAGES_PER_ROW = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    togglePreview: PropTypes.func.isRequired,
    hasPermission: PropTypes.bool,
    maxImages: PropTypes.number,
  };

  static defaultProps = {
    hasPermission: false,
    maxImages: 4,
    images: []
  };

  unselectImage = (image) => {
    if (this.gallery) {
      const uri = image.uri.replace('file://', '');
      this.gallery.unselectImage(uri);
    }
  };

  modifyImageData = (event) => {
    let image = event.nativeEvent;
    image = Object.assign({}, image, {
      uri: `file://${image.selected}`,
      previewImage: `file://${image.selected}`,
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
    this.props.togglePreview(!touchEnd, touchEnd ? '' : image.uri);
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
    // const { images } = this.props;
    // const selectedImages = images.map(img => img.uri.replace('file://', ''));
    // const selection = { enable: (Object.keys(selectedImages).length < this.props.maxImages) };
    //
    // return (
    //   <CameraKitGalleryView
    //     ref={gallery => this.gallery = gallery}
    //     style={styles.container}
    //     minimumInteritemSpacing={1}
    //     minimumLineSpacing={1}
    //     columnCount={IMAGES_PER_ROW}
    //     selectedImages={selectedImages}
    //     onTapImage={this.onTapImage}
    //     onLongPress={this.onLongPress}
    //     selection={selection}
    //   />
    // );
  }
}
