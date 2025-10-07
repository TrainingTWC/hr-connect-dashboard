/**
 * Reference Check Google Apps Script - COMPLETE VERSION
 * Handles form submissions AND data retrieval for the Reference Check dashboard
 * Sheet name: HR Reference check
 * 
 * IMPORTANT: This script needs to be deployed as a web app with:
 * - Execute as: Me
 * - Who has access: Anyone
 * 
 * Functions:
 * 1. doPost() - Receives Reference Check submissions from the form
 * 2. doGet() - Returns Reference Check data for the dashboard
 * 3. doOptions() - Handles CORS preflight requests
 * 4. setupReferenceHeaders() - Sets up the spreadsheet headers
 * 5. testReferenceScript() - Test function for debugging
 */

/**
 * Handles OPTIONS requests for CORS preflight
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * Handles GET requests to return Reference Check data for the dashboard
 */
function doGet(e) {
  try {
    console.log('Reference Check Data request received');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('HR Reference check');
    
    // If no sheet exists or it's empty, return empty array
    if (!sheet || sheet.getLastRow() <= 1) {
      console.log('No Reference Check data found');
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    }
    
    // Get all data from the sheet
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // Remove header row
    const headers = values[0];
    const dataRows = values.slice(1);
    
    console.log(`Found ${dataRows.length} Reference Check submissions`);
    
    // Convert to JSON format expected by dashboard
    const referenceSubmissions = dataRows.map(row => {
      const submission = {};
      
      // Map each column to the corresponding field
      headers.forEach((header, index) => {
        const value = row[index];
        
        // Map headers to expected field names
        switch(header) {
          case 'Submission Time':
            submission.submissionTime = value || '';
            break;
          case 'HR Name':
            submission.hrName = value || '';
            break;
          case 'HR ID':
            submission.hrId = value || '';
            break;
          case 'Candidate Name':
            submission.candidateName = value || '';
            break;
          case 'Candidate ID':
            submission.candidateId = value || '';
            break;
          case 'Reference Name':
            submission.referenceName = value || '';
            break;
          case 'Reference Contact':
            submission.referenceContact = value || '';
            break;
          case 'Region':
            submission.region = value || '';
            break;
          case 'Total Score':
            submission.totalScore = value ? value.toString() : '0';
            break;
          case 'Max Score':
            submission.maxScore = value ? value.toString() : '0';
            break;
          case 'Percent':
            submission.percent = value ? value.toString() : '0';
            break;
          case 'RC1 - Since how long do you know this person':
            submission.rc1 = value || '';
            break;
          case 'RC2 - Designation of the reference':
            submission.rc2 = value || '';
            break;
          case 'RC3 - Employment History (Duration)':
            submission.rc3 = value || '';
            break;
          case 'RC4 - Warning Letter':
            submission.rc4 = value || '';
            break;
          case 'RC5 - Integrity Issue':
            submission.rc5 = value || '';
            break;
          case 'RC6 - Punctuality':
            submission.rc6 = value || '';
            break;
          case 'RC7 - Behavior in terms of Customer':
            submission.rc7 = value || '';
            break;
          case 'RC8 - Would you consider rehiring this person':
            submission.rc8 = value || '';
            break;
          case 'RC9 - Reason for Exit':
            submission.rc9 = value || '';
            break;
          case 'RC10 - Overall Feedback ( if any )':
            submission.rc10 = value || '';
            break;
          default:
            // For all other fields, use the header as key
            if (value !== undefined && value !== null) {
              submission[header] = value.toString();
            }
            break;
        }
      });
      
      // Ensure numeric fields are properly formatted
      submission.percent = parseFloat(submission.percent) || 0;
      submission.totalScore = parseFloat(submission.totalScore) || 0;
      submission.maxScore = parseFloat(submission.maxScore) || 0;
      
      return submission;
    });
    
    console.log('Reference Check data successfully processed for dashboard');
    
    // Return the data as JSON
    return ContentService
      .createTextOutput(JSON.stringify(referenceSubmissions))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    console.error('Error retrieving Reference Check data:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: 'Failed to retrieve Reference Check data', 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

/**
 * Handles POST requests to receive Reference Check submissions
 */
function doPost(e) {
  try {
    console.log('Reference Check submission received');
    
    // Get the active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('HR Reference check');
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('HR Reference check');
      console.log('Created new HR Reference check sheet');
    }
    
    // Parse the form data
    const params = e.parameter;
    console.log('Received parameters:', JSON.stringify(params));
    
    // Get current timestamp
    const now = new Date();
    const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
    
    // Initialize headers if this is the first submission
    if (sheet.getLastRow() === 0) {
      setupReferenceHeaders(sheet);
    }
    
    // Prepare the row data
    const rowData = [
      timestamp,                                    // A: Timestamp
      params.submissionTime || '',                  // B: Submission Time
      params.hrName || params.HRName || '',         // C: HR Name
      params.hrId || params.HRId || '',            // D: HR ID
      params.candidateName || params.CandidateName || '', // E: Candidate Name
      params.candidateId || params.CandidateId || '', // F: Candidate ID
      params.referenceName || params.ReferenceName || '', // G: Reference Name
      params.referenceContact || params.ReferenceContact || '', // H: Reference Contact
      params.region || '',                         // I: Region
      
      // Reference Check Questions
      params.rc1 || '',                           // J: RC1 - Since how long do you know this person
      params.rc2 || '',                           // K: RC2 - Designation of the reference
      params.rc3 || '',                           // L: RC3 - Employment History (Duration)
      params.rc4 || '',                           // M: RC4 - Warning Letter
      params.rc5 || '',                           // N: RC5 - Integrity Issue
      params.rc6 || '',                           // O: RC6 - Punctuality
      params.rc7 || '',                           // P: RC7 - Behavior in terms of Customer
      params.rc8 || '',                           // Q: RC8 - Would you consider rehiring this person
      params.rc9 || '',                           // R: RC9 - Reason for Exit
      params.rc10 || '',                          // S: RC10 - Overall Feedback ( if any )
      
      // Scoring Information
      parseFloat(params.totalScore) || 0,          // T: Total Score
      parseFloat(params.maxScore) || 0,            // U: Max Score
      parseFloat(params.percent) || 0              // V: Percent
    ];
    
    // Add the data to the sheet
    sheet.appendRow(rowData);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    console.log('Reference Check data successfully saved to sheet');
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'SUCCESS', 
        message: 'Reference Check submitted successfully',
        timestamp: timestamp 
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    console.error('Error processing Reference Check submission:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'ERROR', 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

/**
 * Sets up the header row for the HR Reference check sheet
 */
function setupReferenceHeaders(sheet) {
  const headers = [
    // Basic Information
    'Timestamp',                                 // A
    'Submission Time',                           // B
    'HR Name',                                  // C
    'HR ID',                                   // D
    'Candidate Name',                          // E
    'Candidate ID',                            // F
    'Reference Name',                          // G
    'Reference Contact',                       // H
    'Region',                                  // I
    
    // Reference Check Questions
    'RC1 - Since how long do you know this person',     // J
    'RC2 - Designation of the reference',               // K
    'RC3 - Employment History (Duration)',              // L
    'RC4 - Warning Letter',                             // M
    'RC5 - Integrity Issue',                            // N
    'RC6 - Punctuality',                                // O
    'RC7 - Behavior in terms of Customer',              // P
    'RC8 - Would you consider rehiring this person',    // Q
    'RC9 - Reason for Exit',                            // R
    'RC10 - Overall Feedback ( if any )',               // S
    
    // Scoring Information
    'Total Score',                             // T
    'Max Score',                               // U
    'Percent'                                  // V
  ];
  
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0369a1'); // Blue background for Reference Check
  headerRange.setFontColor('white');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  console.log('HR Reference check sheet headers set up successfully');
}

/**
 * Test function to verify the script setup - creates sample data
 */
function testReferenceScript() {
  console.log('Testing Reference Check script setup...');
  
  // Test data for POST (submission)
  const testData = {
    parameter: {
      submissionTime: '07/10/2025 14:30:00',
      hrName: 'Sarah HR Manager',
      hrId: 'H002',
      candidateName: 'John Candidate',
      candidateId: 'C001',
      referenceName: 'Jane Reference',
      referenceContact: '+91-9876543210',
      region: 'North',
      rc1: '2-3 years',
      rc2: 'Team Lead',
      rc3: '2 years',
      rc4: 'No',
      rc5: 'No',
      rc6: 'Excellent',
      rc7: 'Professional',
      rc8: 'Yes',
      rc9: 'Career Growth',
      rc10: 'Highly recommended candidate',
      totalScore: 85,
      maxScore: 100,
      percent: 85
    }
  };
  
  // Test POST function
  const postResult = doPost(testData);
  console.log('POST Test result:', postResult.getContent());
  
  // Test GET function
  const getResult = doGet({});
  console.log('GET Test result:', getResult.getContent());
}

/**
 * Function to get Reference Check submission statistics (for debugging)
 */
function getReferenceStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('HR Reference check');
  
  if (!sheet || sheet.getLastRow() <= 1) {
    return { totalSubmissions: 0, avgScore: 0, regions: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  const submissions = data.slice(1); // Remove header row
  
  const totalSubmissions = submissions.length;
  const scores = submissions.map(row => parseFloat(row[22]) || 0); // Percent column
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / totalSubmissions;
  
  const regions = [...new Set(submissions.map(row => row[8]).filter(region => region))];
  
  return {
    totalSubmissions,
    avgScore: Math.round(avgScore * 100) / 100,
    regions,
    lastSubmission: submissions[submissions.length - 1][0] // Latest timestamp
  };
}

/**
 * Function to clear all Reference Check data (for testing purposes)
 */
function clearReferenceData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('HR Reference check');
  
  if (sheet) {
    sheet.clear();
    setupReferenceHeaders(sheet);
    console.log('Reference Check data cleared and headers reset');
  }
}