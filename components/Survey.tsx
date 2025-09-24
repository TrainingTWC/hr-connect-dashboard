import React, { useState, useEffect, useMemo } from 'react';
import { QUESTIONS, AREA_MANAGERS, HR_PERSONNEL } from '../constants';
import { Question, Choice, Store } from '../types';
import { UserRole, canAccessStore, canAccessAM, canAccessHR } from '../roleMapping';
import { triggerHapticFeedback } from '../utils/haptics';
import LoadingOverlay from './LoadingOverlay';
import hrMappingData from '../src/hr_mapping.json';

// Google Sheets endpoint for logging data
const LOG_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxW541QsQc98NKMVh-lnNBnINskIqD10CnQHvGsW_R2SLASGSdBDN9lTGj1gznlNbHORQ/exec';

interface SurveyResponse {
  [key: string]: string;
}

interface SurveyMeta {
  hrName: string;
  hrId: string;
  amName: string;
  amId: string;
  empName: string;
  empId: string;
  storeName: string;
  storeId: string;
}

interface SurveyProps {
  userRole: UserRole;
}

const Survey: React.FC<SurveyProps> = ({ userRole }) => {
  console.log('Survey component mounted with userRole:', userRole);
  
  const [responses, setResponses] = useState<SurveyResponse>(() => {
    try { 
      return JSON.parse(localStorage.getItem('hr_resp') || '{}'); 
    } catch (e) { 
      return {}; 
    }
  });

  const [meta, setMeta] = useState<SurveyMeta>(() => {
    let stored = {};
    try { 
      stored = JSON.parse(localStorage.getItem('hr_meta') || '{}'); 
    } catch(e) {}
    
    // Get HR info from URL parameters (only HR fills survey)
    const urlParams = new URLSearchParams(window.location.search);
    const hrId = urlParams.get('hrId') || urlParams.get('hr_id') || (stored as any).hrId || '';
    const hrName = urlParams.get('hrName') || urlParams.get('hr_name') || (stored as any).hrName || '';
    
    console.log('Initial HR lookup - ID:', hrId, 'Name:', hrName);
    console.log('HR_PERSONNEL array:', HR_PERSONNEL);
    
    // If HR ID is provided but no name, try to find it from HR_PERSONNEL
    let finalHrName = hrName;
    if (hrId && !hrName) {
      const hrPerson = HR_PERSONNEL.find(hr => hr.id === hrId);
      console.log('Found HR person for ID', hrId, ':', hrPerson);
      if (hrPerson) {
        finalHrName = hrPerson.name;
        console.log('Set final HR name to:', finalHrName);
      }
    }
    
    const result = {
      hrName: finalHrName,
      hrId: hrId,
      amName: (stored as any).amName || '', // AM will be auto-filled from HR mapping
      amId: (stored as any).amId || '',     // AM will be auto-filled from HR mapping
      empName: (stored as any).empName || '',
      empId: (stored as any).empId || '',
      storeName: (stored as any).storeName || '',
      storeId: (stored as any).storeId || ''
    };
    
    console.log('Initial meta state:', result);
    return result;
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [filteredStoresByHR, setFilteredStoresByHR] = useState<Store[]>([]);

  // Auto-fetch HR info from URL on component mount and save to localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hrId = urlParams.get('hrId') || urlParams.get('hr_id');
    const hrName = urlParams.get('hrName') || urlParams.get('hr_name');
    const clearCache = urlParams.get('clear');
    
    // Clear localStorage if requested
    if (clearCache) {
      try {
        localStorage.removeItem('hr_meta');
        localStorage.removeItem('hr_resp');
        console.log('Cleared localStorage cache');
      } catch(e) {}
    }
    
    if (hrId || hrName) {
      setMeta(prev => {
        let finalHrName = hrName || '';
        let finalHrId = hrId || prev.hrId;
        
        // Always try to find HR name from ID, even if we have a name
        if (finalHrId) {
          console.log('Looking up HR name for ID:', finalHrId);
          console.log('Available HR_PERSONNEL:', HR_PERSONNEL.map(hr => ({ id: hr.id, name: hr.name })));
          const hrPerson = HR_PERSONNEL.find(hr => hr.id === finalHrId);
          if (hrPerson) {
            console.log('Found HR person:', hrPerson);
            finalHrName = hrPerson.name;
          } else {
            console.warn('No HR person found for ID:', finalHrId);
            console.log('Searched in:', HR_PERSONNEL);
          }
        }
        
        // If HR name is provided but no ID, try to find it from HR_PERSONNEL
        if (finalHrName && !finalHrId) {
          const hrPerson = HR_PERSONNEL.find(hr => hr.name === finalHrName);
          if (hrPerson) {
            finalHrId = hrPerson.id;
          }
        }
        
        const newMeta = {
          ...prev,
          hrName: finalHrName,
          hrId: finalHrId,
          // Reset other fields when HR changes
          amName: finalHrId !== prev.hrId ? '' : prev.amName,
          amId: finalHrId !== prev.hrId ? '' : prev.amId,
          empName: prev.empName,
          empId: prev.empId,
          storeName: finalHrId !== prev.hrId ? '' : prev.storeName,
          storeId: finalHrId !== prev.hrId ? '' : prev.storeId
        };
        
        console.log('Updated HR meta:', newMeta);
        
        // Save to localStorage
        try { 
          localStorage.setItem('hr_meta', JSON.stringify(newMeta)); 
        } catch(e) {}
        
        return newMeta;
      });
    }
  }, []);

  // Load stores from hr_mapping.json
  useEffect(() => {
    console.log('Loading stores from imported hr_mapping data...');
    const loadStores = () => {
      try {
        console.log('HR mapping data loaded, processing', hrMappingData.length, 'entries');
        
        const storeMap = new Map();
        
        hrMappingData.forEach((item: any) => {
          if (!storeMap.has(item.storeId)) {
            storeMap.set(item.storeId, {
              name: item.locationName,
              id: item.storeId,
              region: item.region
            });
          }
        });
        
        const stores = Array.from(storeMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
        setAllStores(stores);
        console.log(`Loaded ${stores.length} stores from mapping data`);
      } catch (error) {
        console.warn('Could not load stores from mapping data:', error);
        // Fallback stores
        setAllStores([
          { name: 'Defence Colony', id: 'S027' },
          { name: 'Khan Market', id: 'S037' },
          { name: 'UB City', id: 'S007' },
          { name: 'Koramangala 1', id: 'S001' }
        ]);
      }
    };
    
    loadStores();
  }, []);

  // Filter stores by HR (HR → AM → Stores flow)
  useEffect(() => {
    const filterStoresByHR = () => {
      if (!meta.hrId || allStores.length === 0) {
        setFilteredStoresByHR([]);
        return;
      }

      try {
        console.log('Filtering stores for HR:', meta.hrId);
        
        // Find stores where this HR is responsible (HRBP > Regional HR > HR Head priority)
        const hrStoreIds = hrMappingData
          .filter((mapping: any) => 
            mapping.hrbpId === meta.hrId || 
            mapping.regionalHrId === meta.hrId || 
            mapping.hrHeadId === meta.hrId
          )
          .map((mapping: any) => mapping.storeId);
        
        console.log('Found store IDs for HR:', hrStoreIds);
        
        const hrStores = allStores.filter(store => hrStoreIds.includes(store.id));
        setFilteredStoresByHR(hrStores);
        
        console.log('Filtered stores:', hrStores);
        
        // Auto-fill Area Manager based on HR
        if (hrStores.length > 0 && !meta.amId) {
          const firstStoreMapping = hrMappingData.find((mapping: any) => 
            mapping.storeId === hrStores[0].id
          );
          
          if (firstStoreMapping) {
            const amId = firstStoreMapping.areaManagerId;
            const amPerson = AREA_MANAGERS.find(am => am.id === amId);
            
            if (amPerson) {
              setMeta(prev => ({
                ...prev,
                amId: amPerson.id,
                amName: amPerson.name
              }));
            }
          }
        }
        
        console.log(`Filtered ${hrStores.length} stores for HR ${meta.hrId}`);
      } catch (error) {
        console.warn('Could not filter stores by HR:', error);
        setFilteredStoresByHR([]);
      }
    };

    filterStoresByHR();
  }, [meta.hrId, allStores]);

  // Role-based filtering for available options
  const availableStores = useMemo(() => {
    // If HR ID is present, use HR-based filtering (HR fills the survey)
    if (meta.hrId) {
      console.log(`HR ${meta.hrId} has access to ${filteredStoresByHR.length} stores:`, filteredStoresByHR);
      return filteredStoresByHR;
    }
    // Otherwise use role-based filtering for other user types
    const roleBasedStores = allStores.filter(store => canAccessStore(userRole, store.id));
    console.log(`Role-based filtering: ${roleBasedStores.length} stores available`, roleBasedStores);
    return roleBasedStores;
  }, [userRole, allStores, filteredStoresByHR, meta.hrId]);

  const availableAreaManagers = useMemo(() => {
    return AREA_MANAGERS.filter(am => canAccessAM(userRole, am.id));
  }, [userRole]);

  const availableHRPersonnel = useMemo(() => {
    return HR_PERSONNEL.filter(hr => canAccessHR(userRole, hr.id));
  }, [userRole]);

  const handleMetaChange = (key: keyof SurveyMeta, value: string) => {
    setMeta(prev => {
      const next = { ...prev, [key]: value };
      
      // Auto-fill region when store is selected
      if (key === 'storeId' && value) {
        const loadRegionForStore = async () => {
          try {
            const base = (import.meta as any).env?.BASE_URL || '/';
            const response = await fetch(`${base}hr_mapping.json`);
            const hrMappingData = await response.json();
            const storeMapping = hrMappingData.find((mapping: any) => mapping.storeId === value);
            
            if (storeMapping) {
              setMeta(current => ({
                ...current,
                storeName: storeMapping.locationName
                // Region can be added here if needed
              }));
            }
          } catch (error) {
            console.warn('Could not load region for store:', error);
          }
        };
        
        loadRegionForStore();
      }
      
      try { 
        localStorage.setItem('hr_meta', JSON.stringify(next)); 
      } catch(e) {}
      return next;
    });
  };

  const handleChange = (id: string, value: string) => {
    // Trigger haptic feedback for survey responses
    triggerHapticFeedback('light');
    
    setResponses(prev => {
      const next = {...prev, [id]: value};
      try { 
        localStorage.setItem('hr_resp', JSON.stringify(next)); 
      } catch(e) {}
      return next;
    });
  };

  useEffect(() => {
    try { 
      localStorage.setItem('hr_resp', JSON.stringify(responses)); 
    } catch(e) {}
  }, [responses]);

  useEffect(() => {
    try { 
      localStorage.setItem('hr_meta', JSON.stringify(meta)); 
    } catch(e) {}
  }, [meta]);

  const validate = () => {
    for(const q of QUESTIONS){
      if((q.type === 'radio' || q.type === 'scale') && (responses[q.id] == null || responses[q.id] === '')) {
        return {ok: false, missing: q.id};
      }
    }
    return {ok: true};
  };

  const computeScore = () => {
    let total = 0, max = 0;
    for(const q of QUESTIONS){
      if(q.choices){
        const choice = q.choices.find(c => c.label === responses[q.id]);
        if(choice){
          total += choice.score;
          max += Math.max(...q.choices.map(c => c.score));
        }
      }
    }
    return { total, max, percent: max ? Math.round((total/max)*100) : 0 };
  };

  const handleReset = () => {
    localStorage.removeItem('hr_resp');
    const newMeta = {
      hrName: '',
      hrId: '',
      amName: '', amId: '', empName: '', empId: '', storeName: '', storeId: ''
    };
    try { 
      localStorage.setItem('hr_meta', JSON.stringify(newMeta)); 
    } catch(e) {}
    setResponses({});
    setMeta(newMeta);
    setSubmitted(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if(!validation.ok){
      const el = document.querySelector(`[name="${validation.missing}"]`);
      if(el) el.scrollIntoView({behavior:'smooth', block:'center'});
      alert('Please answer all required questions.');
      triggerHapticFeedback('error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Log data to Google Sheets
      await logDataToGoogleSheets();
      
      alert('Survey submitted successfully!');
      triggerHapticFeedback('success');
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting survey. Please try again.');
      triggerHapticFeedback('error');
    } finally {
      setIsLoading(false);
    }
  };

  const logDataToGoogleSheets = async () => {
    const score = computeScore();
    
    // Detect region based on the selected store ID only from hr_mapping.json
    let detectedRegion = '';
    try {
      // Only try to find region by store ID
      if (meta.storeId) {
        const storeMapping = hrMappingData.find((item: any) => item.storeId === meta.storeId);
        if (storeMapping) {
          detectedRegion = storeMapping.region || '';
        }
      }
      
    } catch (error) {
      console.warn('Could not load HR mapping data for region detection:', error);
    }
    
    const params = {
      submissionTime: new Date().toLocaleString('en-GB', {hour12: false}),
      hrName: meta.hrName || '',
      hrId: meta.hrId || '',
      amName: meta.amName || '',
      amId: meta.amId || '',
      empName: meta.empName || '',
      empId: meta.empId || '',
      storeName: meta.storeName || '',
      storeID: meta.storeId || '',
      region: detectedRegion || 'Unknown',
      q1: responses['q1'] || '',
      q1_remarks: responses['q1_remarks'] || '',
      q2: responses['q2'] || '',
      q2_remarks: responses['q2_remarks'] || '',
      q3: responses['q3'] || '',
      q3_remarks: responses['q3_remarks'] || '',
      q4: responses['q4'] || '',
      q4_remarks: responses['q4_remarks'] || '',
      q5: responses['q5'] || '',
      q5_remarks: responses['q5_remarks'] || '',
      q6: responses['q6'] || '',
      q6_remarks: responses['q6_remarks'] || '',
      q7: responses['q7'] || '',
      q7_remarks: responses['q7_remarks'] || '',
      q8: responses['q8'] || '',
      q8_remarks: responses['q8_remarks'] || '',
      q9: responses['q9'] || '',
      q9_remarks: responses['q9_remarks'] || '',
      q10: responses['q10'] || '',
      q10_remarks: responses['q10_remarks'] || '',
      q11: responses['q11'] || '',
      q11_remarks: responses['q11_remarks'] || '',
      q12: responses['q12'] || '',
      q12_remarks: responses['q12_remarks'] || '',
      totalScore: score.total || '',
      maxScore: score.max || '',
      percent: score.percent || ''
    };

    const body = Object.keys(params).map(k => 
      encodeURIComponent(k) + '=' + encodeURIComponent((params as any)[k])
    ).join('&');

    try {
      await fetch(LOG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body
      });
      console.log('Data successfully logged to Google Sheets');
    } catch (error) {
      console.error('Error logging data to Google Sheets:', error);
    }
  };

  const score = computeScore();

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Survey Details Card */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="font-bold text-gray-900 dark:text-slate-100 mb-4 text-lg">Survey Details</div>
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
                    handleMetaChange('hrName', selected ? selected.name : '');
                    handleMetaChange('hrId', selected ? selected.id : '');
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
                title={meta.hrId ? "Auto-filled from URL parameters or HR selection" : "Will be filled when HR is selected"}
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-700 dark:text-slate-300">Area Manager Name</span>
              <select
                className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                value={meta.amName || ''}
                onChange={e => {
                  const selected = availableAreaManagers.find(am => am.name === e.target.value);
                  handleMetaChange('amName', selected ? selected.name : '');
                  handleMetaChange('amId', selected ? selected.id : '');
                }}
              >
                <option value="">Select Area Manager</option>
                {availableAreaManagers.map(am => (
                  <option key={am.id} value={am.name}>{am.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-700 dark:text-slate-300">Area Manager ID</span>
              <input 
                className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" 
                value={meta.amId || ''} 
                readOnly 
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
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-700 dark:text-slate-300">Store Name</span>
              <select
                className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                value={meta.storeName || ''}
                onChange={e => {
                  const selected = availableStores.find(store => store.name === e.target.value);
                  handleMetaChange('storeName', selected ? selected.name : '');
                  handleMetaChange('storeId', selected ? selected.id : '');
                }}
              >
                <option value="">Select Store</option>
                {availableStores.map(store => (
                  <option key={store.id} value={store.name}>{store.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-700 dark:text-slate-300">Store ID</span>
              <input 
                className="p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" 
                value={meta.storeId} 
                readOnly 
              />
            </label>
          </div>
        </div>

        {/* Questions */}
        {QUESTIONS.map(q => (
          <div key={q.id} className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="font-bold text-gray-900 dark:text-slate-100 mb-4">{q.title}</div>
            
            {q.type === 'radio' && (
              <>
                <div className="flex flex-col gap-3">
                  {q.choices?.map((c: Choice, idx: number) => (
                    <label key={idx} className="inline-flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={c.label}
                        checked={responses[q.id] === c.label}
                        onChange={e => handleChange(q.id, e.target.value)}
                        className="w-4 h-4 text-sky-500 dark:text-sky-400 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-sky-500 dark:focus:ring-sky-400"
                      />
                      <span className="text-gray-900 dark:text-slate-200">{c.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none"
                    placeholder="Add remarks for this question (optional)"
                    rows={2}
                    value={responses[q.id + '_remarks'] || ''}
                    onChange={e => handleChange(q.id + '_remarks', e.target.value)}
                  />
                </div>
              </>
            )}
            
            {q.type === 'scale' && (
              <>
                <div className="flex gap-6">
                  {q.choices?.map((c: Choice, idx: number) => (
                    <label key={idx} className="flex flex-col items-center cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={c.label}
                        checked={responses[q.id] === c.label}
                        onChange={e => handleChange(q.id, e.target.value)}
                        className="w-4 h-4 text-sky-500 dark:text-sky-400 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-sky-500 dark:focus:ring-sky-400 mb-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-slate-300">{c.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none"
                    placeholder="Add remarks for this question (optional)"
                    rows={2}
                    value={responses[q.id + '_remarks'] || ''}
                    onChange={e => handleChange(q.id + '_remarks', e.target.value)}
                  />
                </div>
              </>
            )}
            
            {q.type === 'input' && (
              <>
                <input
                  className="w-full mt-2 p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none"
                  type="text"
                  value={responses[q.id] || ''}
                  onChange={e => handleChange(q.id, e.target.value)}
                />
                <div className="mt-4">
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none"
                    placeholder="Add remarks for this question (optional)"
                    rows={2}
                    value={responses[q.id + '_remarks'] || ''}
                    onChange={e => handleChange(q.id + '_remarks', e.target.value)}
                  />
                </div>
              </>
            )}
            
            {q.type === 'textarea' && (
              <textarea
                className="w-full mt-2 p-3 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none"
                rows={4}
                value={responses[q.id] || ''}
                onChange={e => handleChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}

        {/* Submit Section */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="text-sm text-gray-600 dark:text-slate-400">
            All radio/scale questions are required.
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
              onClick={handleReset}
              title="Clear all form data and responses"
            >
              Reset Form
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </div>
      </form>

      {/* Submission Summary */}
      {submitted && (
        <div className="mt-6 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="font-bold text-gray-900 dark:text-slate-100 text-xl mb-4">Submission Summary</h2>
          
          {/* Score Bar */}
          <div className="mb-6">
            <div className="text-lg font-bold text-slate-100 mb-3">
              Score: {score.total} / {score.max} ({score.percent}%)
            </div>
            <div className="relative w-full h-6 bg-slate-700 rounded">
              <div 
                className="absolute left-0 top-0 h-full rounded transition-all duration-300"
                style={{
                  width: `${score.percent}%`,
                  background: score.percent <= 50 
                    ? `linear-gradient(90deg, #ef4444 0%, #eab308 100%)`
                    : `linear-gradient(90deg, #eab308 0%, #22c55e 100%)`
                }}
              ></div>
              <div className="absolute right-2 top-0 h-full flex items-center">
                <span className="text-sm font-bold text-slate-100">{score.percent}%</span>
              </div>
            </div>
          </div>

          {/* Answers Summary */}
          <div>
            <h3 className="font-semibold text-slate-200 mb-3">Answers</h3>
            <ul className="list-disc ml-5 space-y-2">
              {QUESTIONS.map(q => (
                <li key={q.id} className="text-slate-300">
                  <strong className="text-slate-200">{q.title}</strong>: {responses[q.id] || '-'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading} message="Submitting survey..." />
    </div>
  );
};

export default Survey;
