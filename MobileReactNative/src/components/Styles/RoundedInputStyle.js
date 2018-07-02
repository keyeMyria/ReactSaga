import { StyleSheet } from 'react-native'
import { Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  container: {
    width: 200,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Metrics.baseMargin,
    marginVertical: Metrics.baseMargin,
    backgroundColor: Colors.border
  }
})
