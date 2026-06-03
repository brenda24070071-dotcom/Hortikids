export interface DiaryEntry {
  id: string;
  date: string;
  note: string;
  photoUrl?: string;
}

export interface Plant {
  id: string;
  name: string;
  type: 'vegetable' | 'fruit' | 'herb';
  scientificName?: string;
  image: string; // URL or emoji for prototype
  benefits: string[];
  funFact: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: {
    water: number; // 0-100
    sun: number;   // 0-100
    love: number;  // 0-100 (interaction)
  };
  diary: DiaryEntry[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ENCYCLOPEDIA = 'ENCYCLOPEDIA',
  HEALTH = 'HEALTH',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface SensorData {
  time: string;
  moisture: number;
  light: number;
  temperature: number;
}