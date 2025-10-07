import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, canAccessHR } from '../roleMapping';
import { hapticFeedback } from '../utils/haptics';
import { HR_PERSONNEL as HR_PERSONNEL_CONSTANTS } from '../constants';
import LoadingOverlay from './LoadingOverlay';
import hrMappingData from '../src/hr_mapping.json';

// Google Sheets endpoint for logging reference check data (fixed unified endpoint)
const LOG_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwNZ-5uCFxrwZuJ2c76TXjmX_gwRrzAsXtfLPA3Pi9AhRqtFb2aR_ZzuQ0Yt0J21xJoNQ/exec';

// Extract unique HR personnel from hr_mapping.json and map to actual names
const getHRPersonnelFromMapping = () => {
  const hrSet = new Set();
  const hrPersonnel: Array<{id: string, name: string, role: string, region: string}> = [];
  
  hrMappingData.forEach((item: any) => {
    // Collect all HR roles
    const hrRoles = [
      { id: item.hrbpId, role: 'HRBP', region: item.region },
      { id: item.regionalHrId, role: 'Regional HR', region: item.region },
      { id: item.hrHeadId, role: 'HR Head', region: item.region },
      { id: item.lmsHeadId, role: 'LMS Head', region: item.region }
    ];
    
    hrRoles.forEach(hr => {
      if (hr.id && !hrSet.has(hr.id)) {
        hrSet.add(hr.id);
        // Find actual name from HR_PERSONNEL_CONSTANTS or use fallback
        const actualHR = HR_PERSONNEL_CONSTANTS.find(p => p.id === hr.id);
        const actualName = actualHR ? actualHR.name : `${hr.role} - ${hr.region}`;
        
        hrPersonnel.push({
          id: hr.id,
          name: actualName, // Use actual name from constants
          role: hr.role,
          region: hr.region
        });
      }
    });
  });
  
  return hrPersonnel.sort((a, b) => a.name.localeCompare(b.name));
};

const HR_PERSONNEL = getHRPersonnelFromMapping();

interface ReferenceCheckResponse {
  [key: string]: string;
}

interface ReferenceCheckMeta {
  hrName: string;
  hrId: string;
  referenceName: string;
  referenceId: string;
  empName: string;
  empId: string;
}

interface ReferenceCheckProps {
  userRole: UserRole;
}

// Reference check questions with their weightages
const REFERENCE_QUESTIONS = [
  {
    id: 'duration_known',
    question: 'Since how long do you know this person?',
    type: 'remarks',
    weightage: 0
  },
  {
    id: 'designation',
    question: 'Designation of the reference',
    type: 'remarks',
    weightage: 0
  },
  {
    id: 'employment_duration',
    question: 'Employment History (Duration)',
    type: 'remarks',
    weightage: 0
  },
  {
    id: 'warning_letter',
    question: 'Warning Letter',
    type: 'yes_no',
    weightage: 1
  },
  {
    id: 'integrity_issue',
    question: 'Integrity Issue',
    type: 'yes_no',
    weightage: 1
  },
  {
    id: 'punctuality',
    question: 'Punctuality',
    type: 'yes_no',
    weightage: 1
  },
  {
    id: 'customer_behavior',
    question: 'Behavior in terms of Customer',
    type: 'remarks',
    weightage: 0
  },
  {
    id: 'rehiring_consideration',
    question: 'Would you consider rehiring this person',
    type: 'yes_no',
    weightage: 1
  },
  {
    id: 'exit_reason',
    question: 'Reason for Exit',
    type: 'remarks',
    weightage: 0
  },
  {
    id: 'overall_feedback',
    question: 'Overall Feedback (if any)',
    type: 'remarks',
    weightage: 0
  }
];

const ReferenceCheck: React.FC<ReferenceCheckProps> = ({ userRole }) => {
  const [responses, setResponses] = useState<ReferenceCheckResponse>(() => {
    try { 
      return JSON.parse(localStorage.getItem('reference_resp') || '{}'); 
    } catch (e) { 
      return {}; 
    }
  });

  const [meta, setMeta] = useState<ReferenceCheckMeta>(() => {
    let stored = {};
    try { 
      stored = JSON.parse(localStorage.getItem('reference_meta') || '{}'); 
    } catch(e) {}
    
    // Get HR info from URL parameters (same as Survey component)
    const urlParams = new URLSearchParams(window.location.search);
    const hrId = urlParams.get('hrId') || urlParams.get('hr_id') || (stored as any).hrId || '';
    const hrName = urlParams.get('hrName') || urlParams.get('hr_name') || (stored as any).hrName || '';
    
    console.log('🚀 Initial HR lookup - ID:', hrId, 'Name:', hrName);
    console.log('📋 HR_PERSONNEL extracted from mapping:', HR_PERSONNEL.length, 'entries');
    console.log('📋 Sample HR IDs:', HR_PERSONNEL.slice(0, 5).map(hr => hr.id));
    
    // Function to find HR by ID
    const findHRById = (id: string) => {
      if (!id) return null;
      return HR_PERSONNEL.find(hr => hr.id === id || hr.id.toLowerCase() === id.toLowerCase());
    };
    
    // Determine final HR name and ID
    let finalHrName = hrName;
    let finalHrId = hrId;
    
    // If we have an HR ID, always try to get the name from it
    if (hrId) {
      const hrPerson = findHRById(hrId);
      if (hrPerson) {
        finalHrName = hrPerson.name;
        finalHrId = hrPerson.id; // Use the exact ID format from mapping
        console.log('✅ Found HR person by ID:', hrPerson);
      } else {
        console.warn('❌ No HR person found for ID:', hrId);
        console.log('🔍 Available HR IDs:', HR_PERSONNEL.map(hr => hr.id));
      }
    }
    // If we have a name but no ID, try to find the ID
    else if (hrName && !hrId) {
      const hrPerson = HR_PERSONNEL.find(hr => hr.name === hrName || hr.name.includes(hrName));
      if (hrPerson) {
        finalHrId = hrPerson.id;
        console.log('✅ Found HR ID by name:', hrPerson);
      }
    }
    
    return {
      hrName: finalHrName,
      hrId: finalHrId,
      referenceName: (stored as any).referenceName || '',
      referenceId: (stored as any).referenceId || (stored as any).referenceContact || '',
      empName: (stored as any).empName || (stored as any).candidateName || '',
      empId: (stored as any).empId || (stored as any).candidateId || ''
    };
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Available HR Personnel filtered by user role (same as Survey)
  const availableHRPersonnel = useMemo(() => {
    return HR_PERSONNEL.filter(hr => canAccessHR(userRole, hr.id));
  }, [userRole]);

  // Save responses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('reference_resp', JSON.stringify(responses));
    } catch (e) {
      console.error('Failed to save responses to localStorage:', e);
    }
  }, [responses]);

  // Save meta to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('reference_meta', JSON.stringify(meta));
    } catch (e) {
      console.error('Failed to save meta to localStorage:', e);
    }
  }, [meta]);

  // Auto-fetch HR info from URL on component mount and save to localStorage (same as Survey)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hrId = urlParams.get('hrId') || urlParams.get('hr_id');
    const hrName = urlParams.get('hrName') || urlParams.get('hr_name');
    const clearCache = urlParams.get('clear');
    
    // Clear localStorage if requested
    if (clearCache) {
      try {
        localStorage.removeItem('reference_meta');
        localStorage.removeItem('reference_resp');
        console.log('Cleared localStorage cache');
      } catch(e) {}
    }
    
    if (hrId || hrName) {
      setMeta(prev => {
        // Function to find HR by ID
        const findHRById = (id: string) => {
          if (!id) return null;
          return HR_PERSONNEL.find(hr => hr.id === id || hr.id.toLowerCase() === id.toLowerCase());
        };
        
        let finalHrName = hrName || '';
        let finalHrId = hrId || prev.hrId;
        
        // If we have an HR ID, always try to get the name from it
        if (finalHrId) {
          console.log('🔍 Looking up HR name for ID:', finalHrId);
          const hrPerson = findHRById(finalHrId);
          
          if (hrPerson) {
            console.log('✅ Found HR person:', hrPerson);
            finalHrName = hrPerson.name;
            finalHrId = hrPerson.id; // Use the exact ID format from constants
          } else {
            console.warn('❌ No HR person found for ID:', finalHrId);
            console.log('🔍 Available HR IDs:', HR_PERSONNEL.map(hr => hr.id));
          }
        }
        // If we have a name but no ID, try to find the ID
        else if (finalHrName && !finalHrId) {
          const hrPerson = HR_PERSONNEL.find(hr => hr.name === finalHrName || hr.name.includes(finalHrName));
          if (hrPerson) {
            finalHrId = hrPerson.id;
            console.log('✅ Found HR ID by name:', hrPerson);
          }
        }
        
        const newMeta = {
          ...prev,
          hrName: finalHrName,
          hrId: finalHrId,
          // Reset other fields when HR changes
          referenceName: finalHrId !== prev.hrId ? '' : prev.referenceName,
          referenceId: finalHrId !== prev.hrId ? '' : prev.referenceId,
          empName: prev.empName,
          empId: prev.empId
        };
        
        console.log('Updated HR meta:', newMeta);
        
        // Save to localStorage
        try { 
          localStorage.setItem('reference_meta', JSON.stringify(newMeta)); 
        } catch(e) {}
        
        return newMeta;
      });
    }
  }, []);

  const handleMetaChange = (field: keyof ReferenceCheckMeta, value: string) => {
    setMeta(prev => ({
      ...prev,
      [field]: value
    }));
    hapticFeedback.tap();
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    hapticFeedback.tap();
  };

  const calculateScore = () => {
    let totalWeightage = 0;
    let achievedScore = 0;

    REFERENCE_QUESTIONS.forEach(question => {
      if (question.weightage > 0) {
        totalWeightage += question.weightage;
        if (responses[question.id]) {
          // For Yes/No questions, "Yes" for negative questions (warning, integrity issue) is bad
          // "No" for these questions is good, "Yes" for positive questions (rehiring) is good
          if (question.id === 'warning_letter' || question.id === 'integrity_issue') {
            // These are negative indicators - "No" is good (gets full score)
            if (responses[question.id] === 'No') {
              achievedScore += question.weightage;
            }
          } else if (question.id === 'punctuality' || question.id === 'rehiring_consideration') {
            // These are positive indicators - "Yes" is good (gets full score)
            if (responses[question.id] === 'Yes') {
              achievedScore += question.weightage;
            }
          }
        }
      }
    });

    return {
      achieved: achievedScore,
      total: totalWeightage,
      percentage: totalWeightage > 0 ? Math.round((achievedScore / totalWeightage) * 100) : 0
    };
  };

  const isFormValid = () => {
    // Check if all meta fields are filled
    const metaFields = Object.values(meta);
    const allMetaFilled = metaFields.every(field => field.trim() !== '');
    
    // Check if all questions are answered
    const allQuestionsAnswered = REFERENCE_QUESTIONS.every(question => 
      responses[question.id] && responses[question.id].trim() !== ''
    );
    
    return allMetaFilled && allQuestionsAnswered;
  };

  const submitReferenceCheck = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields before submitting.');
      return;
    }

    setIsLoading(true);
    try {
      const scoreData = calculateScore();
      const totalScore = scoreData.achieved;
      const maxScore = scoreData.total;
      const percent = scoreData.percentage;
      
      // Format timestamp like Survey component
      const submissionTime = new Date().toLocaleString('en-GB', {hour12: false});
      
      // Format data exactly as Google Apps Script expects with proper parameter names
      const params = {
        submissionTime: submissionTime,
        hrName: meta.hrName || '',
        HRName: meta.hrName || '', // Alternative parameter name
        hrId: meta.hrId || '',
        HRId: meta.hrId || '', // Alternative parameter name
        candidateName: meta.empName || '',
        CandidateName: meta.empName || '', // Alternative parameter name
        candidateId: meta.empId || '',
        CandidateId: meta.empId || '', // Alternative parameter name
        referenceName: meta.referenceName || '',
        ReferenceName: meta.referenceName || '', // Alternative parameter name
        referenceContact: meta.referenceId || '',
        ReferenceContact: meta.referenceId || '', // Alternative parameter name
        region: 'Unknown', // Default region since it's removed from form
        submissionType: 'reference-check', // Identifier for reference check submissions
        // Map responses to rc1-rc10 format exactly as expected by Google Apps Script
        rc1: responses['duration_known'] || '',
        rc2: responses['designation'] || '',
        rc3: responses['employment_duration'] || '',
        rc4: responses['warning_letter'] || '',
        rc5: responses['integrity_issue'] || '',
        rc6: responses['punctuality'] || '',
        rc7: responses['customer_behavior'] || '',
        rc8: responses['rehiring_consideration'] || '',
        rc9: responses['exit_reason'] || '',
        rc10: responses['overall_feedback'] || '',
        totalScore: totalScore || '',
        maxScore: maxScore || '',
        percent: percent || ''
      };

      // Convert to form-encoded format like Survey component
      const body = Object.keys(params).map(k => 
        encodeURIComponent(k) + '=' + encodeURIComponent((params as any)[k])
      ).join('&');

      console.log('Submitting reference check data:', params);
      console.log('Form-encoded body:', body);

      // Simple direct request with better error handling
      try {
        console.log('Sending reference check submission...');
        const response = await fetch(LOG_ENDPOINT, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: body
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        // Even if we get an error status, try to read the response
        const responseText = await response.text();
        console.log('Response text:', responseText);

        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log('Parsed response:', responseData);
        } catch (parseError) {
          console.log('Could not parse response as JSON');
          // If we can't parse JSON but got a 200 response, assume success
          if (response.ok) {
            responseData = { success: true };
          } else {
            // Check if it's an HTML error page (Google Apps Script error)
            if (responseText.includes('Google Apps Script') || responseText.includes('TypeError')) {
              throw new Error('Google Apps Script error - please check the script deployment');
            }
            throw new Error(`Server error: ${response.status}`);
          }
        }

        // Check if the server reported success
        if (responseData && responseData.success === false) {
          throw new Error(responseData.error || 'Server reported submission failed');
        }

        console.log('Reference check submitted successfully');
        setSubmitted(true);
        
        // Clear form data
        setResponses({});
        setMeta({
          hrName: '',
          hrId: '',
          referenceName: '',
          referenceId: '',
          empName: '',
          empId: ''
        });
        
        // Clear localStorage
        localStorage.removeItem('reference_resp');
        localStorage.removeItem('reference_meta');
        
        hapticFeedback.success();
        
      } catch (error) {
        console.error('Error submitting reference check:', error);
        alert('Failed to submit reference check. Please try again. Error: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    } catch (outerError) {
      console.error('Outer error submitting reference check:', outerError);
      alert('Failed to submit reference check. Please try again.');
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setResponses({});
    setMeta({
      hrName: '',
      hrId: '',
      referenceName: '',
      referenceId: '',
      empName: '',
      empId: ''
    });
    setSubmitted(false);
    localStorage.removeItem('reference_resp');
    localStorage.removeItem('reference_meta');
    hapticFeedback.tap();
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reference Check Submitted Successfully!</h2>
          <p className="text-gray-600 dark:text-slate-300 mb-6">
            The reference check has been recorded with a score of <span className="font-bold text-sky-600 dark:text-sky-400">{calculateScore().percentage}%</span>.
          </p>
          <button
            onClick={resetForm}
            className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Conduct Another Reference Check
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {isLoading && <LoadingOverlay isVisible={isLoading} message="Submitting reference check..." />}
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
        
        {/* Meta Information Fields - Survey Details */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="font-bold text-gray-900 dark:text-slate-100 mb-4 text-lg">Reference Check Details</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-700 dark:text-slate-300">
                HR Name 
                {meta.hrName && <span className="text-green-600 dark:text-green-400 text-xs">(Auto-filled from URL)</span>}
              </span>
              {meta.hrName ? (
                <input 
                  className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-gray-100 dark:bg-slate-600 text-gray-900 dark:text-slate-200" 
                  value={meta.hrName} 
                  readOnly 
                  title="Auto-filled from URL parameters"
                />
              ) : (
                <select
                  className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  value={meta.hrName || ''}
                  onChange={e => {
                    const selected = availableHRPersonnel.find(hr => hr.name === e.target.value);
                    // Reset other fields when HR changes
                    setMeta(prev => ({
                      ...prev,
                      hrName: selected ? selected.name : '',
                      hrId: selected ? selected.id : '',
                      referenceName: '', // Reset fields when HR changes
                      referenceId: '',
                      empName: prev.empName,
                      empId: prev.empId
                    }));
                  }}
                >
                  <option value="">Select HR Personnel</option>
                  {availableHRPersonnel.map(hr => (
                    <option key={hr.id} value={hr.name}>{hr.name}</option>
                  ))}
                </select>
              )}
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-700 dark:text-slate-300">
                HR ID
                {meta.hrId && <span className="text-green-600 dark:text-green-400 text-xs">(Auto-filled)</span>}
              </span>
              <input 
                className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-gray-100 dark:bg-slate-600 text-gray-900 dark:text-slate-200" 
                value={meta.hrId || ''} 
                readOnly 
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-700 dark:text-slate-300">Reference Name</span>
              <input 
                className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none" 
                value={meta.referenceName} 
                onChange={e => handleMetaChange('referenceName', e.target.value)} 
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-700 dark:text-slate-300">Reference ID</span>
              <input 
                className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none" 
                value={meta.referenceId} 
                onChange={e => handleMetaChange('referenceId', e.target.value)} 
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-700 dark:text-slate-300">Employee Name</span>
              <input 
                className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none" 
                value={meta.empName} 
                onChange={e => handleMetaChange('empName', e.target.value)} 
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-700 dark:text-slate-300">Employee ID</span>
              <input 
                className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none" 
                value={meta.empId} 
                onChange={e => handleMetaChange('empId', e.target.value)} 
              />
            </label>
          </div>
        </div>

        {/* Reference Check Questions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Reference Check Questions
          </h2>
          
          {REFERENCE_QUESTIONS.map((question, index) => (
            <div key={question.id} className="p-6 border border-gray-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {index + 1}. {question.question}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-gray-600 dark:text-slate-300">
                      Type: {question.type === 'yes_no' ? 'Yes/No' : 'Remarks'}
                    </span>
                    <span className="px-2 py-1 bg-sky-100 dark:bg-sky-900 rounded text-sky-600 dark:text-sky-300">
                      Weightage: {question.weightage}
                    </span>
                  </div>
                </div>
              </div>
              
              {question.type === 'yes_no' ? (
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      value="Yes"
                      checked={responses[question.id] === 'Yes'}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="mr-2 text-sky-600 focus:ring-sky-500"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      value="No"
                      checked={responses[question.id] === 'No'}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="mr-2 text-sky-600 focus:ring-sky-500"
                    />
                    No
                  </label>
                </div>
              ) : (
                <textarea
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter your remarks..."
                />
              )}
            </div>
          ))}
        </div>

        {/* Current Score Display */}
        <div className="mt-8 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">Current Reference Score</p>
            <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">{calculateScore().percentage}%</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={resetForm}
            className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            Reset Form
          </button>
          <button
            onClick={submitReferenceCheck}
            disabled={!isFormValid() || isLoading}
            className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${
              isFormValid() && !isLoading
                ? 'bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white'
                : 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Submitting...' : 'Submit Reference Check'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferenceCheck;