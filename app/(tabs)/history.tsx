import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Linking, TouchableOpacity, Alert, Share } from 'react-native';
import { List, Text, Chip, Divider, Portal, Dialog, Button, TextInput, Menu } from 'react-native-paper';
import { Phone, Download } from 'lucide-react-native';
import { storageService } from '@/services/storage';
import { CallLog } from '@/types/call';

export default function HistoryScreen() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editingLog, setEditingLog] = useState<CallLog | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  const statusOptions = ['Interested', 'Follow Up', 'Rejected', 'Not Answered', 'Callback'];

  useEffect(() => {
    loadCallLogs();
  }, []);

  const loadCallLogs = async () => {
    try {
      const logs = await storageService.getCallLogs();
      setCallLogs(logs);
    } catch (error) {
      console.error('Error loading call logs:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCallLogs();
    setRefreshing(false);
  }, []);

  const handlePhoneCall = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((err) => Alert.alert('Error', 'Failed to make call'));
  };

  const handleEditLog = (log: CallLog) => {
    setEditingLog(log);
    setEditLabel(log.label || '');
    setEditStatus(log.status);
  };

  const handleSaveEdit = async () => {
    if (!editingLog) return;

    try {
      const updatedLog: CallLog = {
        ...editingLog,
        label: editLabel,
        status: editStatus as CallLog['status'],
      };

      // Update in storage
      await storageService.updateCallLog(updatedLog);
      
      // Update local state
      setCallLogs(prev => 
        prev.map(log => log.id === updatedLog.id ? updatedLog : log)
      );

      setEditingLog(null);
      setEditLabel('');
      setEditStatus('');
    } catch (error) {
      console.error('Error updating call log:', error);
      Alert.alert('Error', 'Failed to update call log');
    }
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
    setEditLabel('');
    setEditStatus('');
  };

  const exportCallLogs = async () => {
    if (callLogs.length === 0) {
      Alert.alert('No Data', 'There are no call logs to export');
      return;
    }

    try {
      // Create CSV content
      const headers = 'Phone Number,Label,Status,Date\n';
      const rows = callLogs.map(log => {
        const date = new Date(log.timestamp).toLocaleString('en-US');
        return `"${log.phoneNumber}","${log.label || ''}","${log.status}","${date}"`;
      }).join('\n');
      
      const csvContent = headers + rows;
      
      // Share the CSV content
      await Share.share({
        message: csvContent,
        title: 'Call Logs Export',
      });
    } catch (error) {
      console.error('Error exporting call logs:', error);
      Alert.alert('Error', 'Failed to export call logs');
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Interested':
        return '#4caf50';
      case 'Follow Up':
        return '#ff9800';
      case 'Rejected':
        return '#f44336';
      case 'Not Answered':
        return '#9e9e9e';
      default:
        return '#2196f3';
    }
  };

  const renderItem = ({ item }: { item: CallLog }) => (
    <View>
      <TouchableOpacity onPress={() => handleEditLog(item)}>
        <List.Item
          title={item.phoneNumber}
          description={
            <View style={styles.itemDescription}>
              <Text variant="bodySmall" style={styles.label}>
                {item.label || 'No label'}
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {formatDate(item.timestamp)}
              </Text>
            </View>
          }
          left={props => (
            <TouchableOpacity 
              style={styles.iconContainer}
              onPress={() => handlePhoneCall(item.phoneNumber)}
            >
              <Phone size={20} color="#6200ee" />
            </TouchableOpacity>
          )}
          right={() => (
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusText}
            >
              {item.status}
            </Chip>
          )}
          style={styles.listItem}
        />
      </TouchableOpacity>
      <Divider />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Phone size={48} color="#ccc" />
      <Text variant="titleMedium" style={styles.emptyTitle}>No Call History</Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Make your first call to see it here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {callLogs.length > 0 ? (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Text variant="labelMedium" style={styles.statsText}>
              Total Calls: {callLogs.length}
            </Text>
            <Button
              mode="contained"
              icon={({ size, color }) => <Download size={size} color={color} />}
              onPress={exportCallLogs}
              style={styles.exportButton}
            >
              Export
            </Button>
          </View>
        </View>
      ) : null}

      <FlatList
        data={callLogs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={callLogs.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Portal>
        <Dialog visible={editingLog !== null} onDismiss={handleCancelEdit}>
          <Dialog.Title>Edit Call Log</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Phone Number"
              value={editingLog?.phoneNumber || ''}
              disabled
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Label"
              value={editLabel}
              onChangeText={setEditLabel}
              style={styles.input}
              mode="outlined"
              placeholder="Enter label (optional)"
            />
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setStatusMenuVisible(true)}
                  style={styles.statusButton}
                >
                  Status: {editStatus}
                </Button>
              }
            >
              {statusOptions.map((status) => (
                <Menu.Item
                  key={status}
                  onPress={() => {
                    setEditStatus(status);
                    setStatusMenuVisible(false);
                  }}
                  title={status}
                />
              ))}
            </Menu>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelEdit}>Cancel</Button>
            <Button onPress={handleSaveEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    color: '#666',
  },
  exportButton: {
    marginLeft: 'auto',
  },
  listItem: {
    backgroundColor: 'white',
    paddingVertical: 8,
  },
  itemDescription: {
    marginTop: 4,
  },
  label: {
    color: '#333',
    marginBottom: 4,
  },
  date: {
    color: '#999',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    padding: 8,
  },
  statusChip: {
    alignSelf: 'center',
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  statusButton: {
    marginTop: 8,
  },
});