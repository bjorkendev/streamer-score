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
      <h3 className="text-xl font-bold mb-4 text-violet-400">Upload CSV (60-Day Period)</h3>
      <div className="space-y-4">
        <p className="text-sm text-gray-300">
          Upload a CSV file with columns: Date, Hours, AvgViewers, Messages,
          UniqueChatters, Followers
        </p>
        <p className="text-xs text-gray-400">
          Each row should represent aggregated data for a 60-day period ending on the date specified.
        </p>
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
    </div>
  );
}

