import { useState } from 'react';
import type { StreamData } from '../types';

interface StreamDataTableProps {
  streams: StreamData[];
  onUpdateStream: (id: string, updatedStream: StreamData) => void;
  onDeleteStream: (id: string) => void;
}

export function StreamDataTable({
  streams,
  onUpdateStream,
  onDeleteStream,
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
        Stream Data ({streams.length} streams)
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-violet-600/30">
            <th className="text-left py-3 px-2 text-gray-300 font-semibold">
              Date
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
                    <input
                      type="number"
                      value={editData.messages}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          messages: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-violet-600/30 rounded text-white text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={editData.uniqueChatters}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          uniqueChatters: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-violet-600/30 rounded text-white text-sm"
                    />
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
                  <td className="py-3 px-2 text-white">{stream.date}</td>
                  <td className="py-3 px-2 text-white">{stream.hours}</td>
                  <td className="py-3 px-2 text-white">{stream.avgViewers}</td>
                  <td className="py-3 px-2 text-white">{stream.messages}</td>
                  <td className="py-3 px-2 text-white">
                    {stream.uniqueChatters}
                  </td>
                  <td className="py-3 px-2 text-white">{stream.followers}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
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

