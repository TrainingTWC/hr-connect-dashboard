# URGENT: Fix Google Apps Script CORS Error

## Current Issue
The Google Apps Script is failing with error: `setHeaders is not a function`

## Solution Steps

### 1. Open Your Google Apps Script
Go to: https://script.google.com/
Find your project with URL ending in: `AKfycbxg3UlI48uMvDNKKKGQ38bSlOgcqntFyv0eZIo7CFZcfUiZ5iRbTJGyELOJln_8jvELIg`

### 2. Replace ALL Code
- **Select ALL existing code** in the Code.gs file
- **Delete everything**
- **Copy and paste** the ENTIRE contents of `CORRECTED_google-apps-script.js` from this project

### 3. Save and Deploy
- **Save** the project (Ctrl+S)
- **Deploy** > **Manage deployments**
- Click the **pencil icon** next to your existing deployment
- Set **Version** to "New version"
- **Deploy**

### 4. Test the Fix
After deployment, test with this curl command:
```
curl -X POST "https://script.google.com/macros/s/AKfycbxg3UlI48uMvDNKKKGQ38bSlOgcqntFyv0eZIo7CFZcfUiZ5iRbTJGyELOJln_8jvELIg/exec" -H "Content-Type: application/x-www-form-urlencoded" -d "submissionType=reference-check&hrName=TestHR&candidateName=TestCandidate&rc1=test"
```

You should get a JSON response like:
```json
{"success":true,"message":"Reference check submission logged successfully","timestamp":"..."}
```

## What Was Fixed
The original script had incorrect CORS header implementation. The corrected version:
- Uses `createCORSResponse()` helper function
- Properly implements `setHeaders()` with correct Google Apps Script API
- Handles both survey and reference check submissions
- Returns proper JSON responses with success/error status

## Files Involved
- ✅ `CORRECTED_google-apps-script.js` - Use this version
- ❌ `UNIFIED_google-apps-script.js` - Has the CORS error
- ❌ All other Google Apps Script files - Outdated

## After Fix
Once deployed correctly:
1. Reference Check form submissions will work
2. Reference Dashboard will load real data  
3. CORS errors will be eliminated
4. Both survey and reference functionality will work from the same endpoint