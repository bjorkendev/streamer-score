import type {
  Settings,
  PeriodSettings,
  StreamData,
  IntermediateMetrics,
  ComponentScores,
  CalculationResult,
} from '../types';
import { PERIOD_DAYS } from '../types';

export function calculateLegitimacyScore(
  stream: StreamData,
  settings: Settings
): CalculationResult {
  // Get the period-specific settings
  const periodSettings = settings.periods[stream.period];
  const periodDays = PERIOD_DAYS[stream.period];


  // Calculate date range
  const endDate = new Date(stream.date);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - periodDays);

  // Calculate intermediate metrics (using single stream as array for compatibility)
  const intermediateMetrics = calculateIntermediateMetrics([stream]);
  
  // Calculate component scores
  const componentScores = calculateComponentScores(
    intermediateMetrics,
    periodSettings
  );
  
  // Calculate final score with optional metrics
  const finalScore = calculateFinalScore(
    componentScores,
    intermediateMetrics.viewerHours,
    periodSettings,
    stream.includeMessages ?? true,
    stream.includeUniqueChatters ?? true
  );

  return {
    windowStart: startDate.toISOString().split('T')[0],
    windowEnd: endDate.toISOString().split('T')[0],
    intermediateMetrics,
    componentScores,
    finalScore,
  };
}

function calculateIntermediateMetrics(
  streams: StreamData[]
): IntermediateMetrics {
  if (streams.length === 0) {
  return {
    totalStreams: 0,
    totalHours: 0,
    weightedAvgViewers: 0,
    viewerHours: 0,
    mpvm: 0,
    ucp100: 0,
    fPer1kVH: 0,
    followerSpreadConsistency: 0,
    followerCount: 0,
  };
  }

  // Total_Streams: Sum of all numberOfStreams
  const totalStreams = streams.reduce((sum, s) => {
    const streams = s.numberOfStreams || 0;
    return sum + (isNaN(streams) ? 0 : streams);
  }, 0);

  // Total_Hours: Sum of all hours
  const totalHours = streams.reduce((sum, s) => sum + s.hours, 0);

  // Weighted_Avg_Viewers: Weighted by sqrt of hours
  const sumWeightedViewers = streams.reduce(
    (sum, s) => sum + s.avgViewers * Math.sqrt(s.hours),
    0
  );
  const sumWeights = streams.reduce((sum, s) => sum + Math.sqrt(s.hours), 0);
  const weightedAvgViewers =
    sumWeights > 0 ? sumWeightedViewers / sumWeights : 0;

  // Viewer_Hours: Sum of (avgViewers * hours)
  const viewerHours = streams.reduce(
    (sum, s) => sum + s.avgViewers * s.hours,
    0
  );

  // MPVM: Messages Per Viewer-Minute
  const totalMessages = streams.reduce((sum, s) => sum + s.messages, 0);
  const mpvm = viewerHours > 0 ? totalMessages / (viewerHours * 60) : 0;

  // UCP100: Unique Chatters Per 100 viewers
  const totalUniqueChatters = streams.reduce(
    (sum, s) => sum + s.uniqueChatters,
    0
  );
  const ucp100 =
    weightedAvgViewers > 0
      ? (totalUniqueChatters / weightedAvgViewers) * 100
      : 0;

  // F_per_1kVH: Followers per 1000 viewer-hours
  const totalFollowers = streams.reduce((sum, s) => sum + s.followers, 0);
  const fPer1kVH = viewerHours > 0 ? (totalFollowers / viewerHours) * 1000 : 0;

  // Follower_Spread_Consistency: 1 / (1 + CV)
  const followerCounts = streams.map((s) => s.followers);
  const avgFollowers =
    followerCounts.reduce((sum, f) => sum + f, 0) / followerCounts.length;
  const variance =
    followerCounts.reduce((sum, f) => sum + Math.pow(f - avgFollowers, 2), 0) /
    followerCounts.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation =
    avgFollowers > 0 ? stdDev / avgFollowers : 0;
  const followerSpreadConsistency =
    avgFollowers > 0 ? 1 / (1 + coefficientOfVariation) : 0;

  // Follower_Count: Average follower count across all streams
  const followerCount = streams.reduce((sum, s) => sum + (s.followerCount || 0), 0) / streams.length;

  return {
    totalStreams,
    totalHours,
    weightedAvgViewers,
    viewerHours,
    mpvm,
    ucp100,
    fPer1kVH,
    followerSpreadConsistency,
    followerCount,
  };
}

function calculateComponentScores(
  metrics: IntermediateMetrics,
  settings: PeriodSettings
): ComponentScores {
  // Streams_Score: MIN(100, 100*SQRT(streams / streamsCap))
  const streamsRatio = settings.streamsCap > 0 ? metrics.totalStreams / settings.streamsCap : 0;
  const streamsScore = Math.min(
    100,
    100 * Math.sqrt(Math.max(0, streamsRatio))
  );


  // Hours_Score: MIN(100, 100*SQRT(hours / hoursCap))
  const hoursScore = Math.min(
    100,
    100 * Math.sqrt(metrics.totalHours / settings.hoursCap)
  );

  // Viewers_Score: 100*LOG10(1+viewers)/LOG10(1+viewersCap)
  const viewersScore =
    metrics.weightedAvgViewers > 0
      ? (100 * Math.log10(1 + metrics.weightedAvgViewers)) /
        Math.log10(1 + settings.viewersCap)
      : 0;

  // MPVM_Score: MIN(100, 100*mpvm / mpvmTarget)
  const mpvmScore = Math.min(
    100,
    (100 * metrics.mpvm) / settings.mpvmTarget
  );

  // UCP100_Score: MIN(100, 100*ucp100 / ucp100Target)
  const ucp100Score = Math.min(
    100,
    (100 * metrics.ucp100) / settings.ucp100Target
  );

  // F1kVH_Score: MIN(100, 100*f1kVH / f1kVHTarget)
  const f1kVHScore = Math.min(
    100,
    (100 * metrics.fPer1kVH) / settings.f1kVHTarget
  );

  // Consistency_Score: 100*followerSpreadConsistency
  const consistencyScore = 100 * metrics.followerSpreadConsistency;

  // Follower_Count_Score: 100*LOG10(1+followerCount)/LOG10(1+followerCountCap)
  const followerCountCap = settings.followerCountCap || 10000; // Fallback if missing
  const followerCountScore =
    metrics.followerCount > 0 && !isNaN(metrics.followerCount)
      ? (100 * Math.log10(1 + metrics.followerCount)) /
        Math.log10(1 + followerCountCap)
      : 0;

  return {
    streamsScore,
    hoursScore,
    viewersScore,
    mpvmScore,
    ucp100Score,
    f1kVHScore,
    consistencyScore,
    followerCountScore,
  };
}

function calculateFinalScore(
  scores: ComponentScores,
  viewerHours: number,
  settings: PeriodSettings,
  includeMessages: boolean = true,
  includeUniqueChatters: boolean = true
): number {
  // Layer 1: Activity Score (Streams + Hours)
  // Combines how often they stream and how long
  const activityScore = (
    (scores.streamsScore / 100) * 0.4 +
    (scores.hoursScore / 100) * 0.6
  ) * 100;

  // Layer 2: Reach Score (Viewers)
  // Pure audience size
  const reachScore = scores.viewersScore;

  // Layer 3: Legitimacy Score (Engagement - MPVM + UCP100)
  // This validates that viewers are real and engaged
  // Handle optional metrics
  let engagementScore = 100; // Default to perfect if no engagement metrics
  let legitimacyMultiplier = 1.0;
  
  if (includeMessages && includeUniqueChatters) {
    // Both metrics available - use geometric mean
    engagementScore = Math.sqrt(
      (scores.mpvmScore / 100) * (scores.ucp100Score / 100)
    ) * 100;
    
    // Red flag detection when both metrics are available
    const estimatedUcp100 = (scores.ucp100Score / 100) * settings.ucp100Target;
    const estimatedMpvm = (scores.mpvmScore / 100) * settings.mpvmTarget;
    const hasMinimalEngagement = estimatedUcp100 >= 0.5;
    const hasAnyMessages = estimatedMpvm > 0.0001;
    legitimacyMultiplier = (hasMinimalEngagement && hasAnyMessages) ? 1.0 : 0.1;
  } else if (includeMessages) {
    // Only messages available
    engagementScore = scores.mpvmScore;
    const estimatedMpvm = (scores.mpvmScore / 100) * settings.mpvmTarget;
    legitimacyMultiplier = estimatedMpvm > 0.0001 ? 1.0 : 0.1;
  } else if (includeUniqueChatters) {
    // Only unique chatters available
    engagementScore = scores.ucp100Score;
    const estimatedUcp100 = (scores.ucp100Score / 100) * settings.ucp100Target;
    legitimacyMultiplier = estimatedUcp100 >= 0.5 ? 1.0 : 0.1;
  }
  // If neither is included, engagementScore stays at 100 (neutral) and no red flag detection

  // Layer 4: Growth Score (F1kVH + Consistency)
  // Measures sustainability and quality of growth
  const growthScore = (
    (scores.f1kVHScore / 100) * 0.7 +
    (scores.consistencyScore / 100) * 0.3
  ) * 100;

  // Layer 5: Authority Score (Follower Count)
  // Represents the streamer's overall follower base and influence
  const authorityScore = scores.followerCountScore;
  console.log('Authority score:', authorityScore);

  // Sample size confidence: Penalize insufficient data
  const confidenceMultiplier = Math.min(1, viewerHours / settings.minViewerHours);
  console.log('Confidence multiplier:', confidenceMultiplier);

  // Calculate layer multipliers (normalize to 0-1 range)
  const activityMultiplier = Math.max(0.01, Math.min(1, activityScore / 100));
  const reachMultiplier = Math.max(0.01, Math.min(1, reachScore / 100));
  const engagementMultiplier = Math.max(0.01, Math.min(1, engagementScore / 100));
  const growthMultiplier = Math.max(0.01, Math.min(1, growthScore / 100));
  const authorityMultiplier = Math.max(0.01, Math.min(1, authorityScore / 100));
  console.log('Multipliers:', { activityMultiplier, reachMultiplier, engagementMultiplier, growthMultiplier, authorityMultiplier });

  // Interdependent calculation: All layers must perform
  // Redistribute weights based on what metrics are available
  let weights = {
    activity: 0.25,
    reach: 0.20,
    engagement: 0.25,
    growth: 0.15,
    authority: 0.15,
  };

  // If engagement metrics are not available, redistribute their weight
  if (!includeMessages && !includeUniqueChatters) {
    // Redistribute engagement weight to activity, reach, and authority
    weights = {
      activity: 0.30,  // +0.05
      reach: 0.25,     // +0.05
      engagement: 0.0,
      growth: 0.20,    // +0.05
      authority: 0.25, // +0.10
    };
  }

  // Geometric mean with weights: (a^w1 × b^w2 × c^w3 × d^w4 × e^w5)
  let geometricMean: number;
  
  if (weights.engagement === 0) {
    // Don't include engagement in calculation
    geometricMean = Math.pow(
      Math.pow(activityMultiplier, weights.activity) *
      Math.pow(reachMultiplier, weights.reach) *
      Math.pow(growthMultiplier, weights.growth) *
      Math.pow(authorityMultiplier, weights.authority),
      1
    );
  } else {
    // Include all layers
    geometricMean = Math.pow(
      Math.pow(activityMultiplier, weights.activity) *
      Math.pow(reachMultiplier, weights.reach) *
      Math.pow(engagementMultiplier, weights.engagement) *
      Math.pow(growthMultiplier, weights.growth) *
      Math.pow(authorityMultiplier, weights.authority),
      1
    );
  }

  // Apply all multipliers
  const rawScore = geometricMean * 100 * legitimacyMultiplier * confidenceMultiplier;

  // Round to 1 decimal place
  return Math.round(rawScore * 10) / 10;
}

