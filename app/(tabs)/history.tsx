import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { List, Text, Chip, Divider } from 'react-native-paper';
import { Phone } from 'lucide-react-native';
import { storageService } from '@/services/storage';
import { CallLog } from '@/types/call';

export default function HistoryScreen() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
          <View style={styles.iconContainer}>
            <Phone size={20} color="#6200ee" />
          </View>
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
          <Text variant="labelMedium" style={styles.statsText}>
            Total Calls: {callLogs.length}
          </Text>
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
  statsText: {
    color: '#666',
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
});
