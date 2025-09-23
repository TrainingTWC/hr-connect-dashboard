
import { Submission } from '../types';
import { QUESTIONS, AREA_MANAGERS, STORES, HR_PERSONNEL } from '../constants';

// Google Sheets endpoint for fetching data (same as logging endpoint but with GET)
const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwutLcK3SFtLDGyjeuNMJEJzezobbR1WLKb3Vvtw8d9P9DuqfZAZXRuUArymINVK2L7Mw/exec';

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateMockData = async (count: number): Promise<Submission[]> => {
  const data: Submission[] = [];
  const scoredQuestions = QUESTIONS.filter(q => q.choices);
  const maxScore = scoredQuestions.reduce((sum, q) => sum + Math.max(...(q.choices?.map(c => c.score) || [0])), 0);

  // Load hr_mapping.json to generate realistic data
  let hrMappingData: any[] = [];
  try {
    const response = await fetch('/hr_mapping.json');
    hrMappingData = await response.json();
  } catch (error) {
    console.warn('Could not load hr_mapping.json for mock data, using fallback');
  }

  for (let i = 0; i < count; i++) {
    // Use real mapping data if available, otherwise fallback to constants
    let hr, am, store, storeRegion;
    
    if (hrMappingData.length > 0) {
      const randomMapping = getRandomItem(hrMappingData);
      
      // Find names from constants or use IDs
      hr = HR_PERSONNEL.find(h => h.id === randomMapping.hrbpId) || 
           HR_PERSONNEL.find(h => h.id === randomMapping.regionalHrId) || 
           HR_PERSONNEL.find(h => h.id === randomMapping.hrHeadId) || 
           { name: `HR ${randomMapping.hrbpId}`, id: randomMapping.hrbpId };
           
      am = AREA_MANAGERS.find(a => a.id === randomMapping.areaManagerId) || 
           { name: `AM ${randomMapping.areaManagerId}`, id: randomMapping.areaManagerId };
           
      store = { name: randomMapping.locationName, id: randomMapping.storeId };
      storeRegion = randomMapping.region;
    } else {
      // Fallback to constants
      hr = getRandomItem(HR_PERSONNEL);
      am = getRandomItem(AREA_MANAGERS);
      store = getRandomItem(STORES);
      storeRegion = getRandomItem(['North', 'South', 'West']);
    }

    let totalScore = 0;
    const submission: Partial<Submission> = {};
    
    QUESTIONS.forEach(q => {
      if (q.choices) {
        const choice = getRandomItem(q.choices);
        (submission as any)[q.id] = choice.label;
        totalScore += choice.score;
      } else if (q.id === 'q10') {
         (submission as any)[q.id] = `Colleague ${i+1}`;
      } else {
         (submission as any)[q.id] = `Suggestion or comment number ${i+1}. Lorem ipsum dolor sit amet.`;
      }
    });

    const submissionDate = new Date();
    submissionDate.setDate(submissionDate.getDate() - Math.floor(Math.random() * 365));

    data.push({
      ...submission,
      submissionTime: submissionDate.toISOString(),
      hrName: hr.name,
      hrId: hr.id,
      amName: am.name,
      amId: am.id,
      empName: `Employee ${i + 1}`,
      empId: `E${1000 + i}`,
      storeName: store.name,
      storeID: store.id,
      totalScore,
      maxScore,
      percent: Math.round((totalScore / maxScore) * 100),
    } as Submission);
  }
  return data;
};

// Convert Google Sheets data to Submission format
const convertSheetsDataToSubmissions = (sheetsData: any[]): Submission[] => {
  if (!sheetsData || sheetsData.length === 0) {
    console.log('No data from Google Sheets to convert');
    return []; // Return empty array instead of mock data
  }

  console.log('Converting sheets data:', sheetsData);
  console.log('Sample row structure:', sheetsData[0]);

  return sheetsData.map((row: any) => {
    // Calculate score for this submission
    let totalScore = 0, maxScore = 0;
    
    QUESTIONS.forEach(q => {
      if (q.choices) {
        const response = row[q.id];
        if (response && response.trim() !== '') {
          // Try to find the choice by label first, then by score
          const choiceByLabel = q.choices.find(c => c.label.toLowerCase() === response.toLowerCase().trim());
          const choiceByScore = q.choices.find(c => c.score === Number(response));
          const choice = choiceByLabel || choiceByScore;
          
          if (choice) {
            totalScore += choice.score;
            console.log(`Question ${q.id}: "${response}" -> ${choice.score} points`);
          } else {
            console.log(`Question ${q.id}: No matching choice found for "${response}"`);
          }
        }
        maxScore += Math.max(...q.choices.map(c => c.score));
      }
    });

    const calculatedPercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    // Use calculated scores if the ones from sheets are empty/invalid
    const finalTotalScore = row.totalScore && !isNaN(Number(row.totalScore)) ? Number(row.totalScore) : totalScore;
    const finalMaxScore = row.maxScore && !isNaN(Number(row.maxScore)) ? Number(row.maxScore) : maxScore;
    const finalPercent = row.percent && !isNaN(Number(row.percent)) ? Number(row.percent) : calculatedPercent;

    console.log(`Final scores - Total: ${finalTotalScore}, Max: ${finalMaxScore}, Percent: ${finalPercent}%`);

    return {
      submissionTime: row.submissionTime || new Date().toISOString(),
      hrName: row.hrName || '',
      hrId: row.hrId || '',
      amName: row.amName || '',
      amId: row.amId || '',
      empName: row.empName || '',
      empId: row.empId || '',
      storeName: row.storeName || '',
      storeID: row.storeID || row.storeId || '', // Handle both field names
      region: row.region || row.q1 || 'Unknown', // Use region field or fallback to q1 if region is stored there
      q1: row.q1 || '',
      q1_remarks: row.q1_remarks || '',
      q2: row.q2 || '',
      q2_remarks: row.q2_remarks || '',
      q3: row.q3 || '',
      q3_remarks: row.q3_remarks || '',
      q4: row.q4 || '',
      q4_remarks: row.q4_remarks || '',
      q5: row.q5 || '',
      q5_remarks: row.q5_remarks || '',
      q6: row.q6 || '',
      q6_remarks: row.q6_remarks || '',
      q7: row.q7 || '',
      q7_remarks: row.q7_remarks || '',
      q8: row.q8 || '',
      q8_remarks: row.q8_remarks || '',
      q9: row.q9 || '',
      q9_remarks: row.q9_remarks || '',
      q10: row.q10 || '',
      q10_remarks: row.q10_remarks || '',
      q11: row.q11 || '',
      q11_remarks: row.q11_remarks || '',
      q12: row.q12 || '',
      q12_remarks: row.q12_remarks || '',
      totalScore: finalTotalScore,
      maxScore: finalMaxScore,
      percent: finalPercent,
    };
  });
};

export const fetchSubmissions = async (): Promise<Submission[]> => {
  try {
    console.log('Fetching data from Google Sheets...');
    
    // Try direct request first (works if CORS is properly configured)
    let response;
    let data;
    
    try {
      console.log('Trying direct request to Google Apps Script...');
      const directUrl = SHEETS_ENDPOINT + '?action=getData';
      
      response = await fetch(directUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        redirect: 'follow',
      });
      
      if (response.ok) {
        data = await response.json();
        console.log('Direct request successful, data received:', data);
      } else {
        throw new Error(`Direct request failed: ${response.status}`);
      }
    } catch (directError) {
      console.log('Direct request failed, trying CORS proxy...', directError);
      
      // Fallback to CORS proxy
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = SHEETS_ENDPOINT + '?action=getData';

      response = await fetch(proxyUrl + targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('CORS proxy response was not OK:', response.status, response.statusText, errorText);
        console.log('No real data available, returning empty array');
        return [];
      }

      data = await response.json();
      console.log('CORS proxy request successful, data received:', data);
    }
    
    // Check if the received data is an array, as expected
    if (!Array.isArray(data)) {
        console.error('Data from Google Sheets is not an array:', data);
        console.log('Invalid data format, returning empty array');
        return [];
    }
    
    const submissions = convertSheetsDataToSubmissions(data);
    
    console.log('Converted submissions:', submissions);
    return submissions;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    console.log('Failed to fetch data, returning empty array');
    // Return empty array instead of mock data
    return [];
  }
};
