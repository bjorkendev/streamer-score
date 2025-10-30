import { useState } from 'react';
import type { Settings as SettingsType, TimePeriod, PeriodSettings } from '../types';
import { PERIOD_LABELS } from '../types';
import { Tooltip } from './Tooltip';

interface SettingsProps {
  settings: SettingsType;
  onSettingsChange: (newSettings: SettingsType) => void;
}

const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-1">
    {label}
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
  </label>
);

export function Settings({ settings, onSettingsChange }: SettingsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('60days');

  const handlePeriodSettingChange = (field: keyof PeriodSettings, value: number) => {
    onSettingsChange({
      ...settings,
      periods: {
        ...settings.periods,
        [selectedPeriod]: {
          ...settings.periods[selectedPeriod],
          [field]: value,
        },
      },
    });
  };

  // Round to nearest 1% and rebalance to keep total at exactly 1.0
  const handleWeightChange = (field: keyof PeriodSettings, rawValue: number) => {
    const period = settings.periods[selectedPeriod];
    const round2 = (v: number) => Math.max(0, Math.min(1, Math.round(v * 100) / 100));

    // Current weights
    const weights: Record<string, number> = {
      streamsWeight: period.streamsWeight ?? 0,
      hoursWeight: period.hoursWeight ?? 0,
      viewersWeight: period.viewersWeight ?? 0,
      mpvmWeight: period.mpvmWeight ?? 0,
      ucp100Weight: period.ucp100Weight ?? 0,
      f1kVHWeight: period.f1kVHWeight ?? 0,
      consistencyWeight: period.consistencyWeight ?? 0,
      followerCountWeight: (period as any).followerCountWeight ?? 0,
    };

    // Apply change to target field (rounded to 1%)
    const newVal = round2(rawValue);
    weights[field as string] = newVal;

    // Compute sum and adjust followerCountWeight as counter-balance
    const sumWithoutFollower =
      weights.streamsWeight +
      weights.hoursWeight +
      weights.viewersWeight +
      weights.mpvmWeight +
      weights.ucp100Weight +
      weights.f1kVHWeight +
      weights.consistencyWeight;

    let follower = round2(1 - sumWithoutFollower);

    // If user edited follower itself, then compute deficit and adjust Streams as fallback bucket
    if (field === 'followerCountWeight') {
      follower = newVal;
      const sumAll = sumWithoutFollower + follower;
      if (Math.abs(sumAll - 1) > 0.0001) {
        // Use streamsWeight as balancing bucket
        const needed = round2(1 - (sumAll - weights.streamsWeight));
        weights.streamsWeight = needed;
      }
    } else {
      weights.followerCountWeight = follower;
      // If follower went negative due to rounding, pull back from the edited field
      const total = sumWithoutFollower + follower;
      if (total > 1) {
        const overflow = round2(total - 1);
        const reduced = round2(newVal - overflow);
        weights[field as string] = reduced;
        weights.followerCountWeight = round2(1 - (
          (sumWithoutFollower - newVal + reduced)
        ));
      }
    }

    // Write back
    onSettingsChange({
      ...settings,
      periods: {
        ...settings.periods,
        [selectedPeriod]: {
          ...period,
          streamsWeight: weights.streamsWeight,
          hoursWeight: weights.hoursWeight,
          viewersWeight: weights.viewersWeight,
          mpvmWeight: weights.mpvmWeight,
          ucp100Weight: weights.ucp100Weight,
          f1kVHWeight: weights.f1kVHWeight,
          consistencyWeight: weights.consistencyWeight,
          followerCountWeight: weights.followerCountWeight,
        } as PeriodSettings,
      },
    });
  };

  const periodSettings = settings.periods[selectedPeriod];

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-violet-400">Settings</h2>

      {/* Period Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(PERIOD_LABELS).map(([period, label]) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as TimePeriod)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Configure settings for {PERIOD_LABELS[selectedPeriod]} periods
        </p>
      </div>

      <div className="space-y-6">
        {/* Performance Caps */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Performance Caps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <LabelWithTooltip
                label="Streams Cap"
                tooltip="Maximum number of individual streams considered 'excellent'. Streaming once per day for the entire period equals this cap. Default scales with period length."
              />
              <input
                type="number"
                value={periodSettings.streamsCap}
                onChange={(e) =>
                  handlePeriodSettingChange('streamsCap', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="Hours Cap"
                tooltip="Maximum total hours considered 'excellent'. Streaming one hour per day for the entire period equals this cap. Default scales with period length."
              />
              <input
                type="number"
                value={periodSettings.hoursCap}
                onChange={(e) =>
                  handlePeriodSettingChange('hoursCap', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="Viewers Cap"
                tooltip="Maximum average viewers considered 'excellent'. More viewers than this adds little to the score. Default: 1000 viewers."
              />
              <input
                type="number"
                value={periodSettings.viewersCap}
                onChange={(e) =>
                  handlePeriodSettingChange('viewersCap', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
          </div>
        </div>

        {/* Performance Targets */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Performance Targets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <LabelWithTooltip
                label="MPVM Target"
                tooltip="Messages Per Viewer-Minute target. Higher MPVM indicates more engagement. Default: 0.05"
              />
              <input
                type="number"
                step="0.01"
                value={periodSettings.mpvmTarget}
                onChange={(e) =>
                  handlePeriodSettingChange('mpvmTarget', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="UCP100 Target"
                tooltip="Unique Chatters Per 100 Viewers target. Higher UCP100 indicates a more active chat. Default: 30"
              />
              <input
                type="number"
                value={periodSettings.ucp100Target}
                onChange={(e) =>
                  handlePeriodSettingChange('ucp100Target', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="F1kVH Target"
                tooltip="Followers per 1000 Viewer-Hours target. Higher F1kVH indicates better growth efficiency. Default: 15"
              />
              <input
                type="number"
                value={periodSettings.f1kVHTarget}
                onChange={(e) =>
                  handlePeriodSettingChange('f1kVHTarget', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="Min Viewer Hours"
                tooltip="Minimum Viewer Hours required to avoid a penalty. Below this, the final score is scaled down. Default scales with period length."
              />
              <input
                type="number"
                value={periodSettings.minViewerHours}
                onChange={(e) =>
                  handlePeriodSettingChange('minViewerHours', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="Follower Count Cap"
                tooltip="Follower count considered excellent (100 score). Used for logarithmic scaling. Default: 10,000"
              />
              <input
                type="number"
                value={periodSettings.followerCountCap}
                onChange={(e) =>
                  handlePeriodSettingChange('followerCountCap', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
          </div>
        </div>

        {/* Weights */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Weights (must sum to 1.0)</h3>
          {/* Total Indicator */}
          <div className="mb-3 text-sm">
            {(() => {
              const total = (
                (periodSettings.streamsWeight ?? 0) +
                (periodSettings.hoursWeight ?? 0) +
                (periodSettings.viewersWeight ?? 0) +
                ((periodSettings as any).followerCountWeight ?? 0) +
                (periodSettings.mpvmWeight ?? 0) +
                (periodSettings.ucp100Weight ?? 0) +
                (periodSettings.f1kVHWeight ?? 0) +
                (periodSettings.consistencyWeight ?? 0)
              );
              const pct = Math.round(total * 100);
              const ok = pct === 100;
              return (
                <span className={ok ? 'text-green-300' : 'text-yellow-300'}>
                  Total: {pct}%
                </span>
              );
            })()}
          </div>
          {/* Order: Streams, Hours, Viewers, FollowerCount, MPVM, UCP100, F1kVH, Consistency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <LabelWithTooltip
                label="Streams Weight"
                tooltip="How much streaming frequency influences the final score. Higher = more emphasis on consistency. Default: 0.10 (10%)"
              />
              <input
                type="number"
                step="0.01"
                value={periodSettings.streamsWeight}
                min={0}
                max={1}
                onChange={(e) => handleWeightChange('streamsWeight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="Hours Weight"
                tooltip="How much total stream time influences the final score. Higher = more emphasis on dedication. Default: 0.20 (20%)"
              />
              <input
                type="number"
                step="0.01"
                value={periodSettings.hoursWeight}
                min={0}
                max={1}
                onChange={(e) => handleWeightChange('hoursWeight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="Viewers Weight"
                tooltip="How much average viewership influences the final score. Higher = more emphasis on audience size. Default: 0.25 (25%)"
              />
              <input
                type="number"
                step="0.01"
                value={periodSettings.viewersWeight}
                min={0}
                max={1}
                onChange={(e) => handleWeightChange('viewersWeight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="Follower Count Weight"
                tooltip="How much follower count influences the final score. Higher = more emphasis on overall follower base."
              />
              <input
                type="number"
                step="0.01"
                value={(periodSettings as any).followerCountWeight}
                min={0}
                max={1}
                onChange={(e) => handleWeightChange('followerCountWeight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="MPVM Weight"
                tooltip="How much messages per viewer-minute influences the final score. Higher = more emphasis on chat engagement. Default: 0.15 (15%)"
              />
              <input
                type="number"
                step="0.01"
                value={periodSettings.mpvmWeight}
                min={0}
                max={1}
                onChange={(e) => handleWeightChange('mpvmWeight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="UCP100 Weight"
                tooltip="How much unique chatters per 100 viewers influences the final score. Higher = more emphasis on chat diversity. Default: 0.10 (10%)"
              />
              <input
                type="number"
                step="0.01"
                value={periodSettings.ucp100Weight}
                min={0}
                max={1}
                onChange={(e) => handleWeightChange('ucp100Weight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="F1kVH Weight"
                tooltip="How much followers per 1000 viewer-hours influences the final score. Higher = more emphasis on growth efficiency. Default: 0.15 (15%)"
              />
              <input
                type="number"
                step="0.01"
                value={periodSettings.f1kVHWeight}
                min={0}
                max={1}
                onChange={(e) => handleWeightChange('f1kVHWeight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="Consistency Weight"
                tooltip="How much follower spread consistency influences the final score. Higher = more emphasis on stable growth. Default: 0.05 (5%)"
              />
              <input
                type="number"
                step="0.01"
                value={periodSettings.consistencyWeight}
                min={0}
                max={1}
                onChange={(e) => handleWeightChange('consistencyWeight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
