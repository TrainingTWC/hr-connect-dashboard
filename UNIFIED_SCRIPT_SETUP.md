# Google Apps Script Setup Instructions for Unified HR Connect Dashboard

## Step 1: Access Your Existing Google Apps Script

1. Go to the Google Apps Script project that currently handles your survey data (the one with URL ending in `AKfycbxW541QsQc98NKMVh-lnNBnINskIqD10CnQHvGsW_R2SLASGSdBDN9lTGj1gznlNbHORQ`)
2. This should be associated with your existing Google Sheets document

## Step 2: Replace the Script Code

1. **Select all existing code** in the script editor
2. **Delete it completely**
3. **Copy the entire contents** of `UNIFIED_google-apps-script.js` from this project
4. **Paste it** into the Google Apps Script editor
5. **Save the project** (Ctrl+S or File > Save)

## Step 3: Deploy the Updated Script

1. Click **"Deploy"** > **"New deployment"**
2. Set the following:
   - **Type**: Web app
   - **Execute as**: Me (your email address)
   - **Who has access**: Anyone
3. Click **"Deploy"**
4. **Copy the new deployment URL** (it should be the same as before if you're updating the existing deployment)

## Step 4: Verify the Setup

1. **Check your Google Sheets** - you should now see two sheets:
   - "Employee Surveys" (for existing survey data)
   - "HR Reference check" (new, for reference check data)

2. **Test the endpoints**:
   - Survey data: `YOUR_SCRIPT_URL?action=getData`
   - Reference data: `YOUR_SCRIPT_URL?action=getReferenceData`

## Step 5: Update Frontend (Already Done)

The React components have already been updated to use the correct endpoint:
- ✅ `ReferenceCheck.tsx` - Uses the survey endpoint with `submissionType: 'reference-check'`
- ✅ `ReferenceDashboard.tsx` - Uses the survey endpoint with CORS fallback logic

## What This Unified Script Does

### For Survey Submissions:
- Receives POST requests without `submissionType` or with `submissionType: 'survey'`
- Logs data to "Employee Surveys" sheet
- Returns success/error response

### For Reference Check Submissions:
- Receives POST requests with `submissionType: 'reference-check'`
- Logs data to "HR Reference check" sheet
- Returns success/error response

### For Data Retrieval:
- `?action=getData` → Returns survey data from "Employee Surveys" sheet
- `?action=getReferenceData` → Returns reference check data from "HR Reference check" sheet

### CORS Support:
- Comprehensive CORS headers for cross-origin requests
- Handles preflight OPTIONS requests
- Supports fallback to CORS proxy if needed

## Troubleshooting

If you encounter CORS errors:
1. Ensure the script is deployed with "Anyone" access
2. Make sure the deployment URL is correct in both components
3. The frontend includes fallback to CORS proxy for additional reliability

## Testing

After deployment, test both functionalities:
1. **Survey submission** - Should continue working as before
2. **Reference check submission** - Should now work without CORS errors
3. **Reference dashboard** - Should load real data instead of sample data

The unified script maintains backward compatibility with your existing survey functionality while adding full support for reference checks.