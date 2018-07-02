import { StyleSheet } from 'react-native'
import { Fonts, Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  container: {
    height: 50,
    width: 120,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Metrics.section,
    marginVertical: Metrics.baseMargin,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    height: 48,
    width: 118,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    ...Fonts.style.button,
    color: Colors.snow,
    textAlign: 'center',
    backgroundColor: 'transparent'
  }
})
