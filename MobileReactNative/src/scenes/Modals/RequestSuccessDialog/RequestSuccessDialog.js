// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Platform } from 'react-native';
import I18n from 'react-native-i18n';
import { TEXT } from 'AppColors';
import { WINDOW_WIDTH, NAVBAR_HEIGHT } from 'AppConstants';
import { NormalButton, Panel, CheckButton } from 'AppComponents';
import { SFMedium, SFRegular } from 'AppFonts';

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
  button: {
    width: WINDOW_WIDTH / 2,
    marginHorizontal: 5,
    marginBottom: NAVBAR_HEIGHT
  },
  textStyle: {
    fontFamily: 'SFUIText-Bold',
  },
  label: {
    color: TEXT,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 200,
    marginTop: 20
  },
  description: {
    fontSize: 12,
    width: WINDOW_WIDTH * 3 / 4,
    color: TEXT,
    textAlign: 'center',
    marginVertical: 20
  },
  checkButton: {
    marginTop: NAVBAR_HEIGHT,
    backgroundColor: 'transparent'
  }
});

export class RequestSuccessDialog extends PureComponent {

  render() {
    return (
      <View style={styles.container}>
        <Panel style={styles.panel}>
          <CheckButton
            size={80}
            style={styles.checkButton}
          />
          <SFMedium allowFontScaling={false} style={styles.label}>
            {I18n.t('appointmentRequestSentToAProviderForApproval')}
          </SFMedium>
          <SFRegular allowFontScaling={false} style={styles.description}>
            {I18n.t('weWillLetYouKnowUpdatesShortlyOnYourRequest')}
          </SFRegular>
          <NormalButton
            text={I18n.t('ok').toUpperCase()}
            style={styles.button}
            textStyle={styles.textStyle}
            pressed={true}
            onPress={() => this.props.dismissLightBox()}
            dropShadow={true}
          />
        </Panel>
      </View>
    );
  }
}

RequestSuccessDialog.propTypes = {
  routeScene: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
};

export default RequestSuccessDialog;
