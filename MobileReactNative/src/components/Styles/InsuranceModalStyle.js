import { StyleSheet, Platform } from 'react-native';
import { Metrics, Colors, Fonts } from '../../Themes/';
import { STATUSBAR_HEIGHT } from 'AppConstants';

export default StyleSheet.create({
  // war
  modal: {
    flex: 1,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'red'
  },
  container: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    width: Metrics.screenWidth,
    height: Metrics.screenHeight,
    ...Platform.select({
      ios: {
        paddingBottom: STATUSBAR_HEIGHT,
      },
      android: {
        paddingBottom: 50
      }
    })
  },
  warpContent: {
    flex: 1,
    width: Metrics.screenWidth - 40,
    backgroundColor: '#fff',
    // borderRadius: 5,
    paddingBottom: 5,
    borderBottomWidth: 15,
    borderBottomColor: Colors.borderLine
  },
  searchBar: {
    width: Metrics.screenWidth * 0.8
  },
  rowItem: {
    ...Fonts.style.normal,
    color: Colors.text,
    paddingHorizontal: 20,
    maxWidth: Metrics.screenWidth - 40
  },
  rowItemSubLabel: {
    fontSize: 12,
    color: Colors.line,
    paddingHorizontal: 20,
    maxWidth: Metrics.screenWidth - 40
  },
  keyboardStyle: {
    flex: 1,
    paddingTop: 20
  },
  headerList: {
    ...Fonts.style.normal,
    fontWeight: '600',
    color: Colors.dark,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingTop: 5,
    paddingBottom: 5,
    height: 30
  },
  warpRowItem: {
    height: 55, justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLine
  },
  sectionItemView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionItemLabel: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    marginTop: 2,
    backgroundColor: 'transparent'
  }
});
