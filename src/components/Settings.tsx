import type { Settings as SettingsType } from '../types';

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

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-violet-400">Settings</h2>
      
      <div className="space-y-6">
        {/* Date Window */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Date Window</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Window Start (days ago)
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Window End (days ago)
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Days Cap
              </label>
              <input
                type="number"
                value={settings.daysCap}
                onChange={(e) =>
                  handleChange('daysCap', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Hours Cap
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Viewers Cap
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                MPVM Target
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                UCP100 Target
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                F1kVH Target
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Min Viewer Hours
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Days Weight
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.daysWeight}
                onChange={(e) =>
                  handleChange('daysWeight', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Hours Weight
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Viewers Weight
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                MPVM Weight
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                UCP100 Weight
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                F1kVH Weight
              </label>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Consistency Weight
              </label>
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

