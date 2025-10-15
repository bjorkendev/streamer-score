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
  
  // Calculate final score
  const finalScore = calculateFinalScore(
    componentScores,
    intermediateMetrics.viewerHours,
    periodSettings
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

  return {
    totalStreams,
    totalHours,
    weightedAvgViewers,
    viewerHours,
    mpvm,
    ucp100,
    fPer1kVH,
    followerSpreadConsistency,
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

  return {
    streamsScore,
    hoursScore,
    viewersScore,
    mpvmScore,
    ucp100Score,
    f1kVHScore,
    consistencyScore,
  };
}

function calculateFinalScore(
  scores: ComponentScores,
  viewerHours: number,
  settings: PeriodSettings
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
  // Using geometric mean so both metrics must be decent
  const engagementScore = Math.sqrt(
    (scores.mpvmScore / 100) * (scores.ucp100Score / 100)
  ) * 100;

  // Layer 4: Growth Score (F1kVH + Consistency)
  // Measures sustainability and quality of growth
  const growthScore = (
    (scores.f1kVHScore / 100) * 0.7 +
    (scores.consistencyScore / 100) * 0.3
  ) * 100;

  // Calculate intermediate metrics for red flag detection
  // We need to derive these from the scores and settings
  const estimatedUcp100 = (scores.ucp100Score / 100) * settings.ucp100Target;
  const estimatedMpvm = (scores.mpvmScore / 100) * settings.mpvmTarget;

  // Red flag detection: Suspicious patterns get severe penalties
  const hasMinimalEngagement = estimatedUcp100 >= 0.5; // At least 0.5 chatters per 100 viewers
  const hasAnyMessages = estimatedMpvm > 0.0001; // Some chat activity exists
  const legitimacyMultiplier = (hasMinimalEngagement && hasAnyMessages) ? 1.0 : 0.1;

  // Sample size confidence: Penalize insufficient data
  const confidenceMultiplier = Math.min(1, viewerHours / settings.minViewerHours);

  // Calculate layer multipliers (normalize to 0-1 range)
  const activityMultiplier = activityScore / 100;
  const reachMultiplier = reachScore / 100;
  const engagementMultiplier = engagementScore / 100;
  const growthMultiplier = growthScore / 100;

  // Interdependent calculation: All layers must perform
  // Using weighted geometric mean for balance
  const weights = {
    activity: 0.30,  // Must stream regularly
    reach: 0.25,     // Must have audience
    engagement: 0.30, // Must have real, engaged viewers (CRITICAL)
    growth: 0.15,    // Must be building something
  };

  // Geometric mean with weights: (a^w1 × b^w2 × c^w3 × d^w4)
  const geometricMean = Math.pow(
    Math.pow(Math.max(0.01, activityMultiplier), weights.activity) *
    Math.pow(Math.max(0.01, reachMultiplier), weights.reach) *
    Math.pow(Math.max(0.01, engagementMultiplier), weights.engagement) *
    Math.pow(Math.max(0.01, growthMultiplier), weights.growth),
    1
  );

  // Apply all multipliers
  const rawScore = geometricMean * 100 * legitimacyMultiplier * confidenceMultiplier;

  // Round to 1 decimal place
  return Math.round(rawScore * 10) / 10;
}

