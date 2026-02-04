
export interface Snapshot {
  id: string;
  timestamp: number;
  prompt: string;
  content: string;
  type: 'code' | 'text' | 'image';
  metadata?: any;
}

export type UserTier = 'STANDARD' | 'ADVANCED' | null;

export interface User {
  email: string;
  tier: UserTier;
}

export enum BuilderStatus {
  IDLE = 'IDLE',
  BUILDING = 'BUILDING',
  ERROR = 'ERROR',
  MOCKING = 'MOCKING'
}
