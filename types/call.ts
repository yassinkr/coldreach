export type CallStatus = 'Interested' | 'Not Answered' | 'Rejected' | 'Follow Up';

export interface CallLog {
  id: string;
  phoneNumber: string;
  label: string;
  status: CallStatus;
  timestamp: number;
}
