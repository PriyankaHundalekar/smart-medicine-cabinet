export interface MedicineData {
  medicineName: string;
  dosage: string | null;
  expiryDate: string | null;
  primaryUses: string[];
  sideEffects: string[];
  warnings: string;
  isExpired?: boolean; // Calculated on client side
  confidenceScore: number;
}

export interface HistoryItem extends MedicineData {
  id: string;
  timestamp: number;
  imageUrl?: string;
}

export enum AppView {
  HOME = 'HOME',
  SCAN = 'SCAN',
  RESULTS = 'RESULTS',
  HISTORY = 'HISTORY',
  CHAT = 'CHAT'
}