import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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
import { defaultSettings, PERIOD_LABELS, PERIOD_DAYS } from './types';

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

  // Migrate old data format to new period-based system
  useEffect(() => {
    // Check if data needs migration to new format with period field
    const needsDataMigration = streams.some(stream => 
      typeof (stream as any).period === 'undefined'
    );
    
    if (needsDataMigration) {
      console.log('Migrating stream data to period-based system...');
      const migratedStreams = streams.map(stream => ({
        ...stream,
        period: (stream as any).period || '60days', // Default to 60days for old data
        numberOfStreams: (stream as any).numberOfStreams || 1,
      }));
      setStreams(migratedStreams);
    }
  }, []);

  // Migrate old settings format to new period-based system
  useEffect(() => {
    const needsSettingsMigration = 
      typeof (settings as any).periods === 'undefined' ||
      typeof (settings as any).streamsCap !== 'undefined';
    
    if (needsSettingsMigration) {
      console.log('Migrating settings to period-based system...');
      setSettings(defaultSettings);
    }
  }, []);


  // Don't calculate combined score by default - only show scores for individual periods
  useEffect(() => {
    if (streams.length === 0) {
      setResult(null);
    }
  }, [streams]);

  // Calculate score for selected stream when it changes
  useEffect(() => {
    if (selectedStream) {
      const calculatedResult = calculateLegitimacyScore(selectedStream, settings);
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
      {/* Toast Notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 10000,
          style: {
            width: '400px',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
          },
        }}
      />
      
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
          {selectedStream ? (
            <>
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-300">
                      Viewing Score for: {selectedStream.name}
                    </h3>
                    <p className="text-sm text-blue-200">
                      {PERIOD_LABELS[selectedStream.period]} Period: {(() => {
                        const end = new Date(selectedStream.date);
                        const start = new Date(end);
                        const periodDays = PERIOD_DAYS[selectedStream.period];
                        start.setDate(end.getDate() - periodDays);
                        return `${start.toISOString().split('T')[0]} to ${selectedStream.date}`;
                      })()}
                    </p>
                  </div>
                  <button
                    onClick={handleViewAllScores}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
              <ResultsDisplay result={result} stream={selectedStream} />
            </>
          ) : streams.length > 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 shadow-lg text-center">
              <div className="text-violet-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Period to View Score</h3>
              <p className="text-gray-400">
                Click the <span className="text-blue-400 font-semibold">"View Score"</span> button on any period below to calculate its legitimacy score.
              </p>
            </div>
          ) : (
            <ResultsDisplay result={result} />
          )}

          {/* Data Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StreamDataInput onAddStream={handleAddStream} settings={settings} />
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
