export enum QuestionType {
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SCALE = 'SCALE', // 1-10
  TEXT = 'TEXT',
  SELECT = 'SELECT'
}

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[]; // For SELECT
  category: 'discipline' | 'health' | 'learning' | 'reflection' | 'identity' | 'decisions' | 'energy' | 'money' | 'shutdown' | 'work';
}

export interface DailyLog {
  date: string; // ISO string YYYY-MM-DD
  answers: Record<string, any>; // Keyed by Question ID
  disciplineScore: number;
  timeIntegrityScore: number;
  creationRatio: number; // 0.0 to 1.0
  pressureLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  synced: boolean;
  shutdownComplete: boolean;
  
  aiAnalysis?: string;
  dailyDirection?: string; // One sentence directive
  realityCheck?: string; // Statistical comparison
  thinkingQuality?: 'Surface' | 'Practical' | 'Strategic' | 'Long-term';
  
  photoUrl?: string; // Data URL
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface AppConfig {
  silentMode: boolean;
}
