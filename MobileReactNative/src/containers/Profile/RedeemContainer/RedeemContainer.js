// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { connectAuth, connectPatient, connectInsurance } from 'AppRedux';
import { SILVER, PURPLISH_GREY, WHITE, BORDERLINE, LINE, TEXT, PRIMARY_COLOR } from 'AppColors';
import {
  Panel,
  InviteFriendTop,
  Loading,
  OMImage,
  ActionSheet
} from 'AppComponents';
import { compose } from 'recompose';
import { SFRegular } from 'AppFonts';
import I18n from 'react-native-i18n';

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
});

class RedeemContainer extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isChecking: false,
      textColor: true,
      viewColor: false
    };
  }

  onRedeem = () => {
    this.setState({ textColor: !this.state.textColor});

  };

  onAmazonReward = () => {
    this.setState({ viewColor: !this.state.viewColor });

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
        }, 300)}
      />
    );
  }

  onIniviteItemClick = (item) => {
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
                backgroundColor: this.state.viewColor ? PRIMARY_COLOR : WHITE
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
                backgroundColor: this.state.viewColor ? PRIMARY_COLOR : WHITE
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
                backgroundColor: this.state.viewColor ? PRIMARY_COLOR : WHITE
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
                backgroundColor: this.state.viewColor ? PRIMARY_COLOR : WHITE
              }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  render() {
    const { isChecking } = this.state;
    const { routeBack } = this.props;
    const data = [
      {
        title: 'first',
        date: 'sent 2/3/1078',
      },
      {
        title: 'second',
        date: 'sent 2/3/1078',
      },
      {
        title: 'third',
        date: 'sent 2/3/1078',
      },
      {
        title: 'fourth',
        date: 'sent 2/3/1078',
      },
      {
        title: 'fifth',
        date: 'sent 2/3/1078',
      },
      {
        title: 'sixth',
        date: 'sent 2/3/1078',
      },
      {
        title: 'seventh',
        date: 'sent 2/3/1078',
      },
      {
        title: 'fifth',
        date: 'sent 2/3/1078',
      },
      {
        title: 'sixth',
        date: 'sent 2/3/1078',
      },
      {
        title: 'seventh',
        date: 'sent 2/3/1078',
      },
    ];
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
              50.00
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
          this.state.viewColor ? this.onRewardOption() : <Panel>

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
                    backgroundColor: this.state.viewColor ? PRIMARY_COLOR : WHITE
                  }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </Panel>
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
              data={data}
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
                        {item.title}
                      </SFRegular>
                      <SFRegular style={{
                        color: LINE,
                        textAlign: 'left',
                        fontSize: 12,
                      }}
                      >
                        {item.date}
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
                        color: LINE,
                        textAlign: 'left',
                        fontSize: 12,
                      }}
                      >
                        {item.date}
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
  routeBack: PropTypes.func.isRequired
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectInsurance()
)(RedeemContainer);
