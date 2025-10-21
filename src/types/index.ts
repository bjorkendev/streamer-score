export type TimePeriod = '1day' | '30days' | '60days' | '90days' | '180days' | '365days';

export interface PeriodSettings {
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

export interface Settings {
  periods: Record<TimePeriod, PeriodSettings>;
}

// Legacy interface for backward compatibility
export interface LegacySettings {
  windowStartDays: number;
  windowEndDays: number;
  streamsCap: number;
  hoursCap: number;
  viewersCap: number;
  mpvmTarget: number;
  ucp100Target: number;
  f1kVHTarget: number;
  minViewerHours: number;
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
  period: TimePeriod; // Time period this data represents
  numberOfStreams: number; // Total number of individual streams in the period
  hours: number;
  avgViewers: number;
  messages: number;
  uniqueChatters: number;
  followers: number;
  // Optional metric flags
  includeMessages?: boolean; // Whether to include messages/MPVM in calculation
  includeUniqueChatters?: boolean; // Whether to include unique chatters/UCP100 in calculation
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

const createDefaultPeriodSettings = (days: number): PeriodSettings => ({
  streamsCap: days, // 1 stream per day is excellent
  hoursCap: days, // 1 hour per day is excellent
  viewersCap: 1000,
  mpvmTarget: 0.05,
  ucp100Target: 30,
  f1kVHTarget: 15,
  minViewerHours: Math.max(10, days * 0.8), // Scale with period length
  streamsWeight: 0.10,
  hoursWeight: 0.20,
  viewersWeight: 0.25,
  mpvmWeight: 0.15,
  ucp100Weight: 0.10,
  f1kVHWeight: 0.15,
  consistencyWeight: 0.05,
});

export const defaultSettings: Settings = {
  periods: {
    '1day': createDefaultPeriodSettings(1),
    '30days': createDefaultPeriodSettings(30),
    '60days': createDefaultPeriodSettings(60),
    '90days': createDefaultPeriodSettings(90),
    '180days': createDefaultPeriodSettings(180),
    '365days': createDefaultPeriodSettings(365),
  },
};

export const PERIOD_LABELS: Record<TimePeriod, string> = {
  '1day': '1 Day',
  '30days': '30 Days',
  '60days': '60 Days',
  '90days': '90 Days',
  '180days': '180 Days',
  '365days': '365 Days',
};

export const PERIOD_DAYS: Record<TimePeriod, number> = {
  '1day': 1,
  '30days': 30,
  '60days': 60,
  '90days': 90,
  '180days': 180,
  '365days': 365,
};

