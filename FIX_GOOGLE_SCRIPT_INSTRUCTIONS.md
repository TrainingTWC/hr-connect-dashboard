# CRITICAL: Fix Google Apps Script to Get Correct Survey Data

## The Problem
Your dashboard shows "No Response" for all survey answers and 0% scores because the Google Apps Script is reading from the wrong columns in your Google Sheets.

## The Solution
You MUST update your Google Apps Script with the corrected code to fix the data mapping.

## Steps to Fix:

### 1. Go to your Google Apps Script Project
- Visit: https://script.google.com
- Open your existing "HR Connect Survey Logger" project

### 2. Replace the `getDataFromSheet()` function
Find the `getDataFromSheet()` function in your script and replace it ENTIRELY with this corrected version:

```javascript
function getDataFromSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('HR Connect');
    
    if (!sheet) {
      throw new Error("Sheet 'HR Connect' not found");
    }
    
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      // No data or only headers
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0];
    var rows = data.slice(1);
    
    // Convert to format expected by React app
    var jsonData = rows.map(function(row) {
      var obj = {};
      
      // Basic info columns (A-K)
      obj.submissionTime = row[1] || '';    // Column B
      obj.hrName = row[2] || '';            // Column C
      obj.hrId = row[3] || '';              // Column D
      obj.amName = row[4] || '';            // Column E
      obj.amId = row[5] || '';              // Column F
      obj.empName = row[6] || '';           // Column G
      obj.empId = row[7] || '';             // Column H
      obj.storeName = row[8] || '';         // Column I
      obj.storeID = row[9] || '';           // Column J
      obj.region = row[10] || '';           // Column K
      
      // Survey questions and answers (L onwards)
      obj.q1 = row[11] || '';               // Column L - Q1 Response
      obj.q1_remarks = row[12] || '';       // Column M - Q1 Remarks
      obj.q2 = row[13] || '';               // Column N - Q2 Response
      obj.q2_remarks = row[14] || '';       // Column O - Q2 Remarks
      obj.q3 = row[15] || '';               // Column P - Q3 Response
      obj.q3_remarks = row[16] || '';       // Column Q - Q3 Remarks
      obj.q4 = row[17] || '';               // Column R - Q4 Response
      obj.q4_remarks = row[18] || '';       // Column S - Q4 Remarks
      obj.q5 = row[19] || '';               // Q5 Response
      obj.q5_remarks = row[20] || '';       // Q5 Remarks
      obj.q6 = row[21] || '';               // Q6 Response
      obj.q6_remarks = row[22] || '';       // Q6 Remarks
      obj.q7 = row[23] || '';               // Q7 Response
      obj.q7_remarks = row[24] || '';       // Q7 Remarks
      obj.q8 = row[25] || '';               // Q8 Response
      obj.q8_remarks = row[26] || '';       // Q8 Remarks
      obj.q9 = row[27] || '';               // Q9 Response
      obj.q9_remarks = row[28] || '';       // Q9 Remarks
      obj.q10 = row[29] || '';              // Q10 Response
      obj.q10_remarks = row[30] || '';      // Q10 Remarks
      obj.q11 = row[31] || '';              // Q11 Response
      obj.q11_remarks = row[32] || '';      // Q11 Remarks
      obj.q12 = row[33] || '';              // Q12 Response
      obj.q12_remarks = row[34] || '';      // Q12 Remarks
      
      // Scoring
      obj.totalScore = row[35] || '';       // Total Score
      obj.maxScore = row[36] || '';         // Max Score
      obj.percent = row[37] || '';          // Percent
      
      return obj;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify(jsonData))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error fetching data:', error);
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Save and Redeploy
1. Click "Save" (Ctrl+S)
2. Click "Deploy" → "Manage deployments"
3. Click the edit icon (pencil) next to your deployment
4. Change the version to "New version"
5. Click "Deploy"

### 4. Test the Dashboard
1. Go back to your dashboard
2. Click the "Refresh" button
3. You should now see:
   - Correct survey answers instead of "No Response"
   - Proper scores calculated (not 0%)
   - All 8 submissions with real data

## Why This Fixes the Problem
- Your Google Sheets has survey responses in columns L, N, P, R, etc.
- The old script was reading from the wrong column positions
- This updated script correctly maps each column to the right field
- The React app will now receive the actual survey answers and calculate proper scores

## Expected Result
After this fix:
✅ Survey answers will show: "Most of the time", "At Time", "Never", etc.
✅ Scores will calculate correctly: 15/50 (30%), 25/60 (42%), etc.  
✅ PDF reports will show actual responses instead of "No Response"
✅ Question Score Analysis will show proper percentages

This is the ONLY way to fix the scoring and "No Response" issues. The Google Apps Script MUST be updated and redeployed.