import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
} from 'react-native';
import { requestCameraAccess, setStatusBarHidden } from 'AppUtilities';
import { SFRegular } from 'AppFonts';
import { WINDOW_WIDTH as width } from 'AppConstants';
import { WHITE } from 'AppColors';
import I18n from 'react-native-i18n';
import { AssetList } from './AssetList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width,
  },
  navBarLabel: {
    color: WHITE,
    fontSize: 16,
  },
});

export class CameraRollContainer extends PureComponent {
  static propTypes = {
    routeBack: PropTypes.func.isRequired,
    onImageSelected: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      togglePreview: false,
      hasPermission: false,
    };
  }

  componentWillMount() {
    requestCameraAccess('photo')
      .then(() => this.setState({ hasPermission: true }))
      .catch(() => this.props.routeBack());
  }

  componentDidMount() {
    setStatusBarHidden(true);
  }

  togglePreview = () => {
  };

  chooseAsset = (chosenImage) => {
    this.props.onImageSelected(chosenImage);
    this.props.routeBack();
  };

  render() {
    const { routeBack } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.navBar}>
          <SFRegular style={[styles.navBarLabel]}>
            {I18n.t('selectImage')}
          </SFRegular>
        </View>
        <AssetList
          ref={ref => this.photoTabRef = ref}
          cancel={routeBack}
          scrollEnabled={!this.state.togglePreview}
          chooseAsset={image => this.chooseAsset(image, 'photo')}
          togglePreview={this.togglePreview}
          hasPermission={this.state.hasPermission}
          maxImages={1}
          tab={'Photos'}
        />
      </View>
    );
  }
}
