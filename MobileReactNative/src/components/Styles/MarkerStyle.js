import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Themes';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 50,
    height: 75
  },
  backgroundImage: {
    position: 'absolute',
    width: 50,
    height: 75,
    resizeMode: 'cover'
  },
  text: {
    ...Fonts.style.normal,
    marginTop: 12,
    color: Colors.tint,
    fontSize: Fonts.size.regular,
    fontWeight: 'bold'
  }
});
