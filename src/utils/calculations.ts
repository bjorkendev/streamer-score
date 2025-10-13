import type {
  Settings,
  StreamData,
  IntermediateMetrics,
  ComponentScores,
  CalculationResult,
} from '../types';

export function calculateLegitimacyScore(
  streams: StreamData[],
  settings: Settings
): CalculationResult {
  const today = new Date();
  const windowStart = new Date(today);
  windowStart.setDate(today.getDate() - settings.windowStartDays);
  const windowEnd = new Date(today);
  windowEnd.setDate(today.getDate() - settings.windowEndDays);

  // Filter streams within the date window
  const filteredStreams = streams.filter((stream) => {
    const streamDate = new Date(stream.date);
    return streamDate >= windowStart && streamDate <= windowEnd;
  });

  // Calculate intermediate metrics
  const intermediateMetrics = calculateIntermediateMetrics(filteredStreams);
  
  // Calculate component scores
  const componentScores = calculateComponentScores(
    intermediateMetrics,
    settings
  );
  
  // Calculate final score
  const finalScore = calculateFinalScore(
    componentScores,
    intermediateMetrics.viewerHours,
    settings
  );

  return {
    windowStart: windowStart.toISOString().split('T')[0],
    windowEnd: windowEnd.toISOString().split('T')[0],
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
  settings: Settings
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
  settings: Settings
): number {
  // Weighted sum of component scores
  const weightedSum =
    settings.streamsWeight * scores.streamsScore +
    settings.hoursWeight * scores.hoursScore +
    settings.viewersWeight * scores.viewersScore +
    settings.mpvmWeight * scores.mpvmScore +
    settings.ucp100Weight * scores.ucp100Score +
    settings.f1kVHWeight * scores.f1kVHScore +
    settings.consistencyWeight * scores.consistencyScore;

  // Apply minimum viewer hours penalty
  const penalty = Math.min(1, viewerHours / settings.minViewerHours);

  // Final score rounded to 1 decimal place
  return Math.round(weightedSum * penalty * 10) / 10;
}

