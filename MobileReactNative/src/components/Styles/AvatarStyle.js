import { StyleSheet } from 'react-native'
import { Colors, Fonts } from '../../Themes/'

export default StyleSheet.create({
  container: {
    backgroundColor: Colors.tint,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    borderWidth: 1,
    borderColor: Colors.border
  },
  image: {
    borderWidth: 1,
    borderColor: Colors.border
    // resizeMode: 'cover'
  },
  placeholder: {
    position: 'absolute',
    ...Fonts.style.h4,
    color: Colors.snow
  }
})
