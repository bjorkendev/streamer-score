import { useState } from 'react';
import type { StreamData } from '../types';

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

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-violet-400">Add Stream Data</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Date
            </label>
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
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Hours Streamed
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.hours}
              onChange={(e) =>
                setFormData({ ...formData, hours: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. 4.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Avg Viewers
            </label>
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
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Messages
            </label>
            <input
              type="number"
              value={formData.messages}
              onChange={(e) =>
                setFormData({ ...formData, messages: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. 500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Unique Chatters
            </label>
            <input
              type="number"
              value={formData.uniqueChatters}
              onChange={(e) =>
                setFormData({ ...formData, uniqueChatters: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. 45"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Followers Gained
            </label>
            <input
              type="number"
              value={formData.followers}
              onChange={(e) =>
                setFormData({ ...formData, followers: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="e.g. 12"
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

