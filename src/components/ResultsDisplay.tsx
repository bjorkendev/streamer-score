import type { CalculationResult, StreamData } from '../types';
import { Tooltip } from './Tooltip';
import { formatNumber, formatNumberWithDecimals, formatNumberWithOneDecimal, formatNumberWithFourDecimals, formatScore } from '../utils/formatting';

interface ResultsDisplayProps {
  result: CalculationResult | null;
  stream?: StreamData | null;
}

type RedFlagLevel = 'critical' | 'warning' | 'good';

interface RedFlag {
  level: RedFlagLevel;
  message: string;
}

export function ResultsDisplay({ result, stream }: ResultsDisplayProps) {
  if (!result) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-violet-400">Results</h2>
        <p className="text-gray-400">
          Add stream data to see the legitimacy score calculation.
        </p>
      </div>
    );
  }

  const { intermediateMetrics, componentScores, finalScore } = result;

  // Red flag detection logic
  const detectRedFlags = (): RedFlag[] => {
    const flags: RedFlag[] = [];
    const avgViewers = intermediateMetrics.weightedAvgViewers;
    const includeMessages = stream?.includeMessages ?? true;
    const includeUniqueChatters = stream?.includeUniqueChatters ?? true;

    // Critical: High viewers but extremely low engagement (only if metrics are included)
    if (includeMessages && avgViewers > 50 && componentScores.mpvmScore < 20) {
      flags.push({
        level: 'critical',
        message: `Very low chat activity (${componentScores.mpvmScore.toFixed(1)}/100) for ${avgViewers.toFixed(0)} avg viewers. This pattern is highly suspicious and may indicate viewbotting.`
      });
    }

    if (includeUniqueChatters && avgViewers > 50 && componentScores.ucp100Score < 20) {
      flags.push({
        level: 'critical',
        message: `Very few unique chatters (${componentScores.ucp100Score.toFixed(1)}/100) for ${avgViewers.toFixed(0)} avg viewers. This suggests non-organic viewership.`
      });
    }

    // Warning: Moderate viewers with poor engagement (only if metrics are included)
    if (includeMessages && avgViewers > 30 && componentScores.mpvmScore < 40 && componentScores.mpvmScore >= 20) {
      flags.push({
        level: 'warning',
        message: `Below-average chat activity (${componentScores.mpvmScore.toFixed(1)}/100) for ${avgViewers.toFixed(0)} avg viewers. Consider encouraging more viewer interaction.`
      });
    }

    if (includeUniqueChatters && avgViewers > 30 && componentScores.ucp100Score < 40 && componentScores.ucp100Score >= 20) {
      flags.push({
        level: 'warning',
        message: `Below-average chatter participation (${componentScores.ucp100Score.toFixed(1)}/100) for ${avgViewers.toFixed(0)} avg viewers. Most viewers are lurking rather than engaging.`
      });
    }

    // Warning: High activity but poor growth
    if (componentScores.hoursScore > 70 && componentScores.f1kVHScore < 30) {
      flags.push({
        level: 'warning',
        message: `High streaming activity (${componentScores.hoursScore.toFixed(1)}/100) but poor follower conversion (${componentScores.f1kVHScore.toFixed(1)}/100). Content may need improvement or better marketing.`
      });
    }

    // Warning: Very inconsistent growth
    if (componentScores.consistencyScore < 30) {
      flags.push({
        level: 'warning',
        message: `Highly inconsistent follower growth (${componentScores.consistencyScore.toFixed(1)}/100). This could indicate sporadic viral moments or irregular content quality.`
      });
    }

    // Warning: Good viewers but almost no growth
    if (avgViewers > 50 && componentScores.f1kVHScore < 20) {
      flags.push({
        level: 'warning',
        message: `High viewership (${avgViewers.toFixed(0)} avg) but very poor follower growth (${componentScores.f1kVHScore.toFixed(1)}/100). Viewers may not find the content compelling enough to follow.`
      });
    }

    return flags;
  };

  const redFlags = detectRedFlags();
  const hasRedFlags = redFlags.length > 0;

  const getScoreColor = (score: number): { bg: string; text: string; icon?: string } => {
    // Determine if this metric is flagged
    const isCritical = score < 30;
    const isWarning = score >= 30 && score < 50;
    
    if (isCritical) {
      return { 
        bg: 'from-red-600 to-red-500', 
        text: 'text-red-400',
        icon: '⚠️'
      };
    } else if (isWarning) {
      return { 
        bg: 'from-yellow-600 to-yellow-500', 
        text: 'text-yellow-400',
        icon: '⚡'
      };
    } else if (score >= 80) {
      return { 
        bg: 'from-green-600 to-green-400', 
        text: 'text-green-400',
        icon: '✓'
      };
    } else {
      return { 
        bg: 'from-violet-600 to-violet-400', 
        text: 'text-violet-400'
      };
    }
  };

  const ScoreBar = ({ 
    score, 
    label, 
    tooltip 
  }: { 
    score: number; 
    label: string;
    tooltip: string;
  }) => {
    const colors = getScoreColor(score);
    
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <Tooltip content={tooltip}>
            <span className={`text-sm font-medium ${colors.text} inline-flex items-center gap-1`}>
              {colors.icon && <span className="text-base">{colors.icon}</span>}
              {label}
              <svg 
                className="w-4 h-4 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </span>
          </Tooltip>
          <span className={`text-sm font-medium ${colors.text}`}>
            {formatScore(score)}
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-3">
          <div
            className={`bg-gradient-to-r ${colors.bg} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </div>
      </div>
    );
  };

  const MetricDisplay = ({
    label,
    value,
    tooltip,
  }: {
    label: string;
    value: string | number;
    tooltip?: string;
  }) => (
    <div className="bg-slate-900 rounded-lg p-4">
      <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
        {label}
        {tooltip && (
          <Tooltip content={tooltip}>
            <svg 
              className="w-3 h-3 text-violet-400 cursor-help" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </Tooltip>
        )}
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );


  return (
    <div className="space-y-6">
      {/* Red Flags Warning Section */}
      {hasRedFlags && (
        <div className="space-y-3">
          {redFlags.map((flag, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 border-l-4 ${
                flag.level === 'critical'
                  ? 'bg-red-900/20 border-red-500 text-red-200'
                  : 'bg-yellow-900/20 border-yellow-500 text-yellow-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {flag.level === 'critical' ? '🚨' : '⚠️'}
                </span>
                <div>
                  <h4 className="font-bold mb-1">
                    {flag.level === 'critical' ? 'Critical Issue Detected' : 'Warning'}
                  </h4>
                  <p className="text-sm">{flag.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Final Score - Hero Section */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-lg p-8 shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-2 text-white/80">
          Legitimacy Score
        </h2>
        <div className="text-7xl font-bold text-white mb-2">
          {formatScore(finalScore)}
        </div>
        <div className="text-sm text-white/70">
          Analysis Period: {result.windowStart} to {result.windowEnd}
        </div>
      </div>

      {/* Intermediate Metrics */}
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-violet-400">
          Intermediate Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricDisplay
            label="Analysis Period"
            value={`${result.windowStart} to ${result.windowEnd}`}
            tooltip="Date range being analyzed for this legitimacy score calculation"
          />
          <MetricDisplay
            label="Total Streams"
            value={formatNumber(intermediateMetrics.totalStreams)}
            tooltip="Total number of individual streaming sessions across all periods"
          />
          <MetricDisplay
            label="Total Hours"
            value={formatNumberWithOneDecimal(intermediateMetrics.totalHours)}
            tooltip="Sum of all streaming hours across all sessions"
          />
          <MetricDisplay
            label="Weighted Avg Viewers"
            value={formatNumberWithOneDecimal(intermediateMetrics.weightedAvgViewers)}
            tooltip="Average concurrent viewers, weighted by stream duration to give more weight to longer streams"
          />
          <MetricDisplay
            label="Viewer Hours"
            value={formatNumber(intermediateMetrics.viewerHours)}
            tooltip="Total hours watched across all viewers (avg viewers × hours streamed)"
          />
          <MetricDisplay
            label="MPVM"
            value={formatNumberWithFourDecimals(intermediateMetrics.mpvm)}
            tooltip="Messages Per Viewer-Minute: total chat messages divided by total viewer-minutes"
          />
          <MetricDisplay
            label="UCP100"
            value={formatNumberWithDecimals(intermediateMetrics.ucp100)}
            tooltip="Unique Chatters Per 100 Viewers: measures what % of viewers actively chat"
          />
          <MetricDisplay
            label="F per 1kVH"
            value={formatNumberWithDecimals(intermediateMetrics.fPer1kVH)}
            tooltip="Followers gained per 1000 viewer-hours: measures follower conversion efficiency"
          />
          <MetricDisplay
            label="Consistency"
            value={formatNumberWithDecimals(intermediateMetrics.followerSpreadConsistency)}
            tooltip="Measures how consistent follower growth is across streams (0-1, higher = more consistent)"
          />
        </div>
      </div>

      {/* Component Scores */}
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-violet-400">Component Scores</h3>
        <div className="space-y-2">
          <ScoreBar 
            score={componentScores.streamsScore} 
            label="Streams Score"
            tooltip="Measures streaming consistency. Based on the number of individual streaming sessions. 60 streams in 60 days (1 per day) = perfect consistency."
          />
          <ScoreBar 
            score={componentScores.hoursScore} 
            label="Hours Score"
            tooltip="Measures total streaming time. Based on the cumulative hours streamed. More hours invested = higher score."
          />
          <ScoreBar
            score={componentScores.viewersScore}
            label="Viewers Score"
            tooltip="Measures audience size. Based on weighted average viewers across all streams. Uses logarithmic scaling to fairly compare channels of different sizes."
          />
          <ScoreBar 
            score={componentScores.mpvmScore} 
            label="MPVM Score"
            tooltip="Messages Per Viewer-Minute. Measures chat activity relative to viewership. Higher engagement rate = more interactive community."
          />
          <ScoreBar 
            score={componentScores.ucp100Score} 
            label="UCP100 Score"
            tooltip="Unique Chatters Per 100 Viewers. Measures what percentage of viewers actively participate in chat. Higher = more engaged community."
          />
          <ScoreBar 
            score={componentScores.f1kVHScore} 
            label="F1kVH Score"
            tooltip="Followers per 1000 Viewer-Hours. Measures growth quality - how efficiently you convert watch time into followers. Higher = stronger content appeal."
          />
          <ScoreBar
            score={componentScores.consistencyScore}
            label="Consistency Score"
            tooltip="Measures how steady your follower growth is across streams. More consistent growth = more sustainable channel development."
          />
        </div>
      </div>
    </div>
  );
}

