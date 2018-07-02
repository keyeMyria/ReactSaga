// @flow
import React, { PureComponent } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { WINDOW_WIDTH } from 'AppConstants';
import { LINE, PURPLISH_GREY, TEXT } from 'AppColors';
import { SFRegular, SFBold } from 'AppFonts';
import { Avatar } from 'AppComponents';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment/moment';

const styles = StyleSheet.create({
  columnView: {
    height: 80,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  rawView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    height: 25,
    width: 25,
    borderRadius: 12.5
  },
  badge: {
    backgroundColor: 'red',
    width: 30,
    height: 0,
    left: 35,
    top: -20
  },
  avatarT: {
    height: 50,
    width: 50,
    borderRadius: 25
  },
  dataView: {
    borderBottomWidth: 0.5,
    borderBottomColor: LINE
  },
  nameText: {
    fontSize: 14,
    color: TEXT
  },
  dateText: {
    fontSize: 14,
    color: LINE
  },
  icon: {
    color: LINE
  },
  paymentText: {
    fontSize: 20
  },
  patientNameText: {
    fontSize: 10,
    color: TEXT,
    marginTop: 5
  }
});
const AVATAR_SIZE = 50;

export class PaymentHistoryTab extends PureComponent {
  render() {
    const {
      paymentHistoryData,
      onClick
    } = this.props;
    const date = moment.unix(paymentHistoryData.created_at).format('MMM Do YYYY');
    return (
      <View>
        <View style={{ width: WINDOW_WIDTH }}>
          <TouchableOpacity onPress={() => { onClick(paymentHistoryData); }}>
            <View style={[styles.rawView, styles.dataView, { paddingRight: 12 }]}>
              <View style={{ width: WINDOW_WIDTH * 0.20, alignItems: 'center' }}>
                <View>
                  <Avatar
                    placeholderSize={18}
                    size={AVATAR_SIZE}
                    source={{ uri: paymentHistoryData.provider.photo_url }}
                    placeholder={{
                      first_name: paymentHistoryData.provider.first_name,
                      last_name: paymentHistoryData.provider.last_name
                    }}
                    style={styles.avatarT}
                  />
                  <View style={styles.badge}>
                    <Avatar
                      size={30}
                      placeholderSize={10}
                      source={{ uri: paymentHistoryData.user.image_url }}
                      placeholder={{
                        first_name: paymentHistoryData.user.first_name,
                        last_name: paymentHistoryData.user.last_name
                      }}
                      style={styles.avatar}
                    />
                  </View>
                </View>
                <SFRegular style={styles.patientNameText}>
                  {paymentHistoryData.user.first_name}
                </SFRegular>
              </View>
              <View style={[styles.columnView, { width: WINDOW_WIDTH * 0.45, marginLeft: 8 }]}>
                <SFBold style={styles.nameText}>Dr. {paymentHistoryData.provider.full_name}</SFBold>
                <SFRegular style={styles.dateText}>{paymentHistoryData.description}</SFRegular>
                <SFRegular style={styles.dateText}>{date}</SFRegular>
              </View>
              <View style={{ width: WINDOW_WIDTH * 0.20, flexDirection: 'row' }}>
                <SFRegular style={[styles.paymentText, { color: LINE }]}>
                  {'$'}
                </SFRegular>
                <SFRegular style={[styles.paymentText, { color: PURPLISH_GREY }]}>
                  { paymentHistoryData.amount}
                </SFRegular>
              </View>
              <View style={{ width: WINDOW_WIDTH * 0.18 }}>
                <Icon name={'ios-arrow-forward'} size={20} style={styles.icon} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
