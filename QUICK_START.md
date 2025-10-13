# Quick Start Guide

## Running the Application

1. **Navigate to the project directory:**
   ```bash
   cd /Users/alexanderb/Dev/alex-sls/streamer-score
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser** to the URL shown in the terminal (usually http://localhost:5173)

## Using the Application

### Step 1: Add Stream Data

You have two options:

**Option A: Upload the Sample CSV**
1. Click on the "Choose File" button in the "Upload CSV" section
2. Select the `sample-data.csv` file included in the project
3. The data will be loaded automatically

**Option B: Manual Entry**
1. Fill in the "Add Stream Data" form with your stream information
2. Click "Add Stream" to add each entry
3. Repeat for multiple streams

### Step 2: View Your Score

Once you have stream data added, the Results section will automatically display:
- Your **Final Legitimacy Score** (large number at the top)
- Intermediate metrics showing raw calculations
- Component scores with visual progress bars

### Step 3: Adjust Settings (Optional)

1. Click "Show Settings" button at the top
2. Modify any of the parameters:
   - Date window settings
   - Performance caps
   - Target values
   - Weights (must sum to 1.0)
3. The score will recalculate automatically

### Step 4: Manage Your Data

- **Edit a stream**: Click "Edit" on any row in the table, modify values, then click "Save"
- **Delete a stream**: Click "Delete" on any row
- **Export data**: Click "Export to CSV" to download your data
- **Clear all data**: Click "Clear All Data" (with confirmation)
- **Reset settings**: Click "Reset Settings to Defaults" (when settings panel is open)

## Sample Data

The included `sample-data.csv` contains 10 days of sample streaming data with realistic metrics. This is perfect for testing and understanding how the calculator works.

## Data Persistence

All your data and settings are automatically saved to your browser's local storage. When you return to the application, your data will still be there!

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory and can be deployed to any static hosting service.

## Troubleshooting

**The score is 0 or very low:**
- Make sure you have enough stream data (at least a few entries)
- Check that the date window includes your stream dates
- Verify the "Min Viewer Hours" setting isn't too high

**Data disappeared:**
- Check if you're using the same browser
- Local storage is browser-specific and domain-specific
- Use the export feature to create backups

**Settings seem wrong:**
- Click "Reset Settings to Defaults" to restore the original values

