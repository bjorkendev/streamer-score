import { useState } from 'react';
import type { StreamData, TimePeriod, Settings } from '../types';
import { PERIOD_LABELS, PERIOD_DAYS } from '../types';
import { CustomSelect } from './CustomSelect';
import { calculateLegitimacyScore } from '../utils/calculations';

interface StreamDataTableProps {
  streams: StreamData[];
  settings: Settings;
  onUpdateStream: (id: string, updatedStream: StreamData) => void;
  onDeleteStream: (id: string) => void;
  onViewScore: (stream: StreamData) => void;
}

export function StreamDataTable({
  streams,
  settings,
  onUpdateStream,
  onDeleteStream,
  onViewScore,
}: StreamDataTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<StreamData | null>(null);

  const sortedStreams = [...streams].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleEdit = (stream: StreamData) => {
    setEditingId(stream.id);
    setEditData({ ...stream });
  };

  const handleSave = () => {
    if (editData && editingId) {
      onUpdateStream(editingId, editData);
      setEditingId(null);
      setEditData(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const getDateRange = (endDate: string, period: TimePeriod) => {
    const end = new Date(endDate);
    // Check if date is valid
    if (isNaN(end.getTime())) {
      return {
        start: 'Invalid Date',
        end: endDate || 'Invalid Date'
      };
    }
    const start = new Date(end);
    const periodDays = PERIOD_DAYS[period];
    start.setDate(end.getDate() - periodDays);
    return {
      start: start.toISOString().split('T')[0],
      end: endDate
    };
  };

  if (streams.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-violet-400">Stream Data</h3>
        <p className="text-gray-400">
          No stream data yet. Add streams manually or upload a CSV file.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-violet-400">
        Stream Data ({streams.length} period{streams.length !== 1 ? 's' : ''})
      </h3>
      <p className="text-xs text-gray-400 mb-4">Each entry represents data for a specific time period.</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-violet-600/30">
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Name
            </th>
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Time Period
            </th>
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              End Date
            </th>
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Streams
            </th>
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Hours
            </th>
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Avg Viewers
            </th>
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Messages
            </th>
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Unique Chatters
            </th>
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Followers
            </th>
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Score
            </th>
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStreams.map((stream) => (
            <tr
              key={stream.id}
              className="border-b border-violet-600/20 hover:bg-slate-900/50"
            >
              {editingId === stream.id && editData ? (
                <>
                  <td className="py-3 px-2">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-violet-600/30 rounded text-white text-sm"
                      placeholder="Name"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <CustomSelect
                      value={editData.period}
                      onChange={(value) => setEditData({ ...editData, period: value as TimePeriod })}
                      options={Object.entries(PERIOD_LABELS).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="date"
                      value={editData.date}
                      onChange={(e) =>
                        setEditData({ ...editData, date: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-violet-600/30 rounded text-white text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={editData.numberOfStreams}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          numberOfStreams: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-violet-600/30 rounded text-white text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      step="0.1"
                      value={editData.hours}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          hours: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-violet-600/30 rounded text-white text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      step="0.1"
                      value={editData.avgViewers}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          avgViewers: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-violet-600/30 rounded text-white text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={editData.includeMessages ?? true}
                          onChange={(e) =>
                            setEditData({ ...editData, includeMessages: e.target.checked })
                          }
                          className="w-3 h-3"
                        />
                        <span>Include</span>
                      </label>
                      <input
                        type="number"
                        value={editData.messages}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            messages: parseInt(e.target.value, 10),
                          })
                        }
                        disabled={!editData.includeMessages}
                        className="w-full px-2 py-1 bg-slate-900 border border-violet-600/30 rounded text-white text-sm disabled:opacity-50"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={editData.includeUniqueChatters ?? true}
                          onChange={(e) =>
                            setEditData({ ...editData, includeUniqueChatters: e.target.checked })
                          }
                          className="w-3 h-3"
                        />
                        <span>Include</span>
                      </label>
                      <input
                        type="number"
                        value={editData.uniqueChatters}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            uniqueChatters: parseInt(e.target.value, 10),
                          })
                        }
                        disabled={!editData.includeUniqueChatters}
                        className="w-full px-2 py-1 bg-slate-900 border border-violet-600/30 rounded text-white text-sm disabled:opacity-50"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={editData.followers}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          followers: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-violet-600/30 rounded text-white text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-3 px-2 text-white font-medium">{stream.name}</td>
                  <td className="py-3 px-2">
                    <div className="text-white font-medium">{PERIOD_LABELS[stream.period]}</div>
                    <div className="text-xs text-gray-400">
                      {getDateRange(stream.date, stream.period).start} to {stream.date}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-white">{stream.date}</td>
                  <td className="py-3 px-2 text-white">{stream.numberOfStreams}</td>
                  <td className="py-3 px-2 text-white">{stream.hours}</td>
                  <td className="py-3 px-2 text-white">{stream.avgViewers}</td>
                  <td className="py-3 px-2 text-white">
                    {stream.includeMessages ?? true ? stream.messages : (
                      <span className="text-gray-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-white">
                    {stream.includeUniqueChatters ?? true ? stream.uniqueChatters : (
                      <span className="text-gray-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-white">{stream.followers}</td>
                  <td className="py-3 px-2">
                    {(() => {
                      try {
                        const score = calculateLegitimacyScore(stream, settings).finalScore;
                        const getScoreColorClass = (score: number) => {
                          if (score < 30) {
                            return 'bg-red-900/50 text-red-300 border-red-500/30';
                          } else if (score < 50) {
                            return 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30';
                          } else if (score >= 80) {
                            return 'bg-green-900/50 text-green-300 border-green-500/30';
                          } else {
                            return 'bg-violet-900/50 text-violet-300 border-violet-500/30';
                          }
                        };
                        
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getScoreColorClass(score)}`}>
                            {score}
                          </span>
                        );
                      } catch (e) {
                        return (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-900/50 text-gray-400 border border-gray-500/30">
                            Error
                          </span>
                        );
                      }
                    })()}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewScore(stream)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        title="View score for this period only"
                      >
                        View Score
                      </button>
                      <button
                        onClick={() => handleEdit(stream)}
                        className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteStream(stream.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

