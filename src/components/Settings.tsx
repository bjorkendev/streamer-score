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
                onChange={(e) =>
                  handlePeriodSettingChange('streamsWeight', parseFloat(e.target.value))
                }
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
                onChange={(e) =>
                  handlePeriodSettingChange('hoursWeight', parseFloat(e.target.value))
                }
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
                onChange={(e) =>
                  handlePeriodSettingChange('viewersWeight', parseFloat(e.target.value))
                }
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
                onChange={(e) =>
                  handlePeriodSettingChange('mpvmWeight', parseFloat(e.target.value))
                }
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
                onChange={(e) =>
                  handlePeriodSettingChange('ucp100Weight', parseFloat(e.target.value))
                }
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
                onChange={(e) =>
                  handlePeriodSettingChange('f1kVHWeight', parseFloat(e.target.value))
                }
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
                onChange={(e) =>
                  handlePeriodSettingChange('consistencyWeight', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip
                label="Follower Count Weight"
                tooltip="How much follower count influences the final score. Higher = more emphasis on overall follower base. Default: 0.20 (20%)"
              />
              <input
                type="number"
                step="0.01"
                value={periodSettings.followerCountWeight}
                onChange={(e) =>
                  handlePeriodSettingChange('followerCountWeight', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
