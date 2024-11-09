import {StyleSheet, Switch} from 'react-native';
import {appColors} from '../constants/appColor';

const Toggle = ({
  value,
  onValueChange,
  style,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  style?: any;
}) => {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{false: appColors.gray2, true: appColors.danger}}
      thumbColor={value ? appColors.white : appColors.white}
      style={[styles.toggle, style]}
    />
  );
};

const styles = StyleSheet.create({
  // ... existing styles
  toggle: {
    marginLeft: 'auto',
  },
  toggleSwitch: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
});

export default Toggle;
