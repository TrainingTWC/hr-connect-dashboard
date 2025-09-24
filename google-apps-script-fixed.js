function doPost(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ERROR', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action;
    
    if (action === 'getData') {
      return getDataFromSheet();
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

// Function to detect region based on store ID only
function detectRegionFromStoreId(storeId) {
  if (!storeId) {
    return 'Unknown';
  }
  
  // Complete Store ID to Region mapping from hr_mapping.json
  var storeRegionMapping = {
    'S153': 'North',
    'S195': 'North',
    'S202': 'North',
    'S056': 'North',
    'S101': 'North',
    'S112': 'North',
    'S166': 'North',
    'S167': 'North',
    'S192': 'North',
    'S027': 'North',
    'S037': 'North',
    'S049': 'North',
    'S055': 'North',
    'S039': 'North',
    'S042': 'North',
    'S062': 'North',
    'S122': 'North',
    'S024': 'North',
    'S035': 'North',
    'S072': 'North',
    'S142': 'North',
    'S171': 'North',
    'S172': 'North',
    'S197': 'North',
    'S198': 'North',
    'S029': 'North',
    'S038': 'North',
    'S073': 'North',
    'S099': 'North',
    'S100': 'North',
    'S102': 'North',
    'S148': 'North',
    'S150': 'North',
    'S154': 'North',
    'S155': 'North',
    'S164': 'North',
    'S176': 'North',
    'S026': 'North',
    'S028': 'North',
    'S036': 'North',
    'S040': 'North',
    'S041': 'North',
    'S113': 'North',
    'S120': 'North',
    'S129': 'North',
    'S121': 'North',
    'S126': 'North',
    'S141': 'North',
    'S173': 'North',
    'S174': 'North',
    'S182': 'North',
    'S188': 'North',
    'S200': 'North',
    'S187': 'North',
    'S053': 'South',
    'S032': 'South',
    'S005': 'South',
    'S091': 'South',
    'S019': 'South',
    'S065': 'South',
    'S189': 'South',
    'S034': 'South',
    'S184': 'South',
    'S143': 'South',
    'S144': 'South',
    'S145': 'South',
    'S157': 'South',
    'S123': 'South',
    'S021': 'South',
    'S178': 'South',
    'S199': 'South',
    'S201': 'South',
    'S023': 'South',
    'S092': 'South',
    'S070': 'South',
    'S020': 'South',
    'S125': 'South',
    'S146': 'South',
    'S191': 'South',
    'S110': 'South',
    'S185': 'South',
    'S131': 'South',
    'S068': 'South',
    'S156': 'South',
    'S001': 'South',
    'S069': 'South',
    'S063': 'South',
    'S002': 'South',
    'S009': 'South',
    'S012': 'South',
    'S004': 'South',
    'S030': 'South',
    'S031': 'South',
    'S011': 'South',
    'S115': 'South',
    'S014': 'South',
    'S007': 'South',
    'S193': 'South',
    'S008': 'South',
    'S158': 'South',
    'S067': 'South',
    'S033': 'South',
    'S094': 'South',
    'S016': 'South',
    'S051': 'South',
    'S159': 'South',
    'S140': 'South',
    'S119': 'South',
    'S152': 'South',
    'S017': 'South',
    'S139': 'South',
    'S133': 'South',
    'S149': 'South',
    'S018': 'South',
    'S006': 'South',
    'S003': 'South',
    'S022': 'South',
    'S015': 'South',
    'S095': 'South',
    'S114': 'South',
    'S050': 'South',
    'S190': 'South',
    'S901': 'South',
    'S902': 'South',
    'S105': 'West',
    'S096': 'West',
    'S088': 'West',
    'S076': 'West',
    'S090': 'West',
    'S061': 'West',
    'S138': 'West',
    'S116': 'West',
    'S132': 'West',
    'S165': 'West',
    'S045': 'West',
    'S087': 'West',
    'S075': 'West',
    'S047': 'West',
    'S097': 'West',
    'S162': 'West',
    'S163': 'West',
    'S111': 'West',
    'S103': 'West',
    'S089': 'West',
    'S137': 'West',
    'S147': 'West',
    'S118': 'West',
    'S127': 'West',
    'S180': 'West',
    'S161': 'West',
    'S168': 'West',
    'S170': 'West',
    'S077': 'West',
    'S057': 'West',
    'S107': 'West',
    'S106': 'West',
    'S043': 'West',
    'S078': 'West',
    'S044': 'West',
    'S117': 'West',
    'S135': 'West',
    'S177': 'West',
    'S080': 'West',
    'S104': 'West',
    'S074': 'West',
    'S059': 'West',
    'S060': 'West',
    'S048': 'West',
    'S058': 'West',
    'S109': 'West',
    'S134': 'West',
    'S130': 'West',
    'S136': 'West',
    'S128': 'West',
    'S086': 'West',
    'S066': 'West',
    'S081': 'West',
    'S082': 'West',
    'S083': 'West',
    'S085': 'West',
    'S084': 'West',
    'S108': 'West',
    'S169': 'West',
    'S175': 'West',
    'S206': 'West',
    'S194': 'West'
  };
  
  // Return the region for the store ID, or 'Unknown' if not found
  return storeRegionMapping[storeId] || 'Unknown';
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
      storeID: 'S153',  // Using a real store ID to test region detection
      region: 'This will be overridden',  // This should be overridden by detectRegionFromStoreId
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