
export interface VibraMetrics {
  stress: number;
  anxiety: number;
  aggression: number;
  energy: number;
  balance: number;
  timestamp: number;
}

export interface ProcessingConfig {
  threshold: number;
  sensitivity: number;
  smoothing: number;
  showRaw: boolean;
  showAura: boolean;
}

export enum EmotionState {
  CALM = 'Calm',
  STRESSED = 'Stressed',
  EXCITED = 'Excited',
  FOCUSED = 'Focused',
  UNSTABLE = 'Unstable'
}
