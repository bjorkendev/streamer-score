import type { Settings as SettingsType } from '../types';
import { Tooltip } from './Tooltip';

interface SettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
}

export function Settings({ settings, onSettingsChange }: SettingsProps) {
  const handleChange = (field: keyof SettingsType, value: number) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

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

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-violet-400">Settings</h2>
      
      <div className="space-y-6">
        {/* Date Window */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Date Window</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <LabelWithTooltip 
                label="Window Start (days ago)" 
                tooltip="How many days back from today to start analyzing data. Default is 60 days ago."
              />
              <input
                type="number"
                value={settings.windowStartDays}
                onChange={(e) =>
                  handleChange('windowStartDays', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Window End (days ago)" 
                tooltip="How many days back from today to end the analysis. Default is 0 (today)."
              />
              <input
                type="number"
                value={settings.windowEndDays}
                onChange={(e) =>
                  handleChange('windowEndDays', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
          </div>
        </div>

        {/* Performance Caps */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Performance Caps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <LabelWithTooltip 
                label="Streams Cap" 
                tooltip="Maximum number of individual streams considered 'excellent'. 60 streams = 1 per day (perfect consistency). More than this gives diminishing returns. Default: 60"
              />
              <input
                type="number"
                value={settings.streamsCap}
                onChange={(e) =>
                  handleChange('streamsCap', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Hours Cap" 
                tooltip="Maximum total hours considered 'excellent'. More hours than this adds little to the score. Default: 60 hours."
              />
              <input
                type="number"
                value={settings.hoursCap}
                onChange={(e) =>
                  handleChange('hoursCap', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Viewers Cap" 
                tooltip="Weighted average viewer count considered 'top-tier'. Used as the maximum for logarithmic scaling. Default: 1000 viewers."
              />
              <input
                type="number"
                value={settings.viewersCap}
                onChange={(e) =>
                  handleChange('viewersCap', parseFloat(e.target.value))
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
                tooltip="Target messages per viewer-minute (engagement rate). Higher means great chat activity, lower means poor engagement. Default: 0.05"
              />
              <input
                type="number"
                step="0.001"
                value={settings.mpvmTarget}
                onChange={(e) =>
                  handleChange('mpvmTarget', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="UCP100 Target" 
                tooltip="Target unique chatters per 100 viewers. Measures how interactive the audience is. Default: 30"
              />
              <input
                type="number"
                value={settings.ucp100Target}
                onChange={(e) =>
                  handleChange('ucp100Target', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="F1kVH Target" 
                tooltip="Target followers gained per 1000 viewer-hours. Measures growth quality relative to reach. Default: 15"
              />
              <input
                type="number"
                value={settings.f1kVHTarget}
                onChange={(e) =>
                  handleChange('f1kVHTarget', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Min Viewer Hours" 
                tooltip="Minimum total viewer-hours before the score counts fully. Prevents small sample sizes from skewing results. Default: 50"
              />
              <input
                type="number"
                value={settings.minViewerHours}
                onChange={(e) =>
                  handleChange('minViewerHours', parseFloat(e.target.value))
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
                value={settings.streamsWeight}
                onChange={(e) =>
                  handleChange('streamsWeight', parseFloat(e.target.value))
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
                value={settings.hoursWeight}
                onChange={(e) =>
                  handleChange('hoursWeight', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Viewers Weight" 
                tooltip="How much audience size influences the final score. Higher = more emphasis on reach. Default: 0.25 (25%)"
              />
              <input
                type="number"
                step="0.01"
                value={settings.viewersWeight}
                onChange={(e) =>
                  handleChange('viewersWeight', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="MPVM Weight" 
                tooltip="How much chat engagement influences the final score. Higher = more emphasis on interaction. Default: 0.15 (15%)"
              />
              <input
                type="number"
                step="0.01"
                value={settings.mpvmWeight}
                onChange={(e) =>
                  handleChange('mpvmWeight', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="UCP100 Weight" 
                tooltip="How much community participation influences the final score. Higher = more emphasis on active chatters. Default: 0.10 (10%)"
              />
              <input
                type="number"
                step="0.01"
                value={settings.ucp100Weight}
                onChange={(e) =>
                  handleChange('ucp100Weight', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="F1kVH Weight" 
                tooltip="How much follower conversion influences the final score. Higher = more emphasis on growth quality. Default: 0.15 (15%)"
              />
              <input
                type="number"
                step="0.01"
                value={settings.f1kVHWeight}
                onChange={(e) =>
                  handleChange('f1kVHWeight', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <LabelWithTooltip 
                label="Consistency Weight" 
                tooltip="How much growth consistency influences the final score. Higher = more emphasis on steady growth. Default: 0.05 (5%)"
              />
              <input
                type="number"
                step="0.01"
                value={settings.consistencyWeight}
                onChange={(e) =>
                  handleChange('consistencyWeight', parseFloat(e.target.value))
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

