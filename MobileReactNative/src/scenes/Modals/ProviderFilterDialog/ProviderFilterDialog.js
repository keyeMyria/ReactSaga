// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ListView,
  TouchableOpacity
} from 'react-native';
import I18n from 'react-native-i18n';
import { TEXT, TINT, BORDER, SNOW, BLACK, LIGHT_GRAY } from 'AppColors';
import { WINDOW_WIDTH, WINDOW_HEIGHT, ROOT_PADDING_TOP } from 'AppConstants';
import { SearchBar, NormalButton } from 'AppComponents';
import { connectInsurance, connectProvider } from 'AppRedux';
import { SFRegular, SFMedium, SFBold } from 'AppFonts';
import { dismissKeyboard } from 'AppUtilities';
import { compose } from 'recompose';
import { filter, flatten, map, find, get, uniqBy } from 'lodash';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
  container: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  leftContainer: {
    height: WINDOW_HEIGHT,
    width: WINDOW_WIDTH * 0.1,
    backgroundColor: 'transparent'
  },
  containerContent: {
    height: WINDOW_HEIGHT,
    width: WINDOW_WIDTH * 0.9,
    backgroundColor: SNOW,
    paddingBottom: ROOT_PADDING_TOP
  },
  buttonsTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginTop: ROOT_PADDING_TOP
  },
  title: {
    fontSize: 16,
    color: TEXT,
    alignSelf: 'center',
    marginVertical: 10
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    height: 40,
    alignItems: 'center'
  },
  tab: {
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    height: 40,
    justifyContent: 'center'
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: TINT,
    height: 40,
    justifyContent: 'center'
  },
  tabText: {
    color: TEXT,
    fontSize: 10
  },
  activeTabText: {
    color: TINT,
    fontSize: 10
  },
  hr: {
    width: WINDOW_WIDTH * 0.9,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginTop: 10
  },
  specialty: {
    paddingHorizontal: 20,
    flex: 1,
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center'
  },
  specialtyText: {
    color: TEXT,
    flex: 1
  },
  button: {
    width: WINDOW_WIDTH * 0.35,
    marginHorizontal: 10
  },
  textStyle: {
    fontFamily: 'SFUIText-Bold',
  },
  normalTextStyle: {
    fontFamily: 'SFUIText-Bold',
    color: TINT
  }
});

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

export class ProviderFilterDialog extends PureComponent {

  constructor(props) {
    super(props);
    const { insurance, provider } = props;

    const specialties = uniqBy(flatten(map(get(insurance, 'specialties.specialty_categories', []),
      'specialties')), 'id');
    const specialty = find(specialties, { id: provider.filter.specialtyId });

    const categories = get(insurance, 'specialties.specialty_categories', []);
    const category = find(categories, { id: provider.filter.specialtyCategoryId });

    this.state = {
      activeTab: provider.filter.sortBy,
      specialtyId: provider.filter.specialtyId,
      specialtyCategoryId: provider.filter.specialtyCategoryId,
      searchText: specialty ? specialty.name : category ? category.name : '',
      specialties,
      categories,
      type: category ? 1 : 0
    };
  }

  onSave = () => {
    const { setFilter, dismissLightBox, onStartOver } = this.props;

    setFilter({
      sortBy: this.state.activeTab,
      specialtyId: this.state.specialtyId,
      specialtyCategoryId: this.state.specialtyCategoryId,
    });

    if (onStartOver) {
      onStartOver();
    } else {
      dismissLightBox();
    }
  };

  setSpecialty = (specialty) => {
    this.setState({
      specialtyId: this.state.specialtyId === specialty.id
        ? null
        : specialty.id,
      specialtyCategoryId: null
    });
  };

  setSpecialtyCategory = (specialtyCategory) => {
    this.setState({
      specialtyCategoryId: this.state.specialtyCategoryId === specialtyCategory.id
        ? null
        : specialtyCategory.id,
      specialtyId: null
    });
  };

  changeTab = (tab) => {
    dismissKeyboard();

    this.setState({ activeTab: tab });
  };

  render() {
    const { dismissLightBox, insurance, onStartOver } = this.props;
    const { type } = this.state;

    let finalData = [];

    if (type === 0) {
      finalData = this.state.searchText
        ? filter(this.state.specialties, specialty =>
          specialty.name.toLowerCase().includes(this.state.searchText.toLowerCase())
        )
        : get(insurance, 'specialties.popular_specialties', []);
    } else {
      finalData = this.state.searchText
        ? filter(this.state.categories, cat =>
          cat.name.toLowerCase().includes(this.state.searchText.toLowerCase())
        )
        : get(insurance, 'specialties.popular_specialty_categories', []);
    }


    return (
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => dismissLightBox()}>
            <View style={styles.leftContainer} />
          </TouchableOpacity>
          <View style={styles.containerContent}>
            <View style={styles.buttonsTop}>
              <NormalButton
                text={I18n.t('startOver').toUpperCase()}
                style={styles.button}
                textStyle={styles.normalTextStyle}
                onPress={() => {
                  if (onStartOver) {
                    onStartOver();
                  } else {
                    dismissLightBox();
                  }
                }}
                borderWidth={1}
              />
              <NormalButton
                text={I18n.t('done').toUpperCase()}
                style={styles.button}
                textStyle={styles.textStyle}
                pressed={true}
                onPress={() => this.onSave()}
                dropShadow={false}
              />
            </View>
            <SFMedium allowFontScaling={false} style={styles.title}>{I18n.t('sort')}</SFMedium>
            <View style={styles.tabs}>
              <TouchableOpacity onPress={() => this.changeTab('closest')}>
                <View style={this.state.activeTab === 'closest' ? styles.activeTab : styles.tab}>
                  <SFBold
                    allowFontScaling={false}
                    style={this.state.activeTab === 1
                      ? styles.activeTabText
                      : styles.tabText}
                  >
                    {I18n.t('closestMatch').toUpperCase()}
                  </SFBold>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.changeTab('distance')}>
                <View style={this.state.activeTab === 'distance' ? styles.activeTab : styles.tab}>
                  <SFBold
                    allowFontScaling={false}
                    style={this.state.activeTab === 2
                      ? styles.activeTabText
                      : styles.tabText}
                  >
                    {I18n.t('distance').toUpperCase()}
                  </SFBold>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.changeTab('name')}>
                <View style={this.state.activeTab === 'name' ? styles.activeTab : styles.tab}>
                  <SFBold
                    allowFontScaling={false}
                    style={this.state.activeTab === 3
                      ? styles.activeTabText
                      : styles.tabText}
                  >
                    A-Z
                  </SFBold>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.changeTab('rating')}>
                <View style={this.state.activeTab === 'rating' ? styles.activeTab : styles.tab}>
                  <SFBold
                    allowFontScaling={false}
                    style={this.state.activeTab === 4
                      ? styles.activeTabText
                      : styles.tabText}
                  >
                    {I18n.t('rating').toUpperCase()}
                  </SFBold>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10
              }}
            >
              <TouchableOpacity onPress={() => this.setState({ type: 0 })}>
                <SFMedium
                  allowFontScaling={false}
                  style={[styles.title, { color: type === 0 ? BLACK : LIGHT_GRAY }]}
                >
                  {I18n.t('specialty')}
                </SFMedium>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setState({ type: 1 })}>
                <SFMedium
                  allowFontScaling={false}
                  style={[styles.title, { marginLeft: 20, color: type === 1 ? BLACK : LIGHT_GRAY }]}
                >
                  {I18n.t('category')}
                </SFMedium>
              </TouchableOpacity>
            </View>
            <SearchBar
              grey
              style={{ width: WINDOW_WIDTH * 0.9 - 20 }}
              searchTerm={this.state.searchText}
              onChangeText={(searchText) => this.setState({ searchText })}
              onCancel={() => this.setState({ searchText: '' })}
            />
            <View style={styles.hr} />
            <KeyboardAwareScrollView>
              <ListView
                dataSource={ds.cloneWithRows(finalData)}
                enableEmptySections
                renderRow={(item) => (
                  <TouchableOpacity
                    onPress={() => {
                      if (type === 0) {
                        this.setSpecialty(item);
                      } else {
                        this.setSpecialtyCategory(item);
                      }
                    }}
                    style={styles.specialty}
                  >
                    <SFRegular allowFontScaling={false} style={styles.specialtyText}>
                      {item.name}
                    </SFRegular>
                    {((this.state.specialtyId === item.id && type === 0)
                      || (this.state.specialtyCategoryId === item.id && type === 1))
                      ? <Icon name={'ios-checkmark'} size={40} color={TINT} />
                      : null}
                  </TouchableOpacity>
                )}
              />
            </KeyboardAwareScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

ProviderFilterDialog.propTypes = {
  routeScene: PropTypes.func.isRequired,
  routeBack: PropTypes.func.isRequired,
  onStartOver: PropTypes.func,
  dismissLightBox: PropTypes.func.isRequired,
  insurance: PropTypes.object.isRequired,
  provider: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
};

export default compose(
  connectInsurance(),
  connectProvider()
)(ProviderFilterDialog);
