// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native';
import {
  connectAuth,
  connectPatient,
  connectInsurance,
  connectSetting
} from 'AppRedux';
import { SILVER, PURPLISH_GREY, WHITE, BORDERLINE, LINE, TEXT, PRIMARY_COLOR } from 'AppColors';
import {
  InviteFriendTop,
  Loading,
  OMImage,
  ActionSheet
} from 'AppComponents';
import { compose } from 'recompose';
import { SFRegular } from 'AppFonts';
import I18n from 'react-native-i18n';
import { promisify, AlertMessage } from 'AppUtilities';
import moment from 'moment';
import SendSMS from 'react-native-sms';
import MailCompose from 'react-native-mail-compose';

const styles = StyleSheet.create({
  container: {
    backgroundColor: SILVER,
    flex: 1,
    paddingBottom: 10
  },
  earnedPointBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 70
  },
  enrnedPoint: {
    color: PURPLISH_GREY,
    textAlign: 'center'
  },
  giftIconImg: {
    height: 10,
    width: 35
  },
  openIconImg: {
    height: 30,
    width: 30
  }
});

class RedeemContainer extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isChecking: false,
      textColor: true,
      isRefreshing: false,
      selectedRewardOption: 2,
      history: {
        data: [],
        total_count: 0
      },
      page: 1
    };
    this.item = null;
  }

  componentDidMount() {
    this.updateData(1, true);
  }

  onRedeem = () => {

    const { setRedeem } = this.props;
    const payloadData = {
      type: this.state.selectedRewardOption,
    };
    if (!this.state.textColor) {
      promisify(setRedeem, payloadData).then((status) => {
        if (status === 200) {
          AlertMessage.showMessage('OpenMed', I18n.t('redeemSuccess'));
        }
      }).catch((err) => {
        AlertMessage.fromRequest(err);
      });
    }

  };

  onAmazonReward = () => {
    this.setState({ selectedRewardOption: 0, textColor: false });
  }

  onOpenMedReward = () => {
    this.setState({ selectedRewardOption: 1, textColor: false });
  }


  onAction = () => {
    return (
      <ActionSheet
        ref={ref => this.ActionSheet = ref}
        title={''}
        options={[I18n.t('cancel'), I18n.t('Action')]}
        cancelButtonIndex={0}
        destructiveButtonIndex={4}
        onPress={i => setTimeout(() => {
          console.log(`selected index${i}`);
          if (i === 1) {
            this.onResend();
          }
        }, 300)}
      />
    );
  }

  onResend = () => {

    console.log(this.item);

    if (this.item.email !== '') {
      this.onSendMail(this.item);
    }
    if (this.item.phone !== '') {
      this.onSendSMS(this.item);
    }
  }

  onSendMail = async (data) => {
    const name = data.full_name;

    const { setting } = this.props;
    const { referralCodeInfo } = setting;

    const emailData = [{
      email: data.email,
      first_name: data.full_name,
      last_name: ''
    }];

    const payloadData = {
      code: referralCodeInfo.user_friend_code.code,
      type: 'email',
      users: emailData
    };

    // this.setState({ emailSelect: true });
    try {
      const res = await MailCompose.send({
        toRecipients: [data.email],
        // eslint-disable-next-line max-len
        subject: 'Invite Friends from OpenMed',
        text: `https://refer.openmed.com/Mhig9fZEnN?code=${referralCodeInfo.user_friend_code.code}`,
        html: `https://refer.openmed.com/Mhig9fZEnN?code=${referralCodeInfo.user_friend_code.code}`
      });

      if (res === 'sent') {

        console.log(payloadData);
        const { setReferralCode } = this.props;

        promisify(setReferralCode, payloadData).then((status) => {
          if (status === 200) {
            AlertMessage.showMessage('OpenMed', name + I18n.t('resendSuccess'));
            this.updateData(1, true);
          }
        }).catch((err) => {

          AlertMessage.fromRequest(err);
        });

      }
      console.log('from email>-----', res);
    } catch (e) {
      console.log('from email>-----', e.code);
      // e.code may be 'cannotSendMail' || 'cancelled' || 'saved' || 'failed'
    }
  }
  onSendSMS = (data) => {
    const { referralCodeInfo } = this.props.setting;
    const name = data.full_name;
    const numberData = [{
      phone: data.phone,
      first_name: data.full_name,
      last_name: ''
    }];

    const payloadData = {
      code: referralCodeInfo.user_friend_code.code,
      type: 'phone',
      users: numberData
    };

    SendSMS.send({
      body: `https://refer.openmed.com/Mhig9fZEnN?code=${referralCodeInfo.user_friend_code.code}`,
      recipients: [data.phone],
      successTypes: ['sent', 'queued']
    }, (completed, cancelled, error) => {

      if (completed) {
        const { setReferralCode } = this.props;

        promisify(setReferralCode, payloadData).then((status) => {

          if (status === 200) {
            AlertMessage.showMessage('OpenMed', name + I18n.t('resendSuccess'));
            this.updateData(1, true);
          }
        }).catch((err) => {
          AlertMessage.fromRequest(err);
        });
      }

      if (cancelled) {
        AlertMessage.showMessage('OpenMed', 'you have cancelled invitation');
      }

      if (error) {
        // eslint-disable-next-line max-len
        console.log(`SMS Callback: completed: ${completed} cancelled: ${cancelled}error: ${error}`);
      }
    });
  }

  onIniviteItemClick = (item) => {
    this.item = item;
    console.log(item.title);
    this.ActionSheet.show();
  }

  onRewardOption = () => {
    return (
      <View style={{
        borderRadius: 5,
        margin: 10,
        backgroundColor: WHITE,
        borderColor: BORDERLINE,
        borderWidth: 0.5
      }}
      >

        <View style={{
          height: 50,
          alignItems: 'center',
          padding: 10,
          flexDirection: 'row',
          width: '100%'
        }}
        >
          <OMImage
            style={styles.giftIconImg}
            resizeMode={'contain'}
            placeholder={require('img/images/amazon_logo.png')}
          />
          <SFRegular style={[
            styles.enrnedPoint,
            { fontSize: 15, marginTop: -10, marginLeft: 25 }
          ]}
          >
            Amazon Credit
          </SFRegular>
          <TouchableOpacity
            onPress={() => this.onAmazonReward()}
            style={{
              position: 'absolute',
              top: 0,
              right: 15,
              bottom: 0,
              width: 20,
              backgroundColor: 'transparent',
              padding: 5,
              justifyContent: 'center'
            }}
          >
            <View style={{
              borderRadius: 6.5,
              height: 13,
              width: 13,
              borderColor: BORDERLINE,
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            >
              <View style={{
                borderRadius: 5.5,
                height: 11,
                width: 11,
                backgroundColor: this.state.selectedRewardOption === 0 ? PRIMARY_COLOR : WHITE
              }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            backgroundColor: BORDERLINE,
            height: 0.5,
          }}
        />
        <View style={{
          height: 50,
          alignItems: 'center',
          padding: 10,
          flexDirection: 'row',
          width: '100%'
        }}
        >
          <OMImage
            style={styles.openIconImg}
            resizeMode={'contain'}
            placeholder={require('img/images/openmed.png')}
          />
          <SFRegular style={[
            styles.enrnedPoint,
            { fontSize: 15, marginTop: -10, marginLeft: 25 }
          ]}
          >
            OpenMed Credit
          </SFRegular>
          <TouchableOpacity
            onPress={() => this.onOpenMedReward()}
            style={{
              position: 'absolute',
              top: 0,
              right: 15,
              bottom: 0,
              width: 20,
              backgroundColor: 'transparent',
              padding: 5,
              justifyContent: 'center'
            }}
          >
            <View style={{
              borderRadius: 6.5,
              height: 13,
              width: 13,
              borderColor: BORDERLINE,
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            >
              <View style={{
                borderRadius: 5.5,
                height: 11,
                width: 11,
                backgroundColor: this.state.selectedRewardOption === 1 ? PRIMARY_COLOR : WHITE
              }}
              />
            </View>
          </TouchableOpacity>
        </View>

      </View>
    );
  }

  updateData = (nextPage = 1, checking = false) => {
    const { getReferralHistory, auth } = this.props;
    const { history } = this.state;


    const total = history.total_count || 0;

    if (nextPage > 1 && history.data.length >= total) {
      return;
    }

    if (checking) {
      this.setState({ isChecking: true });
    }
    this.setState({
      page: nextPage
    });

    promisify(getReferralHistory, { user_id: auth.user.id, page: nextPage })
      .then((result) => {
        const newHistory = nextPage > 1
          ? {
            total_count: result.user_friends.pagination.total,
            data: [...this.state.history.data, ...result.user_friends.rows]
          }
          : {
            total_count: result.user_friends.pagination.total,
            data: result.user_friends.rows
          };
        this.setState({ history: newHistory });
      })
      .finally(() => this.setState({ isChecking: false }));

  }

  render() {
    const { isChecking } = this.state;
    const { routeBack } = this.props;
    const { data: history } = this.state.history;
    console.log(this.state.history);
    const { referralCodeInfo } = this.props.setting;
    return (
      <View style={styles.container}>
        <InviteFriendTop
          title="Redeem Rewards"
          onRightText="Redeem"
          onInvite={() => this.onRedeem()}
          onBack={routeBack}
          color={this.state.textColor}
        />

        <View style={styles.earnedPointBlock}>
          <View style={{ flexDirection: 'row' }}>
            <SFRegular style={[
              styles.enrnedPoint,
              { fontSize: 16 }
            ]}
            >
              $
            </SFRegular>
            <SFRegular style={[
              styles.enrnedPoint,
              { fontSize: 32 }
            ]}
            >
              {(referralCodeInfo) ? (referralCodeInfo.amount.new / 100).toFixed(2) : '0.00'}
            </SFRegular>
          </View>
        </View>
        <SFRegular style={{
          color: PURPLISH_GREY,
          textAlign: 'left',
          fontSize: 13.5,
          marginLeft: 10,
          marginBottom: 10
        }}
        >
          REWARD OPTIONS
        </SFRegular>
        {
          this.onRewardOption()
        }
        <SFRegular style={{
          color: PURPLISH_GREY,
          textAlign: 'left',
          fontSize: 13.5,
          marginLeft: 10,
          marginBottom: 10,
          marginTop: 40
        }}
        >
          INVITE HISTORY
        </SFRegular>
        <View style={{ flex: 1 }}>
          <View style={{
            borderRadius: 5,
            margin: 10,
            backgroundColor: WHITE,
            borderColor: BORDERLINE,
            borderWidth: 0.5
          }}
          >
            <FlatList
              style={styles.flex}
              data={history}
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.updateData(1, false)}
              onEndReachedThreshold={0}
              onEndReached={() => {
                this.updateData(this.state.page + 1, false);
              }}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => {
                return (
                  <View
                    style={{
                      backgroundColor: BORDERLINE,
                      height: 0.5,
                    }}
                  />
                );
              }}
              renderItem={({ item }) => {
                let status = '';
                if (item.status === 0) {
                  status = 'Invite Sent';
                } else if (item.status === 1) {
                  status = 'Account Created';
                } else if (item.status === 2) {
                  status = 'Attended Appointment($25)';
                } else if (item.status === 3) {
                  status = 'Appoinment Paid';
                }
                return (
                  <TouchableOpacity
                    onPress={() => this.onIniviteItemClick(item)}
                    style={{
                      height: 60,
                      padding: 10,
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <View style={{ height: 60, justifyContent: 'center' }}>
                      <SFRegular style={{
                        color: TEXT,
                        textAlign: 'left',
                        fontSize: 15,
                      }}
                      >
                        {item.first_name}
                      </SFRegular>
                      <SFRegular style={{
                        color: LINE,
                        textAlign: 'left',
                        fontSize: 12,
                      }}
                      >
                        { moment(item.updated_at).format('DD/MM/YY')}
                      </SFRegular>
                    </View>
                    <View style={{
                      height: 60,
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      flex: 1,
                      paddingRight: 10
                    }}
                    >
                      <SFRegular style={{
                        color: item.status === 2 ? PRIMARY_COLOR : LINE,
                        textAlign: 'left',
                        fontSize: 12,
                      }}
                      >
                        {status}
                      </SFRegular>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={({ index }) => index}
            />
          </View>
        </View>
        {this.onAction()}
        {isChecking && <Loading showOverlay={true} />}
      </View>
    );
  }
}

RedeemContainer.propTypes = {
  // routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  getReferralHistory: PropTypes.func.isRequired,
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectInsurance(),
  connectSetting()
)(RedeemContainer);
