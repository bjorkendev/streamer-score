export interface Settings {
  // Date window
  windowStartDays: number; // Days to subtract from today for Window_Start
  windowEndDays: number; // Days to subtract from today for Window_End (usually 0)
  
  // Performance caps
  streamsCap: number;
  hoursCap: number;
  viewersCap: number;
  
  // Performance targets
  mpvmTarget: number;
  ucp100Target: number;
  f1kVHTarget: number;
  minViewerHours: number;
  
  // Weights (must sum to 1.0)
  streamsWeight: number;
  hoursWeight: number;
  viewersWeight: number;
  mpvmWeight: number;
  ucp100Weight: number;
  f1kVHWeight: number;
  consistencyWeight: number;
}

export interface StreamData {
  id: string;
  name: string; // Streamer name or identifier
  date: string; // ISO date string YYYY-MM-DD
  numberOfStreams: number; // Total number of individual streams in the 60-day period
  hours: number;
  avgViewers: number;
  messages: number;
  uniqueChatters: number;
  followers: number;
}

export interface IntermediateMetrics {
  totalStreams: number;
  totalHours: number;
  weightedAvgViewers: number;
  viewerHours: number;
  mpvm: number;
  ucp100: number;
  fPer1kVH: number;
  followerSpreadConsistency: number;
}

export interface ComponentScores {
  streamsScore: number;
  hoursScore: number;
  viewersScore: number;
  mpvmScore: number;
  ucp100Score: number;
  f1kVHScore: number;
  consistencyScore: number;
}

export interface CalculationResult {
  windowStart: string;
  windowEnd: string;
  intermediateMetrics: IntermediateMetrics;
  componentScores: ComponentScores;
  finalScore: number;
}

export const defaultSettings: Settings = {
  windowStartDays: 60,
  windowEndDays: 0,
  streamsCap: 60,
  hoursCap: 60,
  viewersCap: 1000,
  mpvmTarget: 0.05,
  ucp100Target: 30,
  f1kVHTarget: 15,
  minViewerHours: 50,
  streamsWeight: 0.10,
  hoursWeight: 0.20,
  viewersWeight: 0.25,
  mpvmWeight: 0.15,
  ucp100Weight: 0.10,
  f1kVHWeight: 0.15,
  consistencyWeight: 0.05,
};

