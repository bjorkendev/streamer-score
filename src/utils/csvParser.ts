import type { StreamData } from '../types';

export function parseCSV(csvContent: string): StreamData[] {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  
  // Check for required columns
  const requiredColumns = [
    'name',
    'date',
    'numberofstreams',
    'hours',
    'avgviewers',
    'messages',
    'uniquechatters',
    'followers',
  ];
  
  const missingColumns = requiredColumns.filter(
    (col) => !headers.includes(col) && !headers.includes(col.replace('avg', 'avg '))
  );
  
  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required columns: ${missingColumns.join(', ')}`
    );
  }

  const streams: StreamData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map((v) => v.trim());
    
    if (values.length !== headers.length) {
      console.warn(`Skipping line ${i + 1}: column count mismatch`);
      continue;
    }

    const nameIdx = headers.findIndex(
      (h) => h === 'name'
    );
    const dateIdx = headers.findIndex(
      (h) => h === 'date'
    );
    const numberOfStreamsIdx = headers.findIndex(
      (h) => h === 'numberofstreams' || h === 'number of streams' || h === 'streams'
    );
    const hoursIdx = headers.findIndex(
      (h) => h === 'hours'
    );
    const avgViewersIdx = headers.findIndex(
      (h) => h === 'avgviewers' || h === 'avg viewers'
    );
    const messagesIdx = headers.findIndex(
      (h) => h === 'messages'
    );
    const uniqueChattersIdx = headers.findIndex(
      (h) => h === 'uniquechatters' || h === 'unique chatters'
    );
    const followersIdx = headers.findIndex(
      (h) => h === 'followers'
    );

    try {
      const stream: StreamData = {
        id: crypto.randomUUID(),
        name: values[nameIdx]?.trim() || 'Unknown',
        date: values[dateIdx],
        numberOfStreams: parseInt(values[numberOfStreamsIdx], 10),
        hours: parseFloat(values[hoursIdx]),
        avgViewers: parseFloat(values[avgViewersIdx]),
        messages: parseInt(values[messagesIdx], 10),
        uniqueChatters: parseInt(values[uniqueChattersIdx], 10),
        followers: parseInt(values[followersIdx], 10),
      };

      // Validate data
      if (
        !stream.name ||
        isNaN(stream.numberOfStreams) ||
        isNaN(stream.hours) ||
        isNaN(stream.avgViewers) ||
        isNaN(stream.messages) ||
        isNaN(stream.uniqueChatters) ||
        isNaN(stream.followers)
      ) {
        console.warn(`Skipping line ${i + 1}: invalid numeric values`);
        continue;
      }

      streams.push(stream);
    } catch (error) {
      console.warn(`Skipping line ${i + 1}: ${error}`);
    }
  }

  return streams;
}

export function exportToCSV(streams: StreamData[]): string {
  const headers = [
    'Name',
    'Date',
    'NumberOfStreams',
    'Hours',
    'AvgViewers',
    'Messages',
    'UniqueChatters',
    'Followers',
  ];

  const rows = streams.map((stream) =>
    [
      stream.name,
      stream.date,
      stream.numberOfStreams,
      stream.hours,
      stream.avgViewers,
      stream.messages,
      stream.uniqueChatters,
      stream.followers,
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

