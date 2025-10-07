# URGENT FIX: Reference Check Submission Issue

## Current Problem
The reference check form is not submitting because the Google Apps Script has a code error: `output.setHeaders is not a function`

## Quick Fix Solution

### Step 1: Replace Google Apps Script Code
1. **Open your Google Apps Script** with URL ending in: `AKfycbxQJCgcno1TCjFw_ETs66kieQGgamUUAvBrJIONtou_wKwZoW1H7HW3LDtnPovjzvXvAQ`

2. **Delete ALL existing code** in the Code.gs file

3. **Copy and paste** the ENTIRE contents of `SIMPLE_google-apps-script.js` from this project

4. **Save** the project (Ctrl+S)

### Step 2: Deploy New Version
1. **Deploy** → **Manage deployments**
2. Click the **pencil icon** next to your existing deployment
3. Set **Version** to "New version"
4. Make sure settings are:
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. **Deploy**

### Step 3: Test
After deployment, the reference check form should work immediately.

## Why This Will Work

The `SIMPLE_google-apps-script.js` version:
- ✅ **No setHeaders calls** - eliminates the current error
- ✅ **Minimal code** - reduces chance of errors
- ✅ **Same functionality** - handles both survey and reference submissions
- ✅ **Proper error handling** - returns clear success/error messages

## Test Commands
You can test the endpoint after deployment:

**Test Reference Check:**
```bash
curl -X POST "YOUR_SCRIPT_URL" -H "Content-Type: application/x-www-form-urlencoded" -d "submissionType=reference-check&hrName=Test&candidateName=Test&rc1=test"
```

**Expected Response:**
```json
{"success":true,"message":"Reference check submitted successfully"}
```

## Files to Use
- ✅ **`SIMPLE_google-apps-script.js`** - Use this version (simplest, most reliable)
- ❌ **`CORRECTED_google-apps-script.js`** - Has setHeaders issues  
- ❌ **`WORKING_google-apps-script.js`** - May have setHeaders issues

## After Fix
Once deployed:
1. Reference check form will submit successfully
2. Data will be saved to "HR Reference check" sheet  
3. Reference dashboard will load real data
4. Survey functionality continues to work

The React frontend is already updated and ready - we just need the backend script fixed! 🚀