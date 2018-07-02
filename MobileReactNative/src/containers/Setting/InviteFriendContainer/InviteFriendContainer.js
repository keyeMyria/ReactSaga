// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SectionList,
  Platform,
  Text,
} from 'react-native';
import { connectAuth, connectPatient, connectInsurance, connectSetting } from 'AppRedux';
import {
  PRIMARY_COLOR,
  PURPLISH_GREY,
  SILVER,
  WHITE,
  TEXT,
  GREEN,
  SOLID_COLOR,
} from 'AppColors';
import {
  InviteFriendTop,
  Loading,
  OMImage,
  ContactListItem,
  EmailListItem
} from 'AppComponents';
import { compose } from 'recompose';
import { SFRegular, SFMedium, SFSemiBold } from 'AppFonts';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import { getContacts, requestContactsAccess, AlertMessage, promisify } from 'AppUtilities';
import TagInput from 'react-native-tag-input';
import SendSMS from 'react-native-sms';
import MailCompose from 'react-native-mail-compose';
import I18n from 'react-native-i18n';

const isIOS = Platform.OS === 'ios';

const inputProps = {
  keyboardType: 'default',
  placeholder: 'Enter name or Phone Number',
  autoFocus: false,
  style: {
    fontSize: 14,
    marginVertical: Platform.OS === 'ios' ? 10 : -2,
  },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: SILVER,
    flex: 1
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
  inviteInfoBlock: {
    backgroundColor: PRIMARY_COLOR,
    height: 136,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40
  },
  inviteInfoText: {
    color: '#FFF',
    textAlign: 'center',
  },
  userCodeBlock: {
    borderColor: WHITE,
    borderWidth: 1,
    width: 117,
    height: 30,
    backgroundColor: 'transparent',
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  userCodeText: {
    color: WHITE,
    textAlign: 'center',
    fontSize: 14
  },
  inviteOptionOuterBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40
  },
  inviteOptionBlock: {
    height: 200,
    width: 200,
    alignItems: 'center'
  },
  giftIconImg: {
    height: 46,
    width: 41
  },
  shareInviteText: {
    color: TEXT,
    fontSize: 16,
    marginTop: 10
  },
  shareOptionOuterBlock: {
    marginTop: 20,
    flexDirection: 'row'
  },
  shareOptionBlock: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  smsImg: {
    height: 23,
    width: 22
  },
  emailIconBlock: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center'
  },
  SectionHeaderStyle: {
    backgroundColor: SOLID_COLOR,
    fontSize: 12,
    paddingLeft: '3%',
    color: TEXT,
  },
  alphabet: {
    position: 'absolute',
    top: 20,
    right: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'transparent',
    padding: 5,
    color: TEXT,
    justifyContent: 'center'
  }
});

class InviteFriendContainer extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isChecking: true,
      data: [],
      emailData: [],
      // text: '',
      // sectionHeader: true,
      searchInput: true,
      searchInputTop: false,
      inviteOption: true,
      earnedOption: true,
      tags: [],
      text2: '',
      useInvite: 'sms',
      referCode: false
      // emailSelect: false
    };
    this.mainContactList = [];
    this.checkContact = [];
    this.contactsLists = [];
    this.header = [];
    this.contacts = [];
    this.emailLists = [];
    this.mainEmailLists = [];
    this.emailheader = [];
    this.temp = '';
    this.emails = [];
    this.updateContacts = [];
    this.isUnifiedContactsSupported = DeviceInfo.getSystemVersion() &&
      parseInt(DeviceInfo.getSystemVersion(), 10) >= 9;
  }

  onChangeTags = (tags) => {
    const item = _.difference(this.state.tags, tags);
    const obj = { name: item[0] };
    this.onContactClicked(obj);
    this.setState({ tags });
  }

  onChangeText = (text) => {
    this.setState({ text2: text });

    const lastTyped = text.charAt(text.length - 1);
    const parseWhen = [',', ' ', ';', '\n'];

    if (parseWhen.indexOf(lastTyped) > -1) {
      this.setState({
        tags: [...this.state.tags, this.state.text2],
        text2: '',
      });
    }
  }

  labelExtractor = tag => tag;

  componentDidMount() {
    if (!this.state.referCode) {
      promisify(this.props.getReferralCode, null).then(() => {
        this.setState({ isChecking: false });
      }).catch((error) => {
        AlertMessage.fromRequest(error);
      });
    }
    const updateContacts = (contacts) => {
      try {
        this.updateContacts = contacts;
        this.setData(this.updateContacts);
      } catch (error) {
        console.log(error);
      }
    };

    const findContacts = () => getContacts()
      .then((contacts = []) => {

        updateContacts(contacts);
      });

    if (isIOS) {
      getContacts()
        .then((contacts = []) => {

          updateContacts(contacts);
        })
        .catch(() => requestContactsAccess(this.props.routeBack, findContacts));
    } else {
      requestContactsAccess(this.props.routeBack, findContacts);
    }
  }

  setData = (contacts) => {
    console.log(contacts);
    const emailArr = [];
    // CREATE CONTACT ARRAY WITH NAME AND NUMBER
    // const filteredContacts = contacts.filter(c => c.phoneNumbers.length !== 0);

    this.contactsLists = contacts.map((item) => {

      const {
        givenName, fullName, familyName, middleName
      } = item;
      const mobileArr = item.phoneNumbers;
      // const mobileNum = mobileArr.filter(m => m.label === 'mobile');
      let mobileNum = [];
      let emailAdd = [];
      let number;

      // const mobileNum = mobileArr.filter(m => m.label === 'mobile');
      if (Platform.OS === 'ios') {
        mobileNum = _.filter(mobileArr, { label: 'Mobile' });
        if (mobileNum.length === 0) {
          mobileNum = _.filter(mobileArr, { label: 'Home' });
        }
      } else {
        mobileNum = _.filter(mobileArr, { label: 'mobile' });
        if (mobileNum.length === 0) {
          mobileNum = _.filter(mobileArr, { label: 'home' });
        }
      }
      if (Platform.OS === 'ios') {
        emailAdd = _.filter(item.emailAddresses, { label: 'Work' });
        if (emailAdd.length === 0) {
          emailAdd = _.filter(item.emailAddresses, { label: 'Home' });
        }
      } else {
        emailAdd = _.filter(item.emailAddresses, { label: 'work' });
        if (emailAdd.length === 0) {
          emailAdd = _.filter(item.emailAddresses, { label: 'home' });
        }
      }

      let Name = '';
      let firstName = '';
      let lastName = '';
      let midName = '';
      if (Platform.OS === 'ios') {
        if (givenName) {
          firstName = givenName;
        }
        if (fullName) {
          lastName += fullName;
          Name = lastName;
        } else if (givenName) {
          Name = firstName;
        } else if (Name === '') {
          Name = mobileNum.length > 0 ? mobileNum[0].stringValue
            :
            (item.phoneNumbers) ? item.phoneNumbers[0].stringValue
              : '';
        }
      } else {
        if (givenName) {
          firstName = givenName;
        }
        if (familyName) {
          lastName = familyName;
        }
        if (middleName) {
          midName = middleName;
        }
        Name = `${firstName} ${midName} ${lastName}`;
      }

      if (emailAdd.length > 0) {
        emailArr.push({
          name: Name,
          email: isIOS ? emailAdd[0].value : emailAdd[0].email,
          check: false
        });
      }

      if (Platform.OS === 'ios') {

        number = mobileNum.length > 0 ? mobileNum[0].stringValue
          :
          (item.phoneNumbers) ? item.phoneNumbers[0].stringValue
            : 'No number found';
      } else {
        number = mobileNum.length > 0 ? mobileNum[0].number
          :
          (item.phoneNumbers.length > 0) ? item.phoneNumbers[0].number
            : 'No number found';
      }
      const mobObj = {
        name: Name.trim(),
        mobNum: number,
        check: false
      };
      return mobObj;
    });
    const obj = this.contactsLists;

    this.contactsLists = _.sortBy(this.contactsLists, ['name']);
    this.emailLists = _.sortBy(emailArr, ['name']);
    console.log(this.emailLists);


    // SORT CONTACT ARRAY BY NAME

    const contact = _.sortBy(obj, ['name']);

    // CREATE ARRAY

    // EMAIL OBJECT SET UP
    const emailHeader = this.emailLists.map(item => item.name.charAt(0).toUpperCase());
    const eHeader = _.uniq(emailHeader);
    this.emailheader = eHeader;
    let tempArr = [];
    const emailList = eHeader.map((index) => {
      tempArr = [];
      tempArr = this.emailLists.filter(item => item.name.charAt(0).toUpperCase() === index);
      return tempArr;
    });

    this.mainEmailLists = eHeader.map((index, i) => {
      const temp = {
        title: index,
        data: emailList[i]
      };
      return temp;
    });
    // CONTACT OBJECT SET UP
    // IF CONTACT HAS ONLY NUMBER
    const tempHeader = ['(', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const contactHeader = contact.map((item) => {
      const tempH = tempHeader.filter(i => item.name.charAt(0).toUpperCase() === i);
      if (tempH.length > 0) {
        return '#';
      }
      return item.name.charAt(0).toUpperCase();
    });
    console.log(contactHeader);
    console.log(obj);
    const header = _.uniq(contactHeader);
    let g = [];

    this.header = header;
    const contactList = header.map((index) => {
      g = [];
      if (index === '#') {
        g = obj.filter(item => tempHeader.includes(item.name.charAt(0).toUpperCase()));
      } else {
        g = obj.filter(item => item.name.charAt(0).toUpperCase() === index);
      }
      return g;
    });
    this.mainContactList = header.map((index, i) => {
      const temp = {
        title: index,
        data: contactList[i]
      };
      return temp;
    });

    this.setState({ data: this.mainContactList, emailData: this.mainEmailLists });
  }

  onInvite = () => {
    const { setting } = this.props;
    const { referralCodeInfo } = setting;

    if (this.contacts.length > 0 || this.emails.length > 0) {

      if (this.state.useInvite === 'sms') {
        const numArray = this.contacts.map(data => data.mobNum);

        const numberData = this.contacts.map((data) => {
          return {
            phone: data.mobNum,
            first_name: data.name,
            last_name: ''
          };
        });

        const payloadData = {
          code: referralCodeInfo.user_friend_code.code,
          type: 'phone',
          users: numberData
        };

        SendSMS.send({
          body: `https://refer.openmed.com/Mhig9fZEnN?code=${referralCodeInfo.user_friend_code.code}`,
          recipients: numArray,
          successTypes: ['sent', 'queued']
        }, (completed, cancelled, error) => {

          if (completed) {
            const { setReferralCode } = this.props;

            promisify(setReferralCode, payloadData).then((status) => {

              if (status === 200) {
                AlertMessage.showMessage('OpenMed', I18n.t('invitationSuccess'));
                this.setData(this.updateContacts);
                this.setState({
                  searchInput: true,
                  searchInputTop: false,
                  inviteOption: true,
                  earnedOption: true,
                  tags: [],
                  text2: '',
                  useInvite: 'sms',
                  referCode: true
                });
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
      } else {
        this.sendMail();
      }
    }
  };

  onClick = () => {
    this.setState({ inviteOption: false, searchInput: false });
  };
  keyExtractor = (item) => {
    return item.recordID;
  };

  SearchFilterFunction=(text) => {

    console.log(this.checkContact);
    let searchContact = '';
    const arr = text.split(',');
    const lastIndex = arr.length - 1;
    searchContact = arr[lastIndex];
    if (this.state.useInvite === 'sms') {
      const newData = this.contactsLists.filter((item) => {
        const itemData = item.name.toUpperCase();
        const numData = item.mobNum.toUpperCase();
        const textData = searchContact.toUpperCase();
        return itemData.indexOf(textData) > -1 || numData.indexOf(textData) > -1;
      });
      const contactHeader = newData.map(item => item.name.charAt(0));

      const header = _.uniq(contactHeader);
      const contactList = header.map((index) => {
        let g = [];
        g = newData.filter(item => item.name.charAt(0).toUpperCase() === index);
        return g;
      });
      const mainContactList = header.map((index, i) => {
        const mobObj = {
          title: index,
          data: contactList[i]
        };
        return mobObj;
      });

      this.setState({
        data: mainContactList,
        text2: text
      });
    } else {
      const newData = this.emailLists.filter((item) => {
        const itemData = item.name.toUpperCase();
        const numData = item.email.toUpperCase();
        const textData = searchContact.toUpperCase();
        return itemData.indexOf(textData) > -1 || numData.indexOf(textData) > -1;
      });
      const contactHeader = newData.map(item => item.name.charAt(0));

      const header = _.uniq(contactHeader);
      const contactList = header.map((index) => {
        let g = [];
        g = newData.filter(item => item.name.charAt(0).toUpperCase() === index);
        return g;
      });
      const mainContactList = header.map((index, i) => {
        const mobObj = {
          title: index,
          data: contactList[i]
        };
        return mobObj;
      });

      this.setState({
        emailData: mainContactList,
        text2: text
      });
    }

  };

  renderSearchTextInput = () => {
    return (
      <View style={{
        flex: 1,
        backgroundColor: SILVER
      }}
      >
        {this.renderSearchInputUI(false)}
        <SectionList
          ref={ref => this.contactList = ref}
          sections={this.state.data}
          automaticallyAdjustScrollInset={false}
          renderSectionHeader={({ section }) => {
            return (
              <SFMedium style={styles.SectionHeaderStyle}>
                {section.title}
              </SFMedium>
            );
          }}
          renderItem={({ item }) => {
            return (
              <ContactListItem
                dataSource={item}
                onClick={this.onContactClicked}
              />
            );
          }}
          keyExtractor={(item, index) => index}
          stickySectionHeadersEnabled={true}
          removeClippedSubviews={false}
          getItemLayout={(data, index) => {
            return {
              length: data.length,
              offset: 80 * index,
              index
            };
          }}
        />

        <View style={styles.alphabet}>
          {
            this.state.searchInput ? null : this.renderalphabet()
          }
        </View>


      </View>
    );
  };

  renderSearchInputUI = (isAllowPress = true) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: WHITE,
          width: '100%',
          paddingLeft: '3%'
        }}
      >
        <Text>To: </Text>
        <TagInput
          value={this.state.tags}
          onChange={this.onChangeTags}
          labelExtractor={this.labelExtractor}
          text={this.state.text2}
          onChangeText={this.SearchFilterFunction}
          tagColor={PRIMARY_COLOR}
          tagTextColor={WHITE}
          inputProps={inputProps}
          maxHeight={75}
          inputDefaultWidth={'60%'}
        />
        {
          (!isAllowPress) &&
          <TouchableOpacity
            onPress={() => {
              this.setState({
                searchInput: true,
                earnedOption: false,
                searchInputTop: true
              });
            }}
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              position: 'absolute',
              backgroundColor: 'transparent'
            }}
          >
            <View />
          </TouchableOpacity>
        }
      </View>
    );
  }

  renderSearchTextInputWithOutHeader = () => {
    return (
      <View style={{ flex: 1 }}>
        {this.renderSearchInputUI()}
        <SectionList
          ref={ref => this.contactList = ref}
          sections={this.state.data}
          automaticallyAdjustScrollInset={false}
          renderSectionHeader={({ section }) => {
            return (
              <SFMedium style={styles.SectionHeaderStyle}>
                {section.title}
              </SFMedium>
            );
          }}
          renderItem={({ item }) => {
            return (
              <ContactListItem
                dataSource={item}
                onClick={this.onContactClicked}
              />
            );
          }}
          keyExtractor={(item, index) => index}
          stickySectionHeadersEnabled={true}
          removeClippedSubviews={false}
          getItemLayout={(data, index) => {
            return {
              length: data.length,
              offset: 80 * index,
              index
            };
          }}
        />
        <View style={styles.alphabet}>
          {
            this.state.searchInput ? null : this.renderalphabet()
          }
        </View>


      </View>
    );
  };

  renderSearchTextInputEmail = () => {
    return (
      <View style={{ flex: 1 }}>
        {this.renderSearchInputUI(false)}
        <SectionList
          ref={ref => this.mailTList = ref}
          sections={this.state.emailData}
          automaticallyAdjustScrollInset={false}
          renderSectionHeader={({ section }) => {
            return (
              <SFMedium style={styles.SectionHeaderStyle}>
                {section.title}
              </SFMedium>
            );
          }}
          renderItem={({ item }) => {
            return (
              <EmailListItem
                dataSource={item}
                onClick={this.onEmailItemClicked}
              />
            );
          }}
          keyExtractor={(item, index) => index}
          stickySectionHeadersEnabled={true}
          removeClippedSubviews={false}
          getItemLayout={(data, index) => {
            return {
              length: data.length,
              offset: 80 * index,
              index
            };
          }}
        />
        <View style={styles.alphabet}>
          { this.renderEmailAlphabet() }
        </View>

      </View>
    );
  };

  renderSearchTextInputWithoutHeaderEmail = () => {
    return (
      <View style={{ flex: 1 }}>
        {this.renderSearchInputUI()}
        <SectionList
          ref={ref => this.mailTList = ref}
          sections={this.state.emailData}
          automaticallyAdjustScrollInset={false}
          renderSectionHeader={({ section }) => {
            return (
              <SFMedium style={styles.SectionHeaderStyle}>
                {section.title}
              </SFMedium>
            );
          }}
          renderItem={({ item }) => {
            return (
              <EmailListItem
                dataSource={item}
                onClick={this.onEmailItemClicked}
              />
            );
          }}
          keyExtractor={(item, index) => index}
          stickySectionHeadersEnabled={true}
          removeClippedSubviews={false}
          getItemLayout={(data, index) => {
            return {
              length: data.length,
              offset: 80 * index,
              index
            };
          }}
        />
        <View style={styles.alphabet}>
          { this.renderEmailAlphabet() }
        </View>

      </View>
    );
  };

  onEmailItemClicked = (item) => {
    console.log(item.email);

    const i = this.state.tags.indexOf(item.name);
    if (i !== -1) {
      this.state.tags.splice(i, 1);
      this.setState({
        tags: [...this.state.tags],
        text2: '',
      });
    } else {
      this.setState({
        tags: [...this.state.tags, item.name],
        text2: '',
      });
    }
    let tempObj = {};
    for (let conList = 0; conList < this.emailLists.length; conList += 1) {
      tempObj = {};
      if (this.emailLists[conList].name === item.name) {

        this.emailLists[conList].check = !this.emailLists[conList].check;
        tempObj = this.emailLists[conList];
        break;
      }
    }

    // SORT CONTACT ARRAY BY NAME

    const contact = _.sortBy(this.emailLists, ['name']);

    // CREATE ARRAY

    const contactHeader = contact.map(conact => conact.name.charAt(0)
      .toUpperCase());
    console.log(contactHeader);
    const header = _.uniq(contactHeader);
    this.emailheader = header;
    let g = [];
    const contactList = header.map((index) => {
      g = [];
      g = this.emailLists.filter(data => data.name.charAt(0)
        .toUpperCase() === index);
      return g;
    });

    const check = this.emailLists.filter(conData => conData.check === true);
    this.mainEmailLists = header.map((index, cList) => {
      const temp = {
        title: index,
        data: contactList[cList]
      };
      return temp;
    });

    this.setState({ emailData: this.mainEmailLists });
    console.log(this.state.emailData);

    if (tempObj.check) {
      this.checkContact.push(item.name);
    } else {
      this.checkContact = this.checkContact.filter(c => c !== item.name);
    }
    this.checkContact = _.uniq(this.checkContact);
    this.emails = check;

    this.setState({
      emailData: this.mainEmailLists
    });

  }

  renderEmailAlphabet = () => {

    return (
      <View>
        <TouchableOpacity>
          <SFSemiBold style={{ fontSize: 11 }}>
            #
          </SFSemiBold>
        </TouchableOpacity>
        {
          this.mainEmailLists.map((item) => {
            return (
              <TouchableOpacity
                key={item.title}
                onPress={() => { this.onPressSectionItem(item.title, this.emailheader); }}
              >
                <SFSemiBold style={{ fontSize: 12 }}>
                  {item.title}
                </SFSemiBold>
              </TouchableOpacity>
            );
          })
        }
      </View>
    );
  };

  renderalphabet = () => {

    return (
      <View>
        {
          this.mainContactList.map((item) => {
            return (
              <TouchableOpacity
                key={item.title}
                onPress={() => { this.onPressSectionItem(item.title, this.header); }}
              >
                <SFSemiBold style={{ fontSize: 11 }}>
                  {item.title}
                </SFSemiBold>
              </TouchableOpacity>
            );
          })
        }
      </View>
    );
  };

  renderEarenedView = () => {
    const { referralCodeInfo } = this.props.setting;
    return (
      <View>
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
          <TouchableOpacity onPress={() => this.onRedeemClick()}>
            <SFRegular style={[
              styles.enrnedPoint,
              { fontSize: 14 }
            ]}
            >
              {(referralCodeInfo) ? ((referralCodeInfo.amount.new > 0) ? I18n.t('tapToRedeem') : I18n.t('earned')) : I18n.t('earned') }
            </SFRegular>
          </TouchableOpacity>
        </View>
        <View>
          <View style={styles.inviteInfoBlock}>
            <SFRegular style={styles.inviteInfoText}>
              { `${I18n.t('inviteText1')} ${(referralCodeInfo) ? (referralCodeInfo.amount.new / 100).toFixed(2) : '0.00'}\n${I18n.t('inviteText2')}`}
            </SFRegular>
            <View style={styles.userCodeBlock}>
              <SFRegular style={styles.userCodeText}>
                {(referralCodeInfo) ? referralCodeInfo.user_friend_code.code.toUpperCase() : 'xxx' }
              </SFRegular>
            </View>
          </View>
        </View>
      </View>
    );
  };

  onContactClicked = (item) => {


    if (item.mobNum === 'No number found') {
      AlertMessage.showMessage('OpenMed', `${item.name} have not any numbet`);
    } else {
      const i = this.state.tags.indexOf(item.name);
      if (i !== -1) {
        this.state.tags.splice(i, 1);
        this.setState({
          tags: [...this.state.tags],
          text2: '',
        });
      } else {
        this.setState({
          tags: [...this.state.tags, item.name],
          text2: '',
        });
      }
      let tempObj = {};
      for (let conList = 0; conList < this.contactsLists.length; conList += 1) {
        tempObj = {};
        if (this.contactsLists[conList].name === item.name) {

          this.contactsLists[conList].check = !this.contactsLists[conList].check;
          tempObj = this.contactsLists[conList];
          break;
        }
      }

      // SORT CONTACT ARRAY BY NAME

      const contact = _.sortBy(this.contactsLists, ['name']);

      // CREATE ARRAY

      const contactHeader = contact.map(conact => conact.name.charAt(0)
        .toUpperCase());
      console.log(contactHeader);
      const header = _.uniq(contactHeader);
      this.header = header;
      let g = [];
      const contactList = header.map((index) => {
        g = [];
        g = this.contactsLists.filter(data => data.name.charAt(0)
          .toUpperCase() === index);
        return g;
      });

      const check = this.contactsLists.filter(conData => conData.check === true);
      this.mainContactList = header.map((index, cList) => {
        const temp = {
          title: index,
          data: contactList[cList]
        };
        return temp;
      });
      this.setState({ data: this.mainContactList });
      console.log(this.state.data);

      if (tempObj.check) {
        this.checkContact.push(item.name);
      } else {
        this.checkContact = this.checkContact.filter(c => c !== item.name);
      }
      this.checkContact = _.uniq(this.checkContact);
      this.contacts = check;

      this.setState({
        data: this.mainContactList
      });
    }
  }

  rendetInviteOption = () => {
    return (
      <View style={styles.inviteOptionOuterBlock}>
        <View style={styles.inviteOptionBlock}>
          <OMImage
            style={styles.giftIconImg}
            resizeMode={'contain'}
            placeholder={require('img/images/gift.png')}
          />
          <SFRegular style={styles.shareInviteText}>
              Share your invite code
          </SFRegular>
          <View style={styles.shareOptionOuterBlock}>
            <TouchableOpacity
              onPress={() => {
                this.setState({ useInvite: 'sms' });
                this.onClick();
              }}
              style={styles.shareOptionBlock}
            >
              <OMImage
                style={styles.smsImg}
                resizeMode={'contain'}
                placeholder={require('img/images/sms.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.setState({ useInvite: 'email' });
                this.onClick();
                /*  this.sendMail(); */ }}
              style={styles.emailIconBlock}
            >
              <Icon name="email" color={WHITE} size={25} />
            </TouchableOpacity>
          </View>

        </View>
      </View>
    );
  };

  onRedeemClick = () => {
    const { routeScene } = this.props;

    routeScene(
      'RedeemScene',
      null,
      {
        navigatorStyle: {
          navBarHidden: true,
          tabBarHidden: true
        }
      }
    );
  }

  sendMail = async () => {

    const { setting } = this.props;
    const { referralCodeInfo } = setting;

    console.log(this.emails);
    const emailArray = this.emails.map(data => data.email);

    const emailData = this.emails.map((data) => {
      return {
        email: data.email,
        first_name: data.name,
        last_name: ''
      };
    });

    const payloadData = {
      code: referralCodeInfo.user_friend_code.code,
      type: 'email',
      users: emailData
    };

    // this.setState({ emailSelect: true });
    try {
      const res = await MailCompose.send({
        toRecipients: emailArray,
        // eslint-disable-next-line max-len
        subject: 'Invite Friends from OpenMed',
        text: `https://refer.openmed.com/Mhig9fZEnN?code=${referralCodeInfo.user_friend_code.code}`,
        html: `https://refer.openmed.com/Mhig9fZEnN?code=${referralCodeInfo.user_friend_code.code}`
      });

      if (res === 'sent') {
        const { setReferralCode } = this.props;

        promisify(setReferralCode, payloadData).then((status) => {

          if (status === 200) {
            AlertMessage.showMessage('OpenMed', I18n.t('invitationSuccess'));
            this.setData(this.updateContacts);
            this.setState({
              searchInput: true,
              searchInputTop: false,
              inviteOption: true,
              earnedOption: true,
              tags: [],
              text2: '',
              useInvite: 'sms',
              referCode: true
            });
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

  onPressSectionItem = (key, alphabets) => {
    const iIndex = alphabets.indexOf(key);

    if (this.state.useInvite === 'sms') {
      this.contactList.scrollToLocation({
        sectionIndex: iIndex,
        itemIndex: -1,
        animated: true
      });
    } else {
      this.mailTList.scrollToLocation({
        sectionIndex: iIndex,
        itemIndex: -1,
        animated: true
      });
    }
  }

  renderOption = () => {
    return (
      <View>
        {
          this.state.searchInputTop && this.renderSearchTextInputEmail()
        }
        {
          this.state.earnedOption && this.renderEarenedView()
        }
        {
          !this.state.searchInput && this.renderSearchTextInput()
        }
        {
          this.state.inviteOption && this.rendetInviteOption()
        }
      </View>
    );
  }

  render() {
    const { isChecking } = this.state;
    const { routeBack } = this.props;
    return (
      <View style={styles.container}>
        <InviteFriendTop
          title="Invite Friends"
          onRightText="Invite"
          onInvite={() => this.onInvite()}
          onBack={routeBack}
        />
        {
          // eslint-disable-next-line max-len
          this.state.searchInputTop ? this.state.useInvite === 'sms' ? this.renderSearchTextInputWithOutHeader() : this.renderSearchTextInputWithoutHeaderEmail() : null
        }
        {
          this.state.earnedOption && this.renderEarenedView()
        }
        {
          // eslint-disable-next-line max-len
          !this.state.searchInput ? this.state.useInvite === 'sms' ? this.renderSearchTextInput() : this.renderSearchTextInputEmail() : null
        }
        {
          this.state.inviteOption && this.rendetInviteOption()
        }
        {isChecking && <Loading showOverlay={true} />}
      </View>
    );

  }
}

InviteFriendContainer.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired
};

export default compose(
  connectAuth(),
  connectPatient(),
  connectInsurance(),
  connectSetting()
)(InviteFriendContainer);
