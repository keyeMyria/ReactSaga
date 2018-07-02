import {StyleSheet} from 'react-native'
import { Fonts, Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 25,
    marginTop: Metrics.baseMargin,
    backgroundColor: Colors.snow,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignSelf: 'center',
    width: Metrics.screenWidth - Metrics.doubleBaseMargin
  },
  searchInput: {
    ...Fonts.style.description,
    fontSize: 14,
    flex: 5,
    height: Metrics.searchBarHeight,
    alignSelf: 'center',
    padding: Metrics.smallMargin,
    textAlign: 'left',
    paddingLeft: Metrics.baseMargin,
    color: Colors.text,
    flexDirection: 'row'
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
