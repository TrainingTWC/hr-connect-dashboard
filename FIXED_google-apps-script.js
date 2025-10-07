/**
 * FIXED Google Apps Script for HR Connect Dashboard
 * Handles both Survey submissions and Reference Check submissions
 * Deploy as Web App with access set to "Anyone" and execute as "Me (your email)"
 */

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getData') {
      return getSurveyData();
    } else if (action === 'getReferenceData') {
      return getReferenceData();
    }
    
    return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    console.log('POST request received');
    console.log('Post data:', e.postData);
    console.log('Parameters:', e.parameter);
    
    // Parse form data manually (URLSearchParams not available in Apps Script)
    let formData = {};
    
    if (e.postData && e.postData.contents) {
      // Parse URL-encoded form data manually
      const contents = e.postData.contents;
      const pairs = contents.split('&');
      
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const equalIndex = pair.indexOf('=');
        if (equalIndex > -1) {
          const key = decodeURIComponent(pair.substring(0, equalIndex));
          const value = decodeURIComponent(pair.substring(equalIndex + 1));
          formData[key] = value;
        }
      }
    } else if (e.parameter) {
      // Use query parameters if available
      formData = e.parameter;
    }
    
    console.log('Parsed form data:', formData);
    
    const submissionType = formData.submissionType || 'survey';
    console.log('Submission type:', submissionType);
    
    if (submissionType === 'reference-check') {
      return handleReferenceCheckSubmission(formData);
    } else {
      return handleSurveySubmission(formData);
    }
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString(),
      success: false
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSurveyData() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('Employee Surveys');
    
    if (!sheet) {
      sheet = createSurveySheet(spreadsheet);
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
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
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getReferenceData() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('HR Reference check');
    
    if (!sheet) {
      sheet = createReferenceCheckSheet(spreadsheet);
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
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
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleSurveySubmission(formData) {
  try {
    console.log('Handling survey submission with data:', formData);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('Employee Surveys');
    
    if (!sheet) {
      sheet = createSurveySheet(spreadsheet);
    }
    
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
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Survey submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error handling survey submission:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString(),
      success: false
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleReferenceCheckSubmission(formData) {
  try {
    console.log('Handling reference check submission with data:', formData);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('HR Reference check');
    
    if (!sheet) {
      sheet = createReferenceCheckSheet(spreadsheet);
    }
    
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
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Reference check submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error handling reference check submission:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString(),
      success: false
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

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
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  console.log('Employee Surveys sheet created');
  return sheet;
}

function createReferenceCheckSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet('HR Reference check');
  
  const headers = [
    'submissionTime', 'hrName', 'hrId', 'candidateName', 'candidateId', 
    'referenceName', 'referenceContact', 'region',
    'rc1', 'rc2', 'rc3', 'rc4', 'rc5', 'rc6', 'rc7', 'rc8', 'rc9', 'rc10',
    'totalScore', 'maxScore', 'percent'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#34a853');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  console.log('HR Reference check sheet created');
  return sheet;
}