import { StyleSheet } from 'react-native';
import { WINDOW_WIDTH } from 'AppConstants';
import { FIRE, LINE } from 'AppColors';

export default StyleSheet.create({
  container: {
    height: 50,
    width: WINDOW_WIDTH * 0.9,
    marginHorizontal: 25,
    marginVertical: 20,
    justifyContent: 'space-between',
    alignSelf: 'center'
  },
  label: {
    marginHorizontal: 10
  },
  inputBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    alignItems: 'center'
  },
  textInput: {
    // marginVertical: 5,
    height: 40,
    flex: 1,
    paddingHorizontal: 0
  },
  error: {
    marginHorizontal: 10,
    marginTop: 3,
    color: FIRE
  }
});

