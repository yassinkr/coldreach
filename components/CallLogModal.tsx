import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, TextInput, Button, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { CallStatus } from '@/types/call';

interface CallLogModalProps {
  visible: boolean;
  phoneNumber: string;
  onDismiss: () => void;
  onSave: (label: string, status: CallStatus) => void;
}

export function CallLogModal({ visible, phoneNumber, onDismiss, onSave }: CallLogModalProps) {
  const [label, setLabel] = useState('');
  const [status, setStatus] = useState<CallStatus>('Not Answered');

  const handleSave = () => {
    onSave(label, status);
    setLabel('');
    setStatus('Not Answered');
  };

  const handleDismiss = () => {
    setLabel('');
    setStatus('Not Answered');
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.modal}>
        <Text variant="titleLarge" style={styles.title}>Log Call</Text>
        <Text variant="bodyMedium" style={styles.phoneNumber}>{phoneNumber}</Text>

        <TextInput
          label="Label"
          value={label}
          onChangeText={setLabel}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., John Doe, ABC Company"
        />

        <View style={styles.pickerContainer}>
          <Text variant="bodyMedium" style={styles.pickerLabel}>Status</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue as CallStatus)}
              style={styles.picker}
            >
              <Picker.Item label="Interested" value="Interested" />
              <Picker.Item label="Not Answered" value="Not Answered" />
              <Picker.Item label="Rejected" value="Rejected" />
              <Picker.Item label="Follow Up" value="Follow Up" />
            </Picker>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={handleDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSave} style={styles.button}>
            Save
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  phoneNumber: {
    marginBottom: 16,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    marginBottom: 8,
    color: '#666',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minWidth: 100,
  },
});
