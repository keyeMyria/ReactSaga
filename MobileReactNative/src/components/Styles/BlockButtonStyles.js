import { StyleSheet } from 'react-native';
import { Fonts, Colors, Metrics } from '../../Themes/';

export default StyleSheet.create({
  container: {
    height: 50,
    width: Metrics.screenWidth,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    height: 48,
    width: Metrics.screenWidth - 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    ...Fonts.style.button,
    color: Colors.snow,
    textAlign: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 40
  }
});

