export type StaffStatus = 
  | 'invited'
  | 'accepted'
  | 'rejected';

export type SplitType = 
  | 'percentage'
  | 'fixed';

export interface EventStaff {
  id: string;
  event_id: string;
  user_id?: string;
  invitation_token?: string;
  email?: string;
  name?: string;
  role: string;
  split_type: SplitType;
  split_value: number;
  bank_account_setup: boolean;
  bank_iban?: string;
  bank_swift?: string;
  bank_account_name?: string;
  stripe_connect_account_id?: string;
  status: StaffStatus;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStaffInviteRequest {
  event_id: string;
  email: string;
  name: string;
  role: string;
  split_type: SplitType;
  split_value: number;
}

export interface AcceptStaffInviteRequest {
  token: string;
  user_id: string;
}

export interface UpdateBankAccountRequest {
  iban: string;
  swift?: string;
  account_name: string;
}
