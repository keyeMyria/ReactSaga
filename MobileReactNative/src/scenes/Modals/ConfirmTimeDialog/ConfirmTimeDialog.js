// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Platform } from 'react-native';
import I18n from 'react-native-i18n';
import { TEXT, TINT, PLACEHOLDER } from 'AppColors';
import { NAVBAR_HEIGHT, WINDOW_WIDTH } from 'AppConstants';
import { Panel, NormalButton } from 'AppComponents';
import { connectAppointment } from 'AppRedux';
import { SFRegular, SFMedium } from 'AppFonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent'
      },
      android: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }
    }),
  },
  panel: {
    alignItems: 'center'
  },
  label: {
    color: TEXT,
    marginTop: NAVBAR_HEIGHT,
    fontSize: 16
  },
  description: {
    fontSize: 12,
    width: WINDOW_WIDTH * 3 / 4,
    color: PLACEHOLDER,
    textAlign: 'center',
    marginVertical: 20
  },
  button: {
    width: WINDOW_WIDTH * 2 / 3,
    marginTop: 20
  },
  textStyle: {
    fontFamily: 'SFUIText-Bold',
  },
  normalTextStyle: {
    fontFamily: 'SFUIText-Bold',
    color: TINT
  },
  cancelButton: {
    width: WINDOW_WIDTH * 2 / 3,
    marginTop: NAVBAR_HEIGHT
  }
});

export class ConfirmTimeDialog extends PureComponent {

  onCancel = () => {
    this.props.dismissLightBox();
  };

  onFirstAvailable = () => {
    this.props.onFirstAvailable(true);
  };

  onSelectTime = () => {
    this.props.onChangeTime();
  };

  render() {
    const { providers } = this.props.appointment;

    return (
      <View style={styles.container}>
        <Panel
          title={providers.length === 1
            ? [providers[0].provider.pre_name,
              providers[0].provider.first_name,
              providers[0].provider.last_name].join(' ')
            : ''}
          style={styles.panel}
        >
          <SFMedium allowFontScaling={false} style={styles.label}>
            {I18n.t('confirmYourRequest')}
          </SFMedium>
          <NormalButton
            text={I18n.t('firstAvailable').toUpperCase()}
            style={styles.button}
            textStyle={styles.textStyle}
            pressed={true}
            onPress={() => this.onFirstAvailable()}
            dropShadow={true}
          />
          <NormalButton
            text={I18n.t('changeTime').toUpperCase()}
            style={styles.button}
            textStyle={styles.normalTextStyle}
            onPress={() => this.onSelectTime()}
            borderWidth={1}
          />
          <NormalButton
            text={I18n.t('cancel').toUpperCase()}
            style={styles.cancelButton}
            textStyle={styles.normalTextStyle}
            onPress={() => this.onCancel()}
            borderWidth={1}
          />
          <SFRegular allowFontScaling={false} style={styles.description}>
            {I18n.t('theProviderMustAcceptYourRequest')}
          </SFRegular>
        </Panel>
      </View>
    );
  }
}

ConfirmTimeDialog.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  onChangeTime: PropTypes.func,
  onFirstAvailable: PropTypes.func,
  dismissLightBox: PropTypes.func.isRequired,
  appointment: PropTypes.object.isRequired,
};

export default connectAppointment()(ConfirmTimeDialog);
