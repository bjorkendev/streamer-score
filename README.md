# Streamer Legitimacy Score Calculator

A React-based web application for calculating streamer legitimacy scores based on engagement metrics and streaming performance.

## Features

- **Editable Settings**: Customize all calculation parameters including performance caps, targets, and weights
- **Manual Data Entry**: Add stream data one entry at a time through an intuitive form
- **CSV Upload**: Bulk upload stream data from CSV files
- **Real-time Calculations**: Automatically recalculates scores as you modify data or settings
- **Data Management**: Edit, delete, and export your stream data
- **Local Storage**: All data persists in your browser's local storage
- **Modern UI**: Clean, professional interface with Mythic-inspired dark/purple theme

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or another available port).

### Building for Production

```bash
npm run build
```

## How to Use

### 1. Add Stream Data

You can add stream data in two ways:

#### Manual Entry
- Fill in the "Add Stream Data" form with:
  - Date: The date of the stream
  - Hours Streamed: Duration in hours (e.g., 4.5)
  - Avg Viewers: Average viewer count
  - Messages: Total chat messages
  - Unique Chatters: Number of unique users who chatted
  - Followers Gained: New followers from that stream

#### CSV Upload
- Prepare a CSV file with columns: `Date,Hours,AvgViewers,Messages,UniqueChatters,Followers`
- Use the included `sample-data.csv` as a reference
- Upload the file using the CSV Upload section

### 2. View Results

The Results section displays:
- **Final Legitimacy Score**: The overall score (0-100)
- **Intermediate Metrics**: Raw calculations like Days Streamed, Total Hours, MPVM, etc.
- **Component Scores**: Individual scores for each metric category with visual progress bars

### 3. Adjust Settings (Optional)

Click "Show Settings" to customize:
- **Date Window**: How many days of data to analyze
- **Performance Caps**: Maximum values considered "excellent"
- **Performance Targets**: Goals for engagement metrics
- **Weights**: How much each metric influences the final score (must sum to 1.0)

## Calculation Methodology

The legitimacy score is calculated based on:

1. **Days Score**: Frequency of streaming
2. **Hours Score**: Total time streamed
3. **Viewers Score**: Audience size (logarithmic scale)
4. **MPVM Score**: Messages per viewer-minute (engagement rate)
5. **UCP100 Score**: Unique chatters per 100 viewers
6. **F1kVH Score**: Followers gained per 1000 viewer-hours
7. **Consistency Score**: Consistency of follower growth across streams

Each component score is weighted and combined, with a penalty applied if total viewer-hours fall below the minimum threshold.

## Data Export

Export your stream data as CSV for backup or analysis in other tools using the "Export to CSV" button.

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Local Storage API

## License

This project is open source and available for personal and commercial use.
