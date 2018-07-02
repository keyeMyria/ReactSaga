// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { compose } from 'recompose';
import { withEmitter } from 'AppUtilities';
import { SettingTopNav, FamilyMemberList, Panel } from 'AppComponents';
import { SFRegular, SFMedium } from 'AppFonts';
import { connectPatient, connectAuth } from 'AppRedux';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { NAVBAR_HEIGHT } from 'AppConstants';
import {
  WHITE,
  TINT,
  BACKGROUND_GRAY,
  PURPLISH_GREY,
  DARK_GRAY,
  PRIMARY_COLOR,
  SNOW
} from 'AppColors';
import I18n from 'react-native-i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND_GRAY,
    flex: 1
  },
  contentContainer: {
    paddingBottom: NAVBAR_HEIGHT
  },
  heading: {
    fontSize: 12,
    color: PURPLISH_GREY,
    padding: 10,
    textAlign: 'center'
  },
  subTitleView: {
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 12
  },
  subTitle: {
    fontSize: 14,
    color: PURPLISH_GREY
  },
  addNewView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    padding: 5
  },
  addNewText: {
    color: TINT,
    fontSize: 16
  },
  roundView: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderColor: TINT,
    borderWidth: 1,
    marginRight: 10
  },
  panel: {
    marginTop: 15,
    justifyContent: 'center',
    paddingHorizontal: -10
  },
});

@withEmitter('_emitter')
class FamilyMemberContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
    };
  }
  addNew = () => {
    this.props.routeScene('AddProfileScene', null, {
      title: I18n.t('addMember'),
      backButtonTitle: '',
      navigatorStyle: {
        navBarHidden: false,
        tabBarHidden: false,
        navBarBackgroundColor: WHITE,
        navBarTextColor: DARK_GRAY,
        navBarButtonColor: PRIMARY_COLOR,
      },
      overrideBackPress: true
    });
  }

  onPatientSelect = (selectedPatient) => {
    const { patient, setCurrentPatient } = this.props;
    const { activePatient } = patient;

    if (activePatient.id === selectedPatient.id) {
      this.props.routeScene('ProfileScene', null, {
        backButtonTitle: '',
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: true,
          navBarBackgroundColor: SNOW,
          navBarTextColor: SNOW,
          navBarButtonColor: PRIMARY_COLOR,
        },
        overrideBackPress: true
      });
    }

    setCurrentPatient(selectedPatient);

    this.props.routeScene('ProfileScene', null, {
      backButtonTitle: '',
      navigatorStyle: {
        navBarHidden: true,
        tabBarHidden: true,
        navBarBackgroundColor: SNOW,
        navBarTextColor: SNOW,
        navBarButtonColor: PRIMARY_COLOR,
      },
      overrideBackPress: true
    });
  }

  render() {
    const { routeBack, patient } = this.props;
    const { activePatient, patients } = patient;

    return (
      <View style={styles.container}>
        <SettingTopNav
          onBack={routeBack}
          activePatient={activePatient}
        />
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <Panel style={styles.panel}>
            <SFRegular style={styles.heading}>
              {I18n.t('myFamilyMemberTitle')}
            </SFRegular>
            <View style={styles.subTitleView}>
              <SFRegular style={styles.subTitle}>
                { (I18n.t('myFamilyMember')).toUpperCase() }
              </SFRegular>
            </View>
            <FlatList
              data={patients}
              keyExtractor={(item, index) => `#${index}`}
              refreshing={false}
              ListFooterComponent={<TouchableOpacity onPress={() => { this.addNew(); }}>
                <View style={styles.addNewView}>
                  <View style={styles.roundView}>
                    <MaterialIcon name={'add'} size={18} style={{ color: TINT }} />
                  </View>
                  <SFMedium style={styles.addNewText}>Add New</SFMedium>
                </View>
              </TouchableOpacity>}
              renderItem={({ item }) => {
                return (
                  <FamilyMemberList
                    patient={item}
                    onPatientSelect={this.onPatientSelect}
                  />
                );
              }}
            />
          </Panel>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

FamilyMemberContainer.propTypes = {
  routeBack: PropTypes.func.isRequired,
  routeScene: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  setCurrentPatient: PropTypes.func.isRequired,
};

export default compose(
  connectPatient(),
  connectAuth()
)(FamilyMemberContainer);
