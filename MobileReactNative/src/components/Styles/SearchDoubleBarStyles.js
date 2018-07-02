import {StyleSheet} from 'react-native'
import { Fonts, Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  container: {
    height: 100,
    borderRadius: 20,
    marginTop: Metrics.baseMargin,
    backgroundColor: Colors.snow,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'center',
    width: Metrics.screenWidth - Metrics.doubleBaseMargin
  },
  row: {
    flexDirection: 'row',
    flex: 1
  },
  hr: {
    height: 1,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: Colors.border
  },
  searchInput: {
    ...Fonts.style.description,
    fontSize: 14,
    flex: 1,
    // height: Metrics.searchBarHeight,
    alignSelf: 'center',
    padding: Metrics.smallMargin,
    textAlign: 'left',
    paddingLeft: Metrics.baseMargin,
    color: Colors.text
    // flexDirection: 'row'
  },
  placeholder: {
    color: Colors.steel
  },
  searchIcon: {
    marginLeft: Metrics.doubleBaseMargin,
    alignSelf: 'center',
    color: Colors.tint,
    backgroundColor: Colors.transparent
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: Metrics.icons.small,
    marginRight: Metrics.doubleBaseMargin
    // backgroundColor: 'grey'
  },
  removeIcon: {
    // right: Metrics.baseMargin,
    alignSelf: 'center',
    color: Colors.tint,
    backgroundColor: Colors.transparent
  }
})
