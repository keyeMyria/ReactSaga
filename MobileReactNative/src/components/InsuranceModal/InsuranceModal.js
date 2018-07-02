// flow

import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  SectionList,
  Platform
} from 'react-native';
import { Colors } from '../../Themes/';
import styles from '../Styles/InsuranceModalStyle';
import { SearchBar } from '../SearchBar';
import Hr from '../Hr';
import I18n from 'react-native-i18n';
import _ from 'lodash';
import { ROOT_PADDING_TOP } from 'AppConstants';
import AtoZList from 'react-native-atoz-list';

export class InsuranceModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      searchText: ''
    };
  }

  // componentDidMount() {
  //   setTimeout(() => {
  //     this.setState({ searchText: '' });
  //   }, 3000);
  // }

  show = () => {
    this.setState({ visible: true });
  };

  onPressPlan = (row) => {
    const insurance = _.find(this.props.insurances, { id: row.insuranceId });
    const plan = insurance ? _.find(insurance.insurance_plans, { id: row.planId }) : null;
    const insuranceText = insurance && plan
      ? `${insurance.name}/${plan.name}`
      : row.medicaid
        ? I18n.t('medicaid')
        : row.medicare
          ? I18n.t('medicare')
          : row.self_pay
            ? I18n.t('iAmSelfPaying')
            : I18n.t('none');

    const data = {
      insurance,
      plan,
      medicaid: row.medicaid,
      medicare: row.medicare,
      self_pay: row.self_pay,
      insuranceText
    };

    this.props.onSelectInsurance(data);
    this.setState({ visible: false, text: '', searchText: '' });
  };

  renderRow = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => this.onPressPlan(item)}>
        <View style={styles.warpRowItem}>
          {item.name &&
            <Text
              allowFontScaling={false}
              style={styles.rowItem}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          }
          {item.insuranceName &&
            <Text
              allowFontScaling={false}
              style={styles.rowItem}
              numberOfLines={1}
            >
              {item.insuranceName}
            </Text>
          }
          {item.planName &&
            <Text
              allowFontScaling={false}
              style={styles.rowItemSubLabel}
              numberOfLines={1}
            >
              {item.planName}
            </Text>
          }
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const insurances = _.sortBy(this.props.insurances, 'name');
    const staticChoices = [];

    // eslint-disable-next-line max-len
    if (!this.state.searchText || I18n.t('iAmSelfPaying').toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1) {
      staticChoices.push({ name: I18n.t('iAmSelfPaying'), self_pay: true });
    }

    // eslint-disable-next-line max-len
    if (!this.state.searchText || I18n.t('medicaid').toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1) {
      staticChoices.push({ name: I18n.t('medicaid'), medicaid: true });
    }

    // eslint-disable-next-line max-len
    if (!this.state.searchText || I18n.t('medicare').toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1) {
      staticChoices.push({ name: I18n.t('medicare'), medicare: true });
    }

    const insurancePlans = staticChoices.length ? { '#': staticChoices } : {};
    for (const ins of insurances) {
      for (const iPlan of ins.insurance_plans) {
        const row = {
          insuranceId: ins.id,
          planId: iPlan.id,
          // name: `${ins.name} / ${iPlan.name}`,
          insuranceName: ins.name,
          planName: iPlan.name
        };

        // eslint-disable-next-line max-len
        if (!this.state.searchText
          || row.insuranceName.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1
          || row.planName.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1
        ) {
          const key = row.insuranceName[0].toUpperCase();
          insurancePlans[key] = insurancePlans[key] || [];
          insurancePlans[key].push(row);
        }
      }
    }

    const newData = [];
    const dataKeys = [];

    Object.keys(insurancePlans).forEach(key => {
      dataKeys.push(key);
      newData.push({ data: insurancePlans[key], title: key });
    });

    const onPressSectionItem = (index) => {
      this._listView.scrollToLocation({ sectionIndex: index, itemIndex: 0, animated: true });
    };

    return (
      <Modal
        visible={this.state.visible}
        animationDuration={1}
        style={styles.modal}
        transparent
        onRequestClose={() => this.setState({ visible: false, searchText: false })}
      >
        <TouchableWithoutFeedback
          onPress={() => this.setState({ visible: false, searchText: false })}
        >
          <View style={styles.container}>
            <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardStyle} >
              <TouchableWithoutFeedback onPress={() => null} >
                <View
                  style={[styles.warpContent,
                    { marginTop: ROOT_PADDING_TOP, marginBottom: ROOT_PADDING_TOP }
                  ]}
                >
                  <SearchBar
                    onChangeText={(searchText) => this.setState({ searchText })}
                    onSearch={() => null}
                    onCancel={() => this.setState({ searchText: '' })}
                    style={styles.searchBar}
                    placeholder={I18n.t('findAnInsuranceProvider')}
                  />
                  <View style={{ flex: 1, paddingVertical: 20 }}>
                    <SectionList
                      ref={ref => this._listView = ref}
                      renderItem={this.renderRow}
                      renderSectionHeader={({ section }) =>
                        <Text allowFontScaling={false} style={styles.headerList}>
                          {section.title}
                        </Text>
                      }
                      sections={newData}
                      keyExtractor={(item) => {
                        if (item.name) {
                          return `#${item.insuranceId}:${item.planId}:${item.name}`;
                        }
                        // eslint-disable-next-line
                        return `#${item.insuranceId}:${item.planId}:${item.insuranceName}:${item.planName}`;
                      }}
                      stickySectionHeadersEnabled={true}
                      getItemLayout={(data, index) => {
                        return { length: data.length, offset: 50 * index, index };
                      }}
                    />
                    {/*<View style={styles.sectionItemView}>*/}
                      {/*{dataKeys.map((key, index) => {*/}
                        {/*return (*/}
                          {/*<TouchableOpacity*/}
                            {/*style={{ marginTop: Platform.OS === 'android' ? -3 : 0 }}*/}
                            {/*key={key}*/}
                            {/*onPress={() => onPressSectionItem(index)}*/}
                            {/*hitSlop={{ left: 6, right: 6, top: 2, bottom: 2 }}*/}
                          {/*>*/}
                            {/*<Text style={styles.sectionItemLabel}>*/}
                              {/*{key}*/}
                            {/*</Text>*/}
                          {/*</TouchableOpacity>*/}
                        {/*);*/}
                      {/*})}*/}
                    {/*</View>*/}
                    {/*<AtoZList*/}
                      {/*renderSection={(data) =>*/}
                        {/*<Text allowFontScaling={false} style={styles.headerList}>*/}
                          {/*{data.sectionId}*/}
                        {/*</Text>*/}
                      {/*}*/}
                      {/*data={insurancePlans}     // required array|object*/}
                      {/*renderCell={this.renderRow} // required func*/}
                      {/*cellHeight={50}      // required number*/}
                      {/*sectionHeaderHeight={20}*/}
                      {/*style={{ padding: 20 }}*/}
                    {/*/>*/}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}
