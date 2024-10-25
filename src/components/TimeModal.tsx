import React from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface TimeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onTimeSelect: (time: Date) => void;
}

export const TimeModal: React.FC<TimeModalProps> = ({
  isVisible,
  onClose,
  onTimeSelect,
}) => {
  const handleConfirm = (time: Date) => {
    onTimeSelect(time);
    onClose();
  };

  return (
    <DateTimePickerModal
      isVisible={isVisible}
      mode="time"
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
};
