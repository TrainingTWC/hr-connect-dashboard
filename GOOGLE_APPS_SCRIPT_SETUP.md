# Google Apps Script Setup Guide for HR Connect Survey

## Step-by-Step Setup Instructions

### 1. Create a New Google Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the content from `google-apps-script.js`
4. Save the project with a name like "HR Connect Survey Logger"

### 2. Set Up the Spreadsheet
1. The script will automatically create a new Google Spreadsheet called "HR Connect Survey Responses"
2. Or you can create your own spreadsheet first and run the script from within it

### 3. Deploy as Web App
1. In the Apps Script editor, click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Set the following configurations:
   - **Execute as**: Me (your Google account)
   - **Who has access**: Anyone (this allows the survey form to submit data)
4. Click "Deploy"
5. Copy the Web App URL (this replaces the LOG_ENDPOINT in Survey.tsx)

### 4. Update the Survey Component
Replace the LOG_ENDPOINT URL in `components/Survey.tsx` with your new Web App URL:
```typescript
const LOG_ENDPOINT = 'YOUR_NEW_WEB_APP_URL_HERE';
```

### 5. Test the Setup
1. Run the `testDoPost()` function in the Apps Script editor to verify it works
2. Submit a test survey from your application
3. Check that data appears in the Google Spreadsheet

## Spreadsheet Structure

The updated script creates a spreadsheet with the following columns:

| Column | Field | Description |
|--------|-------|-------------|
| A | Submission Time | When the survey was submitted |
| B | HR Name | Name of HR personnel |
| C | HR ID | HR personnel ID |
| D | Area Manager Name | Name of Area Manager |
| E | Area Manager ID | Area Manager ID |
| F | Employee Name | Name of employee taking survey |
| G | Employee ID | Employee ID |
| H | Store Name | Name of the store |
| I | Store ID | Store ID |
| **J** | **Region** | **Auto-detected region from hr_mapping.json** |
| K-AJ | Questions 1-12 | Survey questions and remarks |
| AK | Total Score | Sum of all question scores |
| AL | Max Score | Maximum possible score |
| AM | Percentage | Calculated percentage score |

## New Features

### Region Auto-Detection
The system now automatically detects the region based on:
1. **Store ID** (primary method)
2. **Area Manager ID** (fallback)
3. **HR Personnel ID** (secondary fallback)

### Enhanced Logging
- **Color-coded percentages**: Green (≥80%), Yellow (≥60%), Red (<60%)
- **Formatted dates**: Proper date/time formatting
- **Auto-resized columns**: Better readability
- **Header formatting**: Professional appearance

### Error Handling
- Graceful handling of missing hr_mapping.json data
- Fallback to "Unknown" region if detection fails
- Console logging for debugging

## Troubleshooting

### Common Issues:
1. **403 Forbidden**: Make sure "Who has access" is set to "Anyone"
2. **CORS Errors**: Ensure the Web App URL is correct and deployed
3. **Missing Data**: Check that hr_mapping.json is accessible at `/hr_mapping.json`

### Verification Steps:
1. Test the `testDoPost()` function in Apps Script
2. Check browser console for any fetch errors
3. Verify hr_mapping.json loads correctly in the browser
4. Ensure all required fields are filled in the survey form

## Security Notes

- The Web App runs with your Google account permissions
- Only survey data is transmitted (no sensitive authentication data)
- All data is stored in your own Google Spreadsheet
- Region detection happens client-side for privacy