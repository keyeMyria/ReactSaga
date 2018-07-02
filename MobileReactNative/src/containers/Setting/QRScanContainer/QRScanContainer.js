// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert
} from 'react-native';
import { withEmitter, promisify } from 'AppUtilities';
import { connectAuth } from 'AppRedux';
import { SFMedium } from 'AppFonts';
import { WHITE, BLACK } from 'AppColors';
import { OMImage, QRScanTopNav, Loading } from 'AppComponents';
import I18n from 'react-native-i18n';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from 'AppConstants';
import Camera from 'react-native-camera';
import { compose } from 'recompose';

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 22,
    padding: 32,
    color: WHITE,
    textAlign: 'center'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  }
});

@withEmitter('_emitter')
class QRScanContainer extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      flash: false,
      flashValue: Camera.constants.TorchMode.off,
      isSending: false,
      modalOpen: false
    };
  }

  checkValidQRCode = (code) => {
    const { dismissLightBox } = this.props;
    const { getPatientInviteCode } = this.props;
    promisify(getPatientInviteCode, {
      code
    }).then(() => {
      dismissLightBox();
      this.onSuccess(code);
    })
      .catch((error) => {
        dismissLightBox();
        Alert.alert(
          'OpenMed',
          error,
          [
            {
              text: I18n.t('tryAgain'),
              onPress: () => {
                this.onEdit();
              }
            }
          ]
        );
      })
      .finally();
  }

  checkValidQRScan = (code) => {
    const { dismissLightBox } = this.props;
    this.setState({ isSending: true });
    dismissLightBox();
    this.camera.stopPreview();
    const { getPatientInviteCode } = this.props;
    promisify(getPatientInviteCode, {
      code: code.data
    }).then(() => this.onSuccess(code.data))
      .catch((error) => {
        Alert.alert(
          'OpenMed',
          error,
          [
            {
              text: I18n.t('tryAgain'),
              onPress: () => {
                this.camera.startPreview();
              }
            }
          ]
        );
      })
      .finally(() => this.setState({ isSending: false }));
  }

  onSuccess(code) {
    if (this.state.flash) {
      this.setState({ flashValue: Camera.constants.TorchMode.off, flash: false });
    }
    const { routeScene } = this.props;
    routeScene('QRScanPasswordScene', { code }, {
      navigatorStyle: {
        navBarHidden: true,
        tabBarHidden: true
      }
    });
  }

  onCodeEnterSuccess = (code) => {
    this.setState({
      modalOpen: true
    });
    this.checkValidQRCode(code);
  }

  onPressCancel = () => {
    const { dismissLightBox } = this.props;
    dismissLightBox();
    this.setState({
      modalOpen: false
    });
    this.camera.startPreview();
  }

  onEdit = () => {
    this.camera.stopPreview();
    this.setState({
      modalOpen: true
    });
    if (this.state.flash) {
      this.setState({ flashValue: Camera.constants.TorchMode.off, flash: false });
    }
    const { showLightBox } = this.props;
    showLightBox(
      'QRCodeEnterDialog',
      {
        onCodeEnterSuccess: this.onCodeEnterSuccess,
        onPressCancel: this.onPressCancel
      },
      {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        tapBackgroundToDismiss: false,
        animationIn: 'slideUp',
        animationOut: 'slideDown'
      }
    );
  }

  onFlash = () => {
    this.camera.stopPreview();
    this.setState({ flash: !this.state.flash }, () => {
      if (this.state.flash) {
        this.setState({ flashValue: Camera.constants.TorchMode.on }, () => {
          this.camera.startPreview();
        });
      } else {
        this.setState({ flashValue: Camera.constants.TorchMode.off }, () => {
          this.camera.startPreview();
        });
      }
    });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <QRScanTopNav
          onBack={this.props.routeBack}
          title={'QR Code'}
          QR={true}
        />
        <View style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: 'black'
        }}
        >
          <Camera
            ref={(ref) => {
              this.camera = ref;
            }}
            torchMode={this.state.flashValue}
            onBarCodeRead={this.checkValidQRScan.bind(this)}
            style={styles.preview}
            aspect={Camera.constants.Aspect.fill}
            barCodeTypes={[Camera.constants.BarCodeType.qr]}
          >
            <View style={{
              flexDirection: 'column',
              justifyContent: 'space-between',
              marginTop: WINDOW_HEIGHT * 0.20,
              marginBottom: WINDOW_HEIGHT * 0.25
            }}
            >
              <View>
                <SFMedium style={styles.centerText}>
                  {I18n.t('qrRegister')}
                </SFMedium>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: WINDOW_HEIGHT * 0.10 }}>
                <View style={{ width: WINDOW_WIDTH * 0.50, alignItems: 'center' }} >
                  <TouchableOpacity onPress={() => { this.onEdit(); }}>
                    <OMImage
                      style={{ height: 50, width: 50 }}
                      resizeMode={'contain'}
                      placeholder={require('img/images/qr_edit.png')}
                      threshold={50}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ width: WINDOW_WIDTH * 0.50, alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => { this.onFlash(); }}>
                    <OMImage
                      style={{ height: 50, width: 50 }}
                      resizeMode={'contain'}
                      placeholder={require('img/images/qr_flash.png')}
                      threshold={50}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <TouchableOpacity onPress={() => { this.props.routeBack(); }}>
                  <SFMedium style={{
                    fontSize: 15,
                    alignItems: 'center',
                    marginHorizontal: WINDOW_WIDTH * 0.43,
                    color: this.state.modalOpen ? 'transparent' : WHITE
                  }}
                  >
                    Cancel
                  </SFMedium>
                </TouchableOpacity>
              </View>
            </View>
          </Camera>
        </View>
        <View style={{
          height: WINDOW_HEIGHT * 0.40,
          width: WINDOW_WIDTH * 0.80,
          position: 'absolute',
          top: WINDOW_HEIGHT * 0.27,
          marginHorizontal: WINDOW_WIDTH * 0.10,
          borderWidth: 1,
          borderColor: WHITE
        }}
        />
        {this.state.isSending && <Loading />}
      </View>
    );
  }
}

QRScanContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  showLightBox: PropTypes.func.isRequired,
  getPatientInviteCode: PropTypes.func.isRequired
};


export default compose(connectAuth())(QRScanContainer);
