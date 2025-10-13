import { useState } from 'react';
import type { StreamData } from '../types';
import { Tooltip } from './Tooltip';

interface StreamDataInputProps {
  onAddStream: (stream: Omit<StreamData, 'id'>) => void;
}

export function StreamDataInput({ onAddStream }: StreamDataInputProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    numberOfStreams: '',
    hours: '',
    avgViewers: '',
    messages: '',
    uniqueChatters: '',
    followers: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mobile-friendly number parsing - handle commas, spaces, and other mobile input quirks
    const parseNumber = (value: string): number => {
      // Remove any non-numeric characters except decimal point and minus sign
      const cleanValue = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleanValue);
      const result = isNaN(parsed) ? 0 : parsed;
      
      // Debug logging for parsing differences
      console.log('parseNumber:', { 
        original: value, 
        cleaned: cleanValue, 
        parsed: parsed, 
        result: result,
        platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
      });
      
      return result;
    };

    const parseInteger = (value: string): number => {
      const cleanValue = value.replace(/[^\d-]/g, '');
      const parsed = parseInt(cleanValue, 10);
      const result = isNaN(parsed) ? 0 : parsed;
      
      // Debug logging for parsing differences
      console.log('parseInteger:', { 
        original: value, 
        cleaned: cleanValue, 
        parsed: parsed, 
        result: result,
        platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
      });
      
      return result;
    };

    const stream: Omit<StreamData, 'id'> = {
      name: formData.name.trim(),
      date: formData.date,
      numberOfStreams: parseInteger(formData.numberOfStreams),
      hours: parseNumber(formData.hours),
      avgViewers: parseNumber(formData.avgViewers),
      messages: parseInteger(formData.messages),
      uniqueChatters: parseInteger(formData.uniqueChatters),
      followers: parseInteger(formData.followers),
    };

    // Enhanced validation with better error messages
    const errors: string[] = [];
    if (!stream.name) errors.push('Streamer name is required');
    if (stream.numberOfStreams <= 0) errors.push('Number of streams must be greater than 0');
    if (stream.hours <= 0) errors.push('Hours must be greater than 0');
    if (stream.avgViewers <= 0) errors.push('Average viewers must be greater than 0');
    if (stream.messages <= 0) errors.push('Messages must be greater than 0');
    if (stream.uniqueChatters <= 0) errors.push('Unique chatters must be greater than 0');
    if (stream.followers < 0) errors.push('Followers cannot be negative');

    if (errors.length > 0) {
      alert('Please fix the following issues:\n' + errors.join('\n'));
      return;
    }

    onAddStream(stream);

    // Reset form
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      numberOfStreams: '',
      hours: '',
      avgViewers: '',
      messages: '',
      uniqueChatters: '',
      followers: '',
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
      <h3 className="text-xl font-bold mb-4 text-violet-400">Add Stream Data (60-Day Period)</h3>
      <p className="text-sm text-gray-400 mb-4">Each entry represents aggregated data for a 60-day period ending on the date you specify.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <LabelWithTooltip 
              label="Streamer Name" 
              tooltip="Name or identifier for this streamer (e.g., username, nickname, or any label to distinguish between different streamers)" 
            />
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. JohnStreamer"
              required
            />
          </div>
          <div>
            <LabelWithTooltip 
              label="End Date" 
              tooltip="The end date of your 60-day analysis period. Data will be calculated from 60 days before this date up to this date." 
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              required
            />
          </div>
          <div>
            <LabelWithTooltip 
              label="Number of Streams" 
              tooltip="Total number of individual streaming sessions during the 60-day period. Streaming 1x per day = 60 streams (excellent consistency)." 
            />
            <input
              type="number"
              value={formData.numberOfStreams}
              onChange={(e) =>
                setFormData({ ...formData, numberOfStreams: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. 30"
              min="1"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />
          </div>
          <div>
            <LabelWithTooltip 
              label="Hours Streamed" 
              tooltip="Total hours streamed during the entire 60-day period (not per day)" 
            />
            <input
              type="number"
              step="0.1"
              value={formData.hours}
              onChange={(e) =>
                setFormData({ ...formData, hours: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. 120"
              min="0.1"
              inputMode="decimal"
              required
            />
          </div>
          <div>
            <LabelWithTooltip 
              label="Avg Viewers" 
              tooltip="Average concurrent viewers across all streams during the 60-day period" 
            />
            <input
              type="number"
              step="0.1"
              value={formData.avgViewers}
              onChange={(e) =>
                setFormData({ ...formData, avgViewers: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. 150"
              min="0.1"
              inputMode="decimal"
              required
            />
          </div>
          <div>
            <LabelWithTooltip 
              label="Messages" 
              tooltip="Total chat messages sent during the entire 60-day period" 
            />
            <input
              type="number"
              value={formData.messages}
              onChange={(e) =>
                setFormData({ ...formData, messages: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. 15000"
              min="1"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />
          </div>
          <div>
            <LabelWithTooltip 
              label="Unique Chatters" 
              tooltip="Total number of unique users who chatted during the 60-day period" 
            />
            <input
              type="number"
              value={formData.uniqueChatters}
              onChange={(e) =>
                setFormData({ ...formData, uniqueChatters: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. 800"
              min="1"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />
          </div>
          <div>
            <LabelWithTooltip 
              label="Followers Gained" 
              tooltip="Total new followers gained during the entire 60-day period" 
            />
            <input
              type="number"
              value={formData.followers}
              onChange={(e) =>
                setFormData({ ...formData, followers: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. 250"
              min="0"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
        >
          Add Stream
        </button>
      </form>
    </div>
  );
}

