import { useState } from 'react';
import toast from 'react-hot-toast';
import type { StreamData, TimePeriod, Settings } from '../types';
import { PERIOD_LABELS, PERIOD_DAYS } from '../types';
import { Tooltip } from './Tooltip';
import { CustomSelect } from './CustomSelect';
import { calculateLegitimacyScore } from '../utils/calculations';

interface StreamDataInputProps {
  onAddStream: (stream: Omit<StreamData, 'id'>) => void;
  settings: Settings;
}

export function StreamDataInput({ onAddStream, settings }: StreamDataInputProps) {
  const [formData, setFormData] = useState({
    name: '',
    period: '60days' as TimePeriod,
    date: new Date().toISOString().split('T')[0],
    numberOfStreams: '',
    hours: '',
    avgViewers: '',
    messages: '',
    uniqueChatters: '',
    followers: '',
    includeMessages: true,
    includeUniqueChatters: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mobile-friendly number parsing - handle commas, spaces, and other mobile input quirks
    const parseNumber = (value: string): number => {
      // Remove any non-numeric characters except decimal point and minus sign
      const cleanValue = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleanValue);
      const result = isNaN(parsed) ? 0 : parsed;
      
      
      return result;
    };

    const parseInteger = (value: string): number => {
      const cleanValue = value.replace(/[^\d-]/g, '');
      const parsed = parseInt(cleanValue, 10);
      const result = isNaN(parsed) ? 0 : parsed;
      
      
      return result;
    };

    const stream: Omit<StreamData, 'id'> = {
      name: formData.name.trim(),
      period: formData.period,
      date: formData.date,
      numberOfStreams: parseInteger(formData.numberOfStreams),
      hours: parseNumber(formData.hours),
      avgViewers: parseNumber(formData.avgViewers),
      messages: formData.includeMessages ? parseInteger(formData.messages) : 0,
      uniqueChatters: formData.includeUniqueChatters ? parseInteger(formData.uniqueChatters) : 0,
      followers: parseInteger(formData.followers),
      includeMessages: formData.includeMessages,
      includeUniqueChatters: formData.includeUniqueChatters,
    };

    // Enhanced validation with better error messages
    const errors: string[] = [];
    if (!stream.name) errors.push('Streamer name is required');
    if (stream.numberOfStreams <= 0) errors.push('Number of streams must be greater than 0');
    if (stream.hours <= 0) errors.push('Hours must be greater than 0');
    if (stream.avgViewers <= 0) errors.push('Average viewers must be greater than 0');
    if (formData.includeMessages && stream.messages <= 0) errors.push('Messages must be greater than 0');
    if (formData.includeUniqueChatters && stream.uniqueChatters <= 0) errors.push('Unique chatters must be greater than 0');
    if (stream.followers < 0) errors.push('Followers cannot be negative');

    if (errors.length > 0) {
      alert('Please fix the following issues:\n' + errors.join('\n'));
      return;
    }

    onAddStream(stream);

    // Check for red flags and show toasts
    const streamWithId = { ...stream, id: crypto.randomUUID() };
    const result = calculateLegitimacyScore(streamWithId, settings);
    const avgViewers = result.intermediateMetrics.weightedAvgViewers;
    const scores = result.componentScores;
    
    // Show toast notifications for issues (only if metrics are included)
    if (stream.includeMessages && avgViewers > 50 && scores.mpvmScore < 20) {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Critical Issue Detected</p>
                <p className="text-xs">Very low chat activity for viewer count. Potential viewbotting detected!</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-red-300 hover:text-red-100 transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="w-full bg-red-950 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-red-400 ease-linear"
                style={{ 
                  width: '100%',
                  animation: 'shrink 10s linear forwards'
                }}
              />
            </div>
          </div>
        ),
        {
          duration: 10000,
          style: {
            background: '#7f1d1d',
            color: '#fecaca',
            border: 'none',
            width: '400px',
            padding: '16px',
          },
        }
      );
    } else if (stream.includeUniqueChatters && avgViewers > 50 && scores.ucp100Score < 20) {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Critical Issue Detected</p>
                <p className="text-xs">Very few unique chatters for viewer count. Suspicious pattern detected!</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-red-300 hover:text-red-100 transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="w-full bg-red-950 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-red-400 ease-linear"
                style={{ 
                  width: '100%',
                  animation: 'shrink 10s linear forwards'
                }}
              />
            </div>
          </div>
        ),
        {
          duration: 10000,
          style: {
            background: '#7f1d1d',
            color: '#fecaca',
            border: 'none',
            width: '400px',
            padding: '16px',
          },
        }
      );
    } else if (avgViewers > 30 && ((stream.includeMessages && scores.mpvmScore < 40) || (stream.includeUniqueChatters && scores.ucp100Score < 40))) {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Warning</p>
                <p className="text-xs">Below-average engagement for viewer count.</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-yellow-300 hover:text-yellow-100 transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="w-full bg-yellow-950 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-yellow-400 ease-linear"
                style={{ 
                  width: '100%',
                  animation: 'shrink 10s linear forwards'
                }}
              />
            </div>
          </div>
        ),
        {
          duration: 10000,
          style: {
            background: '#713f12',
            color: '#fef3c7',
            border: 'none',
            width: '400px',
            padding: '16px',
          },
        }
      );
    }
    
    // Show warning for poor growth despite good activity
    if (scores.hoursScore > 70 && scores.f1kVHScore < 30) {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Warning</p>
                <p className="text-xs">High streaming hours but poor follower conversion.</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-yellow-300 hover:text-yellow-100 transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="w-full bg-yellow-950 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-yellow-400 ease-linear"
                style={{ 
                  width: '100%',
                  animation: 'shrink 10s linear forwards'
                }}
              />
            </div>
          </div>
        ),
        {
          duration: 10000,
          style: {
            background: '#713f12',
            color: '#fef3c7',
            border: 'none',
            width: '400px',
            padding: '16px',
          },
        }
      );
    }

    // Reset form
    setFormData({
      name: '',
      period: formData.period, // Keep the same period
      date: new Date().toISOString().split('T')[0],
      numberOfStreams: '',
      hours: '',
      avgViewers: '',
      messages: '',
      uniqueChatters: '',
      followers: '',
      includeMessages: formData.includeMessages, // Keep the same settings
      includeUniqueChatters: formData.includeUniqueChatters,
    });
  };

  const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
    <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
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

  const periodDays = PERIOD_DAYS[formData.period];

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-violet-400">Add Stream Data</h3>
      <p className="text-sm text-gray-400 mb-4">Each entry represents aggregated data for the selected time period ending on the date you specify.</p>
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
              placeholder="e.g. AlexStreams"
              required
            />
          </div>
          <div>
            <LabelWithTooltip 
              label="Time Period" 
              tooltip="Select the time period this data represents. Each period has different performance expectations and targets." 
            />
            <CustomSelect
              value={formData.period}
              onChange={(value) => setFormData({ ...formData, period: value as TimePeriod })}
              options={Object.entries(PERIOD_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>
          <div>
            <LabelWithTooltip 
              label="End Date" 
              tooltip={`The end date of your ${periodDays}-day analysis period. Data will be calculated from ${periodDays} days before this date up to this date.`}
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
              tooltip={`Total number of individual streaming sessions during the ${periodDays}-day period. Streaming 1x per day = ${periodDays} streams (excellent consistency).`}
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
              tooltip={`Total hours streamed during the entire ${periodDays}-day period (not per day)`}
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
              tooltip={`Average concurrent viewers across all streams during the ${periodDays}-day period`}
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
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="includeMessages"
                checked={formData.includeMessages}
                onChange={(e) =>
                  setFormData({ ...formData, includeMessages: e.target.checked })
                }
                className="w-4 h-4 text-violet-600 bg-slate-900 border-violet-600/30 rounded focus:ring-violet-600 focus:ring-2 flex-shrink-0"
              />
              <LabelWithTooltip 
                label="Messages" 
                tooltip={`Total chat messages sent during the entire ${periodDays}-day period. Uncheck if you don't have this data.`}
              />
            </div>
            <input
              type="number"
              value={formData.messages}
              onChange={(e) =>
                setFormData({ ...formData, messages: e.target.value })
              }
              disabled={!formData.includeMessages}
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g. 15000"
              min="1"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              required={formData.includeMessages}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="includeUniqueChatters"
                checked={formData.includeUniqueChatters}
                onChange={(e) =>
                  setFormData({ ...formData, includeUniqueChatters: e.target.checked })
                }
                className="w-4 h-4 text-violet-600 bg-slate-900 border-violet-600/30 rounded focus:ring-violet-600 focus:ring-2 flex-shrink-0"
              />
              <LabelWithTooltip 
                label="Unique Chatters" 
                tooltip={`Total number of unique users who chatted during the ${periodDays}-day period. Uncheck if you don't have this data.`}
              />
            </div>
            <input
              type="number"
              value={formData.uniqueChatters}
              onChange={(e) =>
                setFormData({ ...formData, uniqueChatters: e.target.value })
              }
              disabled={!formData.includeUniqueChatters}
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g. 800"
              min="1"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              required={formData.includeUniqueChatters}
            />
          </div>
          <div>
            <div className="mb-2">
              <LabelWithTooltip 
                label="Followers Gained" 
                tooltip={`Total new followers gained during the entire ${periodDays}-day period`}
              />
            </div>
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
              Add Stream Data
            </button>
      </form>
    </div>
  );
}

