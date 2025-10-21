import { useRef } from 'react';
import type { StreamData } from '../types';
import { parseCSV } from '../utils/csvParser';

interface CSVUploadProps {
  onStreamsUploaded: (streams: Omit<StreamData, 'id'>[]) => void;
}

export function CSVUpload({ onStreamsUploaded }: CSVUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const streams = parseCSV(csvContent);
        onStreamsUploaded(streams);
        
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        alert(`Error parsing CSV: ${error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-violet-400">Upload CSV</h3>
      
      {/* Standard CSV Upload */}
      <div className="space-y-4">
        <p className="text-sm text-gray-300">
          Upload a CSV file with columns: Name, Period, Date, NumberOfStreams, Hours, AvgViewers, Messages,
          UniqueChatters, Followers
        </p>
        <p className="text-xs text-gray-400">
          Each row should represent aggregated data for the specified time period. Period should be one of: 1day, 30days, 60days, 90days, 180days, 365days
        </p>
        <a
          href="/streamer-score/sample-data.csv"
          download="sample-data.csv"
          className="inline-flex items-center gap-2 px-3 py-2 bg-violet-600/20 border border-violet-600/30 hover:bg-violet-600/30 text-violet-300 text-sm rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Sample CSV
        </a>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-600 file:text-white
            hover:file:bg-violet-700
            file:cursor-pointer cursor-pointer"
        />
      </div>

      {/* Horizontal Separator */}
      <div className="my-6 border-t border-violet-600/20"></div>

      {/* StreamCharts CSV Upload */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold text-violet-300">StreamCharts Import</h4>
          <span className="px-2 py-1 bg-yellow-900/30 border border-yellow-600/30 text-yellow-300 text-xs rounded-full">
            Coming Soon
          </span>
        </div>
        <p className="text-sm text-gray-300">
          Import data directly from StreamCharts exports. This feature will support StreamCharts CSV format with automatic column mapping.
        </p>
        <p className="text-xs text-gray-400">
          Working on it. Check back soon for this feature.
        </p>
        <div className="relative">
          <input
            type="file"
            accept=".csv"
            disabled
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-600 file:text-gray-400
              file:cursor-not-allowed cursor-not-allowed
              opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-md">
            <span className="text-sm text-gray-400 font-medium">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

