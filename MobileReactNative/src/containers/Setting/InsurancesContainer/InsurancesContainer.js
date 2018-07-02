// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Alert,
  FlatList
} from 'react-native';

import { connectAuth, connectPatient, connectInsurance } from 'AppRedux';
import {
  BACKGROUND_GRAY,
} from 'AppColors';
import {
  CalendarTopNav,
  InsuranceCardItem,
  NormalButton,
  Loading
} from 'AppComponents';
import { compose } from 'recompose';
import I18n from 'react-native-i18n';
import { promisify, AlertMessage } from 'AppUtilities';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    padding: 20,
    paddingRight: 15
  },
  container: {
    backgroundColor: BACKGROUND_GRAY,
    flex: 1
  },
  buttonSaveLabel: {
    fontFamily: 'SFUIText-Bold',
    fontSize: 14
  },
});

class InsurancesContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isChecking: false
    };
  }

  onAddNewInsurance = () => {
    this.props.routeScene('EditInsuranceScene',
      {
        mode: 1
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        }
      });
  };

  onInsuranceClicked = (insurance) => {
    const { routeScene } = this.props;

    routeScene('EditInsuranceScene',
      {
        patientInsurance: insurance,
        mode: 4
      },
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: false
        }
      });
  };

  deleteInsurance = (insurance) => {
    const { removePatientInsurance, patient, routeBack } = this.props;

    this.setState({ isChecking: true });

    const insuranceCount = patient.activePatient.insurances.length;

    promisify(removePatientInsurance, {
      user_id: patient.activePatient.id,
      id: insurance.id,
    }).then(() => insuranceCount === 1 && routeBack())
      .catch(error => AlertMessage.fromRequest(error))
      .finally(() => this.setState({ isChecking: false }));
  };

  onRemoveInsurance = (insurance) => {
    Alert.alert('OpenMed', I18n.t('wantToRemoveInsurance'),
      [
        { text: I18n.t('no') },
        {
          text: I18n.t('yes'),
          onPress: () => this.deleteInsurance(insurance)
        }
      ]
    );
  };

  render() {
    const { isChecking } = this.state;
    const { patient, routeBack, insurance } = this.props;
    const { activePatient } = patient;

    return (
      <View style={styles.container}>
        <CalendarTopNav
          onBack={routeBack}
          activePatient={activePatient}
        />
        <FlatList
          style={styles.flex}
          data={activePatient.insurances}
          renderItem={({ item }) => {
            return (
              <InsuranceCardItem
                dataSource={item}
                insurances={insurance.insurances}
                onClick={this.onInsuranceClicked}
                onRemove={this.onRemoveInsurance}
              />
            );
          }}
          keyExtractor={(item) => `#${item.id}`}
        />
        <NormalButton
          text={I18n.t('addMore').toUpperCase()}
          textStyle={styles.buttonSaveLabel}
          pressed={true}
          borderRadius={0}
          onPress={this.onAddNewInsurance}
        />
        {isChecking && <Loading showOverlay={true} />}
      </View>
    );
  }
}

InsurancesContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  setCurrentPatient: PropTypes.func.isRequired,
  removePatientInsurance: PropTypes.func.isRequired,
  getInsurances: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  insurance: PropTypes.object.isRequired,
  patientInsurance: PropTypes.object,
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectInsurance()
)(InsurancesContainer);
