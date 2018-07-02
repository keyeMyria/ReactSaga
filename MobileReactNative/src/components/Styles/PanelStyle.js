import { StyleSheet } from 'react-native';
import { Metrics, Colors, Fonts } from '../../Themes/';

export default StyleSheet.create({
  container: {
    width: Metrics.screenWidth - Metrics.baseMargin * 2,
    backgroundColor: Colors.background,
    alignSelf: 'center',
    paddingHorizontal: Metrics.baseMargin,
    borderRadius: 5,
    overflow: 'hidden'
  },
  header: {
    width: Metrics.screenWidth - Metrics.baseMargin * 2,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    height: Metrics.navBarHeight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    ...Fonts.style.normal,
    color: Colors.snow,
    backgroundColor: Colors.transparent,
    fontWeight: 'bold',
    fontSize: 16
  }
});
