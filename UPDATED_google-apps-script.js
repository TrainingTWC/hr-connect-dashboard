function doPost(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Check if this is a reference check submission
    if (params.submissionType === 'reference-check') {
      return handleReferenceCheckSubmission(params, ss);
    } else {
      return handleSurveySubmission(params, ss);
    }
    
  } catch (err) {
    console.error('doPost error:', err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ERROR', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleSurveySubmission(params, ss) {
    var sheet = ss.getSheetByName('HR Connect');
    if (!sheet) throw new Error("Sheet 'HR Connect' not found");

    // Validate/detect region based on store ID only
    var validatedRegion = detectRegionFromStoreId(params.storeID || '');
    
    // Override the region parameter with the validated one
    params.region = validatedRegion;

    // Header must match the row order below
    var header = [
      'Server Timestamp',
      'Submission Time',
      'HR Name',
      'HR ID',
      'AM Name',
      'AM ID',
      'Emp Name',
      'Emp ID',
      'Store Name',
      'Store ID',
      'Region',
      'Q1 - Work Pressure in Café',
      'Q1 Remarks',
      'Q2 - Decision Making & Customer Problem Solving',
      'Q2 Remarks',
      'Q3 - Performance Reviews & SM/AM Feedback',
      'Q3 Remarks',
      'Q4 - Team Treatment & Partiality',
      'Q4 Remarks',
      'Q5 - Wings Program Training',
      'Q5 Remarks',
      'Q6 - Operational Apps & Benefits Issues',
      'Q6 Remarks',
      'Q7 - HR Handbook & Policies',
      'Q7 Remarks',
      'Q8 - Work Schedule Satisfaction',
      'Q8 Remarks',
      'Q9 - Team Collaboration',
      'Q9 Remarks',
      'Q10 - Helpful Colleague',
      'Q10 Remarks',
      'Q11 - Suggestions for Organization',
      'Q11 Remarks',
      'Q12 - TWC Experience Rating',
      'Q12 Remarks',
      'Total Score',
      'Max Score',
      'Percent'
    ];

    // Ensure header row exists and matches expected header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(header);
    }

    var data = [
      new Date(),
      params.submissionTime || new Date(),
      params.hrName || '',
      params.hrId || '',
      params.amName || '',
      params.amId || '',
      params.empName || '',
      params.empId || '',
      params.storeName || '',
      params.storeID || '',
      params.region || '',
      params.q1 || '',
      params.q1_remarks || '',
      params.q2 || '',
      params.q2_remarks || '',
      params.q3 || '',
      params.q3_remarks || '',
      params.q4 || '',
      params.q4_remarks || '',
      params.q5 || '',
      params.q5_remarks || '',
      params.q6 || '',
      params.q6_remarks || '',
      params.q7 || '',
      params.q7_remarks || '',
      params.q8 || '',
      params.q8_remarks || '',
      params.q9 || '',
      params.q9_remarks || '',
      params.q10 || '',
      params.q10_remarks || '',
      params.q11 || '',
      params.q11_remarks || '',
      params.q12 || '',
      params.q12_remarks || '',
      params.totalScore || '',
      params.maxScore || '',
      params.percent || ''
    ];

    sheet.appendRow(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'SUCCESS' }))
      .setMimeType(ContentService.MimeType.JSON);
}

function handleReferenceCheckSubmission(params, ss) {
  try {
    var sheet = ss.getSheetByName('Reference Checks');
    
    // Create the sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Reference Checks');
    }

    // Header for reference check data
    var header = [
      'Server Timestamp',
      'Submission Time',
      'HR Name',
      'HR ID',
      'Candidate Name',
      'Candidate ID',
      'Reference Name',
      'Reference Contact',
      'Region',
      'RC1 - Duration Known',
      'RC2 - Designation',
      'RC3 - Employment Duration',
      'RC4 - Warning Letter',
      'RC5 - Integrity Issue',
      'RC6 - Punctuality',
      'RC7 - Customer Behavior',
      'RC8 - Rehiring Consideration',
      'RC9 - Exit Reason',
      'RC10 - Overall Feedback',
      'Total Score',
      'Percentage Score'
    ];

    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(header);
    }

    var data = [
      new Date(),
      params.submissionTime || new Date(),
      params.hrName || '',
      params.hrId || '',
      params.candidateName || '',
      params.candidateId || '',
      params.referenceName || '',
      params.referenceContact || '',
      params.region || 'Unknown',
      params.rc1 || '',
      params.rc2 || '',
      params.rc3 || '',
      params.rc4 || '',
      params.rc5 || '',
      params.rc6 || '',
      params.rc7 || '',
      params.rc8 || '',
      params.rc9 || '',
      params.rc10 || '',
      params.totalScore || '',
      params.percentageScore || ''
    ];

    sheet.appendRow(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'SUCCESS' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    console.error('Reference check submission error:', err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ERROR', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action;
    
    if (action === 'getData') {
      return getDataFromSheet();
    } else if (action === 'getReferenceData') {
      return getReferenceDataFromSheet();
    }
    
    // Return empty response for other GET requests
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ERROR', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

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
      
      // Map the sheet columns based on the actual column positions from the screenshot
      obj.submissionTime = row[1] || '';    // Column B - Submission Time
      obj.hrName = row[2] || '';            // Column C - HR Name
      obj.hrId = row[3] || '';              // Column D - HR ID
      obj.amName = row[4] || '';            // Column E - AM Name
      obj.amId = row[5] || '';              // Column F - AM ID
      obj.empName = row[6] || '';           // Column G - Emp Name
      obj.empId = row[7] || '';             // Column H - Emp ID
      obj.storeName = row[8] || '';         // Column I - Store Name
      obj.storeID = row[9] || '';           // Column J - Store ID
      obj.region = row[10] || '';           // Column K - Region
      
      // Questions responses - adjust these based on your actual column layout
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

// Test function to verify the script is working
function testDoPost() {
  var testParams = {
    parameter: {
      submissionTime: new Date().toISOString(),
      hrName: 'Test HR',
      hrId: 'HR001',
      amName: 'Test AM',
      amId: 'AM001',
      empName: 'Test Employee',
      empId: 'EMP001',
      storeName: 'Test Store',
      storeID: 'S001',
      region: 'Test Region',
      q1: 'Test Answer 1',
      q1_remarks: 'Test Remarks 1',
      q2: 'Test Answer 2',
      q2_remarks: 'Test Remarks 2',
      totalScore: '45',
      maxScore: '60',
      percent: '75'
    }
  };
  
  var result = doPost(testParams);
  console.log(result.getContent());
}

// Function to detect region based on store ID only
function detectRegionFromStoreId(storeId) {
  if (!storeId) {
    return 'Unknown';
  }
  
  // Store ID to Region mapping - based on hr_mapping.json structure
  // Update this mapping to include all your store IDs and their regions
  var storeRegionMapping = {
    // North Region stores (examples from hr_mapping.json)
    'S153': 'North',  // Lajpat Nagar
    'S195': 'North',  // Indirapuram
    'S202': 'North',  // India Expo Plaza
    'S056': 'North',  // Mall of India
    'S101': 'North',  // Sector 63
    
    // TODO: Add all other store IDs from hr_mapping.json
    // You can extract all storeId-region pairs from hr_mapping.json and add them here
    // Example format:
    // 'S001': 'North',
    // 'S002': 'South',
    // 'S003': 'West',
  };
  
  // Return the region for the store ID, or 'Unknown' if not found
  return storeRegionMapping[storeId] || 'Unknown';
}

function getReferenceDataFromSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Reference Checks');
    
    if (!sheet) {
      // If Reference Checks sheet doesn't exist, return empty array
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      // No data or only headers
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0];
    var results = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      
      results.push(obj);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ERROR', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}