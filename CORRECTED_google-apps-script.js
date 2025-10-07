/**
 * UNIFIED Google Apps Script for HR Connect Dashboard - CORRECTED VERSION
 * Handles both Survey submissions and Reference Check submissions
 * Deploy as Web App with access set to "Anyone" and execute as "Me (your email)"
 * 
 * This script manages data for:
 * 1. Survey submissions -> "Employee Surveys" sheet
 * 2. Reference Check submissions -> "HR Reference check" sheet
 */

/**
 * Helper function to create response with CORS headers
 */
function createCORSResponse(content, mimeType = ContentService.MimeType.JSON) {
  const output = ContentService.createTextOutput(content);
  output.setMimeType(mimeType);
  output.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '3600'
  });
  return output;
}

/**
 * Handle preflight OPTIONS requests
 */
function doOptions() {
  return createCORSResponse('', ContentService.MimeType.TEXT);
}

/**
 * Handle GET requests - fetch data
 */
function doGet(e) {
  try {
    console.log('GET request received with parameters:', e.parameter);
    
    const action = e.parameter.action;
    
    if (action === 'getData') {
      // Return survey data
      return getSurveyData();
    } else if (action === 'getReferenceData') {
      // Return reference check data
      return getReferenceData();
    } else {
      throw new Error('Invalid action parameter: ' + action);
    }
    
  } catch (error) {
    console.error('Error in doGet:', error);
    return createCORSResponse(JSON.stringify({
      error: 'Failed to fetch data: ' + error.message,
      success: false
    }));
  }
}

/**
 * Handle POST requests - submit data
 */
function doPost(e) {
  try {
    console.log('POST request received');
    console.log('Post data:', e.postData);
    console.log('Parameters:', e.parameter);
    
    // Parse form data
    let formData = {};
    
    if (e.postData && e.postData.contents) {
      // Handle URL-encoded form data
      const params = new URLSearchParams(e.postData.contents);
      for (const [key, value] of params) {
        formData[key] = value;
      }
    } else if (e.parameter) {
      // Handle query parameters
      formData = e.parameter;
    }
    
    console.log('Parsed form data:', formData);
    
    // Determine submission type
    const submissionType = formData.submissionType || 'survey';
    
    if (submissionType === 'reference-check') {
      return handleReferenceCheckSubmission(formData);
    } else {
      return handleSurveySubmission(formData);
    }
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return createCORSResponse(JSON.stringify({
      error: 'Failed to submit data: ' + error.message,
      success: false
    }));
  }
}

/**
 * Get survey data from "Employee Surveys" sheet
 */
function getSurveyData() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('Employee Surveys');
    
    if (!sheet) {
      console.log('Employee Surveys sheet not found, creating it...');
      sheet = createSurveySheet(spreadsheet);
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      console.log('No survey data found (only headers or empty sheet)');
      return createCORSResponse(JSON.stringify([]));
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const result = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    console.log(`Retrieved ${result.length} survey records`);
    
    return createCORSResponse(JSON.stringify(result));
      
  } catch (error) {
    console.error('Error getting survey data:', error);
    return createCORSResponse(JSON.stringify({
      error: 'Failed to retrieve survey data: ' + error.message,
      success: false
    }));
  }
}

/**
 * Get reference check data from "HR Reference check" sheet
 */
function getReferenceData() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('HR Reference check');
    
    if (!sheet) {
      console.log('HR Reference check sheet not found, creating it...');
      sheet = createReferenceCheckSheet(spreadsheet);
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      console.log('No reference check data found (only headers or empty sheet)');
      return createCORSResponse(JSON.stringify([]));
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const result = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    console.log(`Retrieved ${result.length} reference check records`);
    
    return createCORSResponse(JSON.stringify(result));
      
  } catch (error) {
    console.error('Error getting reference check data:', error);
    return createCORSResponse(JSON.stringify({
      error: 'Failed to retrieve reference check data: ' + error.message,
      success: false
    }));
  }
}

/**
 * Handle survey submission
 */
function handleSurveySubmission(formData) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('Employee Surveys');
    
    if (!sheet) {
      console.log('Employee Surveys sheet not found, creating it...');
      sheet = createSurveySheet(spreadsheet);
    }
    
    // Prepare survey row data
    const rowData = [
      formData.submissionTime || new Date().toISOString(),
      formData.hrName || '',
      formData.hrId || '',
      formData.amName || '',
      formData.amId || '',
      formData.empName || '',
      formData.empId || '',
      formData.storeName || '',
      formData.storeId || formData.storeID || '',
      formData.region || '',
      formData.q1 || '',
      formData.q1_remarks || '',
      formData.q2 || '',
      formData.q2_remarks || '',
      formData.q3 || '',
      formData.q3_remarks || '',
      formData.q4 || '',
      formData.q4_remarks || '',
      formData.q5 || '',
      formData.q5_remarks || '',
      formData.q6 || '',
      formData.q6_remarks || '',
      formData.q7 || '',
      formData.q7_remarks || '',
      formData.q8 || '',
      formData.q8_remarks || '',
      formData.q9 || '',
      formData.q9_remarks || '',
      formData.q10 || '',
      formData.q10_remarks || '',
      formData.q11 || '',
      formData.q11_remarks || '',
      formData.q12 || '',
      formData.q12_remarks || '',
      formData.totalScore || '',
      formData.maxScore || '',
      formData.percent || ''
    ];
    
    sheet.appendRow(rowData);
    console.log('Survey submission logged successfully');
    
    return createCORSResponse(JSON.stringify({
      success: true,
      message: 'Survey submission logged successfully',
      timestamp: new Date().toISOString()
    }));
      
  } catch (error) {
    console.error('Error handling survey submission:', error);
    return createCORSResponse(JSON.stringify({
      error: 'Failed to log survey submission: ' + error.message,
      success: false
    }));
  }
}

/**
 * Handle reference check submission
 */
function handleReferenceCheckSubmission(formData) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('HR Reference check');
    
    if (!sheet) {
      console.log('HR Reference check sheet not found, creating it...');
      sheet = createReferenceCheckSheet(spreadsheet);
    }
    
    // Prepare reference check row data
    const rowData = [
      formData.submissionTime || new Date().toISOString(),
      formData.hrName || '',
      formData.hrId || '',
      formData.candidateName || '',
      formData.candidateId || '',
      formData.referenceName || '',
      formData.referenceContact || '',
      formData.region || '',
      formData.rc1 || '',
      formData.rc2 || '',
      formData.rc3 || '',
      formData.rc4 || '',
      formData.rc5 || '',
      formData.rc6 || '',
      formData.rc7 || '',
      formData.rc8 || '',
      formData.rc9 || '',
      formData.rc10 || '',
      formData.totalScore || '',
      formData.maxScore || '',
      formData.percent || ''
    ];
    
    sheet.appendRow(rowData);
    console.log('Reference check submission logged successfully');
    
    return createCORSResponse(JSON.stringify({
      success: true,
      message: 'Reference check submission logged successfully',
      timestamp: new Date().toISOString()
    }));
      
  } catch (error) {
    console.error('Error handling reference check submission:', error);
    return createCORSResponse(JSON.stringify({
      error: 'Failed to log reference check submission: ' + error.message,
      success: false
    }));
  }
}

/**
 * Create Employee Surveys sheet with headers
 */
function createSurveySheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet('Employee Surveys');
  
  const headers = [
    'submissionTime', 'hrName', 'hrId', 'amName', 'amId', 'empName', 'empId', 
    'storeName', 'storeId', 'region',
    'q1', 'q1_remarks', 'q2', 'q2_remarks', 'q3', 'q3_remarks', 
    'q4', 'q4_remarks', 'q5', 'q5_remarks', 'q6', 'q6_remarks',
    'q7', 'q7_remarks', 'q8', 'q8_remarks', 'q9', 'q9_remarks',
    'q10', 'q10_remarks', 'q11', 'q11_remarks', 'q12', 'q12_remarks',
    'totalScore', 'maxScore', 'percent'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  console.log('Employee Surveys sheet created with headers');
  return sheet;
}

/**
 * Create HR Reference check sheet with headers
 */
function createReferenceCheckSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet('HR Reference check');
  
  const headers = [
    'submissionTime', 'hrName', 'hrId', 'candidateName', 'candidateId', 
    'referenceName', 'referenceContact', 'region',
    'rc1', 'rc2', 'rc3', 'rc4', 'rc5', 'rc6', 'rc7', 'rc8', 'rc9', 'rc10',
    'totalScore', 'maxScore', 'percent'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#34a853');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  console.log('HR Reference check sheet created with headers');
  return sheet;
}

/**
 * Test function to verify the script works
 */
function testScript() {
  console.log('Testing unified script...');
  
  // Test survey data retrieval
  console.log('Testing survey data retrieval...');
  const surveyResult = getSurveyData();
  console.log('Survey result:', surveyResult.getContent());
  
  // Test reference data retrieval
  console.log('Testing reference data retrieval...');
  const referenceResult = getReferenceData();
  console.log('Reference result:', referenceResult.getContent());
  
  console.log('Test completed successfully');
}