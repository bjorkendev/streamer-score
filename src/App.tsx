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
  const [selectedStream, setSelectedStream] = useState<StreamData | null>(null);

  // Migrate old data that doesn't have numberOfStreams field
  useEffect(() => {
    const needsMigration = streams.some(stream => 
      typeof (stream as any).numberOfStreams === 'undefined'
    );
    
        if (needsMigration) {
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
      const migratedSettings = {
        ...defaultSettings, // Start with clean defaults
        ...settings, // Overlay existing settings
        streamsCap: (settings as any).daysCap || 60,
        streamsWeight: (settings as any).daysWeight || 0.10,
      };
      // Remove old fields
      delete (migratedSettings as any).daysCap;
      delete (migratedSettings as any).daysWeight;
      setSettings(migratedSettings);
    }
  }, []);


  // Recalculate when streams or settings change
  useEffect(() => {
    if (streams.length > 0 && !selectedStream) {
      const calculatedResult = calculateLegitimacyScore(streams, settings);
      setResult(calculatedResult);
    } else if (streams.length === 0) {
      setResult(null);
    }
  }, [streams, settings, selectedStream]);

  // Calculate score for selected stream when it changes
  useEffect(() => {
    if (selectedStream) {
      const calculatedResult = calculateLegitimacyScore([selectedStream], settings);
      setResult(calculatedResult);
    }
  }, [selectedStream, settings]);

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
        'Are you sure you want to reset all settings to defaults? This will clear any custom settings and use the standard values.'
      )
    ) {
      setSettings(defaultSettings);
      // Also clear from localStorage to ensure clean reset
      localStorage.removeItem('sls_settings');
    }
  };

  const handleViewScore = (stream: StreamData) => {
    setSelectedStream(stream);
    // Scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllScores = () => {
    setSelectedStream(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
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
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
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
          {selectedStream && (
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-300">
                    Viewing Score for Single Period: {selectedStream.name}
                  </h3>
                  <p className="text-sm text-blue-200">
                    Period: {(() => {
                      const end = new Date(selectedStream.date);
                      const start = new Date(end);
                      start.setDate(end.getDate() - 60);
                      return `${start.toISOString().split('T')[0]} to ${selectedStream.date}`;
                    })()}
                  </p>
                </div>
                <button
                  onClick={handleViewAllScores}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                >
                  View All Periods
                </button>
              </div>
            </div>
          )}
          <ResultsDisplay result={result} />

          {/* Data Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StreamDataInput onAddStream={handleAddStream} />
            <CSVUpload onStreamsUploaded={handleStreamsUploaded} />
          </div>

          {/* Stream Data Table */}
          <StreamDataTable
            streams={streams}
            settings={settings}
            onUpdateStream={handleUpdateStream}
            onDeleteStream={handleDeleteStream}
            onViewScore={handleViewScore}
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
      <footer className="bg-slate-800 border-t border-violet-600/20 mt-auto">
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
