
export type AppState = 'DASHBOARD' | 'PRIMING' | 'WATCHING' | 'QUIZ' | 'DESIGN_DOCS';

export type GatekeeperGameType = 'N_BACK' | 'REACTION';

export interface VideoNode {
  id: string;
  title: string;
  description: string;
  ytId: string;
  level: number;
  subject: string; // "Physics", "Neuroscience", etc.
  prerequisites: string[]; // IDs of required nodes
  duration: number; // seconds
}

export interface QuizQuestion {
  id: string;
  timestamp: number; // in seconds
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProgress {
  completedIds: string[];
  currentExp: number;
  focusScore: number;
  unlockedSubjects: string[];
}

export interface SkillTree {
  id: string;
  name: string;
  nodes: VideoNode[];
}
