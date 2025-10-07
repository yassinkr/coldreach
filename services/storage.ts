import AsyncStorage from '@react-native-async-storage/async-storage';
import { CallLog } from '@/types/call';

const STORAGE_KEY = '@cold_call_logs';

export const storageService = {
  async getCallLogs(): Promise<CallLog[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error reading call logs:', error);
      return [];
    }
  },

  async saveCallLog(callLog: CallLog): Promise<void> {
    try {
      const existingLogs = await this.getCallLogs();
      const updatedLogs = [callLog, ...existingLogs];
      const jsonValue = JSON.stringify(updatedLogs);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving call log:', error);
      throw error;
    }
  },

  async searchByPhoneNumber(query: string): Promise<CallLog[]> {
    try {
      const logs = await this.getCallLogs();
      if (!query) return [];

      const uniqueNumbers = new Map<string, CallLog>();
      logs.forEach(log => {
        if (log.phoneNumber.includes(query) && !uniqueNumbers.has(log.phoneNumber)) {
          uniqueNumbers.set(log.phoneNumber, log);
        }
      });

      return Array.from(uniqueNumbers.values());
    } catch (error) {
      console.error('Error searching call logs:', error);
      return [];
    }
  },
  async updateCallLog(updatedLog: CallLog): Promise<void> {
    try {
      const logs = await this.getCallLogs();
      const logIndex = logs.findIndex(log => log.id === updatedLog.id);
      if (logIndex !== -1) {
        logs[logIndex] = updatedLog;
        const jsonValue = JSON.stringify(logs);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      }
    } catch (error) {
      console.error('Error updating call log:', error);
      throw error;
    }
  }
};
