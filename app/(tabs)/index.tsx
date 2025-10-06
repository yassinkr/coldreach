import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert, Platform } from 'react-native';
import { TextInput, Button, List, Text } from 'react-native-paper';
import { Phone } from 'lucide-react-native';
import { CallLogModal } from '@/components/CallLogModal';
import { storageService } from '@/services/storage';
import { CallLog, CallStatus } from '@/types/call';

export default function CallScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [suggestions, setSuggestions] = useState<CallLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [lastCalledNumber, setLastCalledNumber] = useState('');

  useEffect(() => {
    if (phoneNumber.length >= 3) {
      searchSuggestions(phoneNumber);
    } else {
      setSuggestions([]);
    }
  }, [phoneNumber]);

  const searchSuggestions = async (query: string) => {
    const results = await storageService.searchByPhoneNumber(query);
    setSuggestions(results);
  };

  const handleCall = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    const telUrl = `tel:${cleanNumber}`;

    try {
      const supported = await Linking.canOpenURL(telUrl);
      if (supported) {
        await Linking.openURL(telUrl);
        setLastCalledNumber(phoneNumber);
        setShowModal(true);
      } else {
        Alert.alert('Error', 'Unable to make phone calls on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate call');
      console.error('Call error:', error);
    }
  };

  const handleSaveLog = async (label: string, status: CallStatus) => {
    const callLog: CallLog = {
      id: Date.now().toString(),
      phoneNumber: lastCalledNumber,
      label,
      status,
      timestamp: Date.now(),
    };

    try {
      await storageService.saveCallLog(callLog);
      setShowModal(false);
      setPhoneNumber('');
      setLastCalledNumber('');
      setSuggestions([]);
      Alert.alert('Success', 'Call logged successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save call log');
      console.error('Save error:', error);
    }
  };

  const selectSuggestion = (suggestion: CallLog) => {
    setPhoneNumber(suggestion.phoneNumber);
    setSuggestions([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TextInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
          placeholder="Enter phone number"
          left={<TextInput.Icon icon={() => <Phone size={20} color="#666" />} />}
        />

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text variant="labelSmall" style={styles.suggestionsTitle}>
              Previous Calls
            </Text>
            <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="handled">
              {suggestions.map((suggestion) => (
                <List.Item
                  key={suggestion.id}
                  title={suggestion.phoneNumber}
                  description={`${suggestion.label} - ${suggestion.status}`}
                  onPress={() => selectSuggestion(suggestion)}
                  style={styles.suggestionItem}
                  left={props => <List.Icon {...props} icon="phone" />}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleCall}
          style={styles.callButton}
          contentStyle={styles.callButtonContent}
          icon={() => <Phone size={20} color="white" />}
        >
          Call
        </Button>

        <View style={styles.infoBox}>
          <Text variant="bodySmall" style={styles.infoText}>
            Enter a phone number and tap Call to start. After the call, you'll be prompted to log details.
          </Text>
        </View>
      </View>

      <CallLogModal
        visible={showModal}
        phoneNumber={lastCalledNumber}
        onDismiss={() => setShowModal(false)}
        onSave={handleSaveLog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsTitle: {
    padding: 12,
    paddingBottom: 8,
    color: '#666',
    fontWeight: 'bold',
  },
  suggestionsList: {
    maxHeight: 160,
  },
  suggestionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  callButton: {
    marginBottom: 16,
  },
  callButtonContent: {
    paddingVertical: 8,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoText: {
    color: '#1565c0',
    lineHeight: 20,
  },
});
