import { useState, useEffect } from 'react';
import { Settings } from './components/Settings';
import { StreamDataInput } from './components/StreamDataInput';
import { CSVUpload } from './components/CSVUpload';
import { StreamDataTable } from './components/StreamDataTable';
import { ResultsDisplay } from './components/ResultsDisplay';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateLegitimacyScore } from './utils/calculations';
import { exportToCSV } from './utils/csvParser';
import type {
  Settings as SettingsType,
  StreamData,
  CalculationResult,
} from './types';
import { defaultSettings } from './types';

function App() {
  const [settings, setSettings] = useLocalStorage<SettingsType>(
    'sls_settings',
    defaultSettings
  );
  const [streams, setStreams] = useLocalStorage<StreamData[]>(
    'sls_streams',
    []
  );
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Migrate old data that doesn't have numberOfStreams field
  useEffect(() => {
    const needsMigration = streams.some(stream => 
      typeof (stream as any).numberOfStreams === 'undefined'
    );
    
    if (needsMigration) {
      console.log('Migrating old data to include numberOfStreams field');
      const migratedStreams = streams.map(stream => ({
        ...stream,
        numberOfStreams: (stream as any).numberOfStreams || 1 // Default to 1 if missing
      }));
      setStreams(migratedStreams);
    }
  }, []);

  // Migrate old settings that have daysCap/daysWeight instead of streamsCap/streamsWeight
  useEffect(() => {
    const needsSettingsMigration = 
      typeof (settings as any).daysCap !== 'undefined' || 
      typeof (settings as any).daysWeight !== 'undefined';
    
    if (needsSettingsMigration) {
      console.log('Migrating old settings from daysCap/daysWeight to streamsCap/streamsWeight');
      const migratedSettings = {
        ...settings,
        streamsCap: (settings as any).daysCap || 60,
        streamsWeight: (settings as any).daysWeight || 0.10,
        // Remove old fields
        daysCap: undefined,
        daysWeight: undefined,
      };
      delete (migratedSettings as any).daysCap;
      delete (migratedSettings as any).daysWeight;
      setSettings(migratedSettings);
    }
  }, []);

  // Recalculate when streams or settings change
  useEffect(() => {
    if (streams.length > 0) {
      const calculatedResult = calculateLegitimacyScore(streams, settings);
      setResult(calculatedResult);
    } else {
      setResult(null);
    }
  }, [streams, settings]);

  const handleAddStream = (streamData: Omit<StreamData, 'id'>) => {
    const newStream: StreamData = {
      id: crypto.randomUUID(),
      ...streamData,
    };
    setStreams([...streams, newStream]);
  };

  const handleStreamsUploaded = (uploadedStreams: Omit<StreamData, 'id'>[]) => {
    const streamsWithIds = uploadedStreams.map((stream) => ({
      id: crypto.randomUUID(),
      ...stream,
    }));
    setStreams([...streams, ...streamsWithIds]);
  };

  const handleUpdateStream = (id: string, updatedStream: StreamData) => {
    setStreams(
      streams.map((stream) => (stream.id === id ? updatedStream : stream))
    );
  };

  const handleDeleteStream = (id: string) => {
    setStreams(streams.filter((stream) => stream.id !== id));
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(streams);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stream-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all stream data? This cannot be undone.'
      )
    ) {
      setStreams([]);
    }
  };

  const handleResetSettings = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all settings to defaults?'
      )
    ) {
      setSettings(defaultSettings);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg border-b border-violet-600/20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">
              Streamer <span className="text-violet-400">Legitimacy Score</span>
            </h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors duration-200"
            >
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Settings Panel (Collapsible) */}
          {showSettings && (
            <div className="space-y-4">
              <Settings settings={settings} onSettingsChange={setSettings} />
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
              >
                Reset Settings to Defaults
              </button>
            </div>
          )}

          {/* Results Display */}
          <ResultsDisplay result={result} />

          {/* Data Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StreamDataInput onAddStream={handleAddStream} />
            <CSVUpload onStreamsUploaded={handleStreamsUploaded} />
          </div>

          {/* Stream Data Table */}
          <StreamDataTable
            streams={streams}
            onUpdateStream={handleUpdateStream}
            onDeleteStream={handleDeleteStream}
          />

          {/* Action Buttons */}
          {streams.length > 0 && (
            <div className="flex gap-4">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors duration-200"
              >
                Export to CSV
              </button>
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
              >
                Clear All Data
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 mt-16 border-t border-violet-600/20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            Streamer Legitimacy Score Calculator - Analyze streaming performance
            and engagement metrics
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
