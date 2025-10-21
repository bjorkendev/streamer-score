import { useState } from 'react';
import type { StreamData, TimePeriod, Settings } from '../types';
import { PERIOD_LABELS, PERIOD_DAYS } from '../types';
import { CustomSelect } from './CustomSelect';
import { calculateLegitimacyScore } from '../utils/calculations';
import { formatScore, formatNumber, formatNumberWithOneDecimal } from '../utils/formatting';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter streams based on search term
  const filteredStreams = streams.filter(stream =>
    stream.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered streams
  const sortedStreams = [...filteredStreams].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedStreams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStreams = sortedStreams.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-violet-400">
            Stream Data ({streams.length} period{streams.length !== 1 ? 's' : ''})
          </h3>
          <p className="text-xs text-gray-400">Each entry represents data for a specific time period.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-violet-600/30 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 placeholder-gray-400"
          />
        </div>
      </div>
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
          {paginatedStreams.map((stream) => (
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
                  <td className="py-3 px-2 text-white">{formatNumber(stream.numberOfStreams)}</td>
                  <td className="py-3 px-2 text-white">{formatNumberWithOneDecimal(stream.hours)}</td>
                  <td className="py-3 px-2 text-white">{formatNumberWithOneDecimal(stream.avgViewers)}</td>
                  <td className="py-3 px-2 text-white">
                    {stream.includeMessages ?? true ? formatNumber(stream.messages) : (
                      <span className="text-gray-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-white">
                    {stream.includeUniqueChatters ?? true ? formatNumber(stream.uniqueChatters) : (
                      <span className="text-gray-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-white">{formatNumber(stream.followers)}</td>
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
                            {formatScore(score)}
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
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-violet-600/20">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedStreams.length)} of {sortedStreams.length} entries
            {searchTerm && ` (filtered from ${streams.length} total)`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === page
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

