// @flow

import React, { PureComponent } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDERLINE, PRIMARY_COLOR, PURPLISH_GREY, LINE } from 'AppColors';
import { SFRegular } from 'AppFonts';
import moment from 'moment/moment';
import { get } from 'lodash';
import { ImageUtils } from 'AppUtilities';
import { OMImage } from 'AppComponents';
import * as Progress from 'react-native-progress';


const styles = StyleSheet.create({
  mainContainer: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderTopColor: BORDERLINE,
    borderBottomColor: BORDERLINE,
    height: 70,
    flexDirection: 'row',
    paddingRight: 25,
    paddingLeft: 25,
    paddingTop: 10,
    paddingBottom: 10,
  },
  dataContainer: {
    height: 50,
    justifyContent: 'center',
    paddingLeft: 20
  },
  nameText: {
    color: PURPLISH_GREY,
    fontSize: 15
  },
  bdayText: {
    fontSize: 12,
    paddingTop: 5,
    color: LINE
  },
  arrowContainer: {
    height: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25
  },
});


export class FamilyMemberList extends PureComponent {
  render() {
    const { patient, onPatientSelect } = this.props;
    return (
      <TouchableOpacity onPress={() => { onPatientSelect(patient); }} >
        <View style={styles.mainContainer}>
          <OMImage
            style={styles.avatar}
            resizeMode={'cover'}
            borderRadius={25}
            indicator={Progress.Circle}
            indicatorProps={{
              size: 10,
              thickness: 0.5,
              borderWidth: 0,
              color: PRIMARY_COLOR,
            }}
            source={{ uri: patient.image_url }}
            placeholder={ImageUtils.getUnknownImage(patient.gender)}
            threshold={50}
          />
          <View style={styles.dataContainer}>
            <SFRegular style={styles.nameText}>
              {get(patient, 'full_name', '')}
            </SFRegular>
            <SFRegular style={styles.bdayText}>
              {moment(get(patient, 'birthday', '')).format('DD/MM/YYYY')}
            </SFRegular>
          </View>
          <View style={styles.arrowContainer}>
            <Icon name={'ios-arrow-forward'} size={18} style={{ color: PURPLISH_GREY }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
