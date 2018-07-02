// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text
} from 'react-native';
import I18n from 'react-native-i18n';
import {
  TEXT,
  BORDERLINE,
  TINT,
  WHITE,
} from 'AppColors';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from 'AppConstants';
import { SFRegular } from 'AppFonts';
import { RoundedButton } from 'AppComponents';
import { compose } from 'recompose';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const inputView = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    height: WINDOW_HEIGHT,
    width: WINDOW_WIDTH,
    alignItems: 'center',
  },
  dataContainer: {
    height: WINDOW_HEIGHT * 0.37,
    width: WINDOW_WIDTH * 0.80,
    backgroundColor: WHITE,
    borderRadius: 5,
    borderColor: BORDERLINE,
    alignItems: 'center',
    marginTop: (WINDOW_HEIGHT / 2) - (WINDOW_HEIGHT * 0.30)
  },
  title: {
    color: TEXT,
    textAlign: 'center',
    fontSize: 18,
    paddingTop: 15
  },
  textInputView: {
    flexDirection: 'row',
    width: WINDOW_WIDTH * 0.65
  }
});

export class QRCodeEnterDialog extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      enteredCode: '',
      codeValid: true,
    };
  }

  onConfirm = () => {
    this.props.onCodeEnterSuccess(this.state.enteredCode);
  }

  setCode = (enteredCode) => {
    this.setState({ enteredCode }, () => {
      if (this.state.enteredCode.length === 10) {
        this.setState({ codeValid: false });
      }
    });
  }

  renderInputValue = (index) => {
    const { enteredCode } = this.state;
    const data = enteredCode.split('');
    if (this.state.enteredCode.length === 10) {
      this.setState({ codeValid: false });
    }
    if (data[index]) {
      return data[index];
    }
    return ' ';
  }

  renderInputView = () => {
    return inputView.map((data, index) => {
      return (
        <TouchableOpacity onPress={() => this.codeField.focus()} key={data}>
          <View style={{
            width: 20,
            borderBottomColor: TINT,
            borderBottomWidth: 1,
            height: 20,
            alignItems: 'center',
            marginRight: 5
          }}
          >
            <Text>{this.renderInputValue(index)}</Text>
          </View>
        </TouchableOpacity>);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ justifyContent: 'center' }}>
          <KeyboardAwareScrollView>
            <View style={styles.dataContainer}>
              <View>
                <SFRegular style={styles.title}>{I18n.t('enterQr')}</SFRegular>
              </View>
              <TextInput
                ref={ref => this.codeField = ref}
                style={{
                  height: 20, width: 200, backgroundColor: WHITE, color: WHITE
                }}
                autoFocus={true}
                keyboardType={'default'}
                underlineColorAndroid={WHITE}
                autoCapitalize={'none'}
                autoCorrect={false}
                caretHidden={true}
                maxLength={10}
                minLength={10}
                onChangeText={text => this.setCode(text)}
                value={this.state.enteredCode}
              />
              <View style={[styles.textInputView, { marginTop: 20 }]}>
                {this.renderInputView()}
              </View>
              <View style={{ marginTop: WINDOW_HEIGHT * 0.05, alignItems: 'center' }}>
                <RoundedButton
                  primary={!this.state.codeValid}
                  width={WINDOW_WIDTH * 0.6}
                  height={30}
                  buttonStyle={{ alignSelf: 'center' }}
                  onPress={() => this.onConfirm()}
                >
                  {I18n.t('register')}
                </RoundedButton>
              </View>
              <View style={{ marginBottom: WINDOW_HEIGHT * 0.02, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => { this.props.onPressCancel(); }}>
                  <SFRegular style={{ color: TEXT, fontSize: 12 }}>{I18n.t('cancel')}</SFRegular>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>
    );
  }
}

QRCodeEnterDialog.propTypes = {
  routeScene: PropTypes.func.isRequired,
  dismissLightBox: PropTypes.func.isRequired,
};

export default compose()(QRCodeEnterDialog);
