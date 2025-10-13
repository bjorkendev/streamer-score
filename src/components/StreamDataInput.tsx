import { useState } from 'react';
import type { StreamData } from '../types';
import { Tooltip } from './Tooltip';

interface StreamDataInputProps {
  onAddStream: (stream: Omit<StreamData, 'id'>) => void;
}

export function StreamDataInput({ onAddStream }: StreamDataInputProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    avgViewers: '',
    messages: '',
    uniqueChatters: '',
    followers: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const stream: Omit<StreamData, 'id'> = {
      date: formData.date,
      hours: parseFloat(formData.hours),
      avgViewers: parseFloat(formData.avgViewers),
      messages: parseInt(formData.messages, 10),
      uniqueChatters: parseInt(formData.uniqueChatters, 10),
      followers: parseInt(formData.followers, 10),
    };

    // Validate
    if (
      isNaN(stream.hours) ||
      isNaN(stream.avgViewers) ||
      isNaN(stream.messages) ||
      isNaN(stream.uniqueChatters) ||
      isNaN(stream.followers)
    ) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    onAddStream(stream);

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
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

