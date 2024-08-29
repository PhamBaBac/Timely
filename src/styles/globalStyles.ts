import {Platform, StyleSheet} from 'react-native';
import {fontFamilies} from '../constants/fontFamilies';
import { appColors } from '../constants';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.white,
  },

  text: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: appColors.text,
  },
  shadow: {
    shadowColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
