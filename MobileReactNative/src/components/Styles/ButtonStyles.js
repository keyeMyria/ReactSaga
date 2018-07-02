import { StyleSheet } from 'react-native'
import { Fonts, Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  container: {
    height: 55,
    width: 120,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Metrics.section,
    marginVertical: Metrics.baseMargin,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    height: 53,
    width: 118,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    ...Fonts.style.button,
    color: Colors.tint,
    textAlign: 'center',
    backgroundColor: 'transparent'
  }
})
