import type { CalculationResult } from '../types';
import { Tooltip } from './Tooltip';

interface ResultsDisplayProps {
  result: CalculationResult | null;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
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

  const ScoreBar = ({ 
    score, 
    label, 
    tooltip 
  }: { 
    score: number; 
    label: string;
    tooltip: string;
  }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <Tooltip content={tooltip}>
          <span className="text-sm font-medium text-gray-300 inline-flex items-center gap-1">
            {label}
            <svg 
              className="w-4 h-4 text-violet-400" 
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
        <span className="text-sm font-medium text-white">
          {score.toFixed(1)}
        </span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-violet-600 to-violet-400 h-3 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  );

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
      {/* Final Score - Hero Section */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-lg p-8 shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-2 text-white/80">
          Legitimacy Score
        </h2>
        <div className="text-7xl font-bold text-white mb-2">
          {finalScore.toFixed(1)}
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
            label="Total Hours"
            value={intermediateMetrics.totalHours.toFixed(1)}
            tooltip="Sum of all streaming hours across all sessions"
          />
          <MetricDisplay
            label="Weighted Avg Viewers"
            value={intermediateMetrics.weightedAvgViewers.toFixed(1)}
            tooltip="Average concurrent viewers, weighted by stream duration to give more weight to longer streams"
          />
          <MetricDisplay
            label="Viewer Hours"
            value={intermediateMetrics.viewerHours.toFixed(0)}
            tooltip="Total hours watched across all viewers (avg viewers × hours streamed)"
          />
          <MetricDisplay
            label="MPVM"
            value={intermediateMetrics.mpvm.toFixed(4)}
            tooltip="Messages Per Viewer-Minute: total chat messages divided by total viewer-minutes"
          />
          <MetricDisplay
            label="UCP100"
            value={intermediateMetrics.ucp100.toFixed(2)}
            tooltip="Unique Chatters Per 100 Viewers: measures what % of viewers actively chat"
          />
          <MetricDisplay
            label="F per 1kVH"
            value={intermediateMetrics.fPer1kVH.toFixed(2)}
            tooltip="Followers gained per 1000 viewer-hours: measures follower conversion efficiency"
          />
          <MetricDisplay
            label="Consistency"
            value={intermediateMetrics.followerSpreadConsistency.toFixed(3)}
            tooltip="Measures how consistent follower growth is across streams (0-1, higher = more consistent)"
          />
        </div>
      </div>

      {/* Component Scores */}
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-violet-400">Component Scores</h3>
        <div className="space-y-2">
          <ScoreBar 
            score={componentScores.daysScore} 
            label="Days Score"
            tooltip="Measures streaming frequency. Based on how many unique days you streamed within the analysis period. More consistent streaming = higher score."
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

