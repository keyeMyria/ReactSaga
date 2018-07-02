import { StyleSheet } from 'react-native'
import { Colors, Fonts } from '../../Themes/'

export default StyleSheet.create({
  container: {
    width: 191,
    height: 64.5
  },
  backgroundImage: {
    position: 'absolute',
    width: 191,
    height: 64.5,
    resizeMode: 'cover'
  },
  text: {
    ...Fonts.style.normal,
    marginTop: 6,
    marginLeft: 50,
    maxWidth: 130,
    color: Colors.text,
    fontSize: Fonts.size.small,
    fontWeight: 'bold'
  },
  openInMap: {
    ...Fonts.style.normal,
    marginTop: 1,
    marginLeft: 50,
    color: Colors.placeHolder,
    fontSize: Fonts.size.small
  }
})
