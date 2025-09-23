import React, { useState, useEffect, useMemo } from 'react';
import { QUESTIONS, AREA_MANAGERS, HR_PERSONNEL } from '../constants';
import { Question, Choice, Store } from '../types';
import { UserRole, canAccessStore, canAccessAM, canAccessHR } from '../roleMapping';

// Google Sheets endpoint for logging data
const LOG_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzVpp1sziQozQyI_3KLtQGumjPtMMT_iBFEqzzU8g9hfdizxoO5D4wHpW5S-CYYJ8V7IA/exec';

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
    
    // Get HR info from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const hrId = urlParams.get('hrId') || urlParams.get('hr_id') || (stored as any).hrId || '';
    const hrName = urlParams.get('hrName') || urlParams.get('hr_name') || (stored as any).hrName || '';
    
    // If HR ID is provided but no name, try to find it from HR_PERSONNEL
    let finalHrName = hrName;
    if (hrId && !hrName) {
      const hrPerson = HR_PERSONNEL.find(hr => hr.id === hrId);
      if (hrPerson) {
        finalHrName = hrPerson.name;
      }
    }
    
    return {
      hrName: finalHrName,
      hrId: hrId,
      amName: (stored as any).amName || '',
      amId: (stored as any).amId || '',
      empName: (stored as any).empName || '',
      empId: (stored as any).empId || '',
      storeName: (stored as any).storeName || '',
      storeId: (stored as any).storeId || ''
    };
  });

  const [submitted, setSubmitted] = useState(false);
  const [allStores, setAllStores] = useState<Store[]>([]);

  // Auto-fetch HR info from URL on component mount and save to localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hrId = urlParams.get('hrId') || urlParams.get('hr_id');
    const hrName = urlParams.get('hrName') || urlParams.get('hr_name');
    
    if (hrId || hrName) {
      setMeta(prev => {
        let finalHrName = hrName || prev.hrName;
        let finalHrId = hrId || prev.hrId;
        
        // If HR ID is provided but no name, try to find it from HR_PERSONNEL
        if (finalHrId && !finalHrName) {
          const hrPerson = HR_PERSONNEL.find(hr => hr.id === finalHrId);
          if (hrPerson) {
            finalHrName = hrPerson.name;
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
          hrId: finalHrId
        };
        
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
    const loadStores = async () => {
      try {
        const response = await fetch('/hr_mapping.json');
        const hrMappingData = await response.json();
        
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

  // Role-based filtering for available options
  const availableStores = useMemo(() => {
    return allStores.filter(store => canAccessStore(userRole, store.id));
  }, [userRole, allStores]);

  const availableAreaManagers = useMemo(() => {
    return AREA_MANAGERS.filter(am => canAccessAM(userRole, am.id));
  }, [userRole]);

  const availableHRPersonnel = useMemo(() => {
    return HR_PERSONNEL.filter(hr => canAccessHR(userRole, hr.id));
  }, [userRole]);

  const handleMetaChange = (key: keyof SurveyMeta, value: string) => {
    setMeta(prev => {
      const next = { ...prev, [key]: value };
      try { 
        localStorage.setItem('hr_meta', JSON.stringify(next)); 
      } catch(e) {}
      return next;
    });
  };

  const handleChange = (id: string, value: string) => {
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
      return;
    }
    
    // Log data to Google Sheets
    await logDataToGoogleSheets();
    
    alert('Survey submitted successfully!');
    setSubmitted(true);
  };

  const logDataToGoogleSheets = async () => {
    const score = computeScore();
    
    // Detect region based on the selected store, AM, or HR from hr_mapping.json
    let detectedRegion = '';
    try {
      const response = await fetch('/hr_mapping.json');
      const hrMappingData = await response.json();
      
      // First try to find region by store ID
      if (meta.storeId) {
        const storeMapping = hrMappingData.find((item: any) => item.storeId === meta.storeId);
        if (storeMapping) {
          detectedRegion = storeMapping.region || '';
        }
      }
      
      // If not found by store, try by Area Manager ID
      if (!detectedRegion && meta.amId) {
        const amMapping = hrMappingData.find((item: any) => item.amId === meta.amId);
        if (amMapping) {
          detectedRegion = amMapping.region || '';
        }
      }
      
      // If still not found, try by HR ID
      if (!detectedRegion && meta.hrId) {
        const hrMapping = hrMappingData.find((item: any) => item.hrbpId === meta.hrId || item.regionalHrId === meta.hrId);
        if (hrMapping) {
          detectedRegion = hrMapping.region || '';
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
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide text-slate-200">
          Third Wave Coffee
        </h1>
        <span className="text-3xl sm:text-4xl font-black text-slate-500">|</span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-200">
          HR CONNECT
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Survey Details Card */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="font-bold text-gray-900 dark:text-slate-100 mb-4 text-lg">Survey Details</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-slate-300">
                HR Name 
                {meta.hrName && <span className="text-green-400 text-xs">(Auto-filled from URL)</span>}
              </span>
              {meta.hrName ? (
                <input 
                  className="p-3 border border-slate-600 rounded bg-slate-600 text-slate-200" 
                  value={meta.hrName} 
                  readOnly 
                  title="Auto-filled from URL parameters"
                />
              ) : (
                <select
                  className="p-3 border border-slate-600 rounded bg-slate-700 text-slate-100"
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
              <span className="mb-1 text-slate-300">
                HR ID
                {meta.hrId && <span className="text-green-400 text-xs">(Auto-filled)</span>}
              </span>
              <input 
                className="p-3 border border-slate-600 rounded bg-slate-600 text-slate-200" 
                value={meta.hrId || ''} 
                readOnly 
                title={meta.hrId ? "Auto-filled from URL parameters or HR selection" : "Will be filled when HR is selected"}
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-slate-300">Area Manager Name</span>
              <select
                className="p-3 border border-slate-600 rounded bg-slate-700 text-slate-100"
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
              <span className="mb-1 text-slate-300">Area Manager ID</span>
              <input 
                className="p-3 border border-slate-600 rounded bg-slate-700 text-slate-200" 
                value={meta.amId || ''} 
                readOnly 
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-slate-300">Employee Name</span>
              <input 
                className="p-3 border border-slate-600 rounded bg-slate-700 text-slate-100 focus:border-sky-400 focus:outline-none" 
                value={meta.empName} 
                onChange={e => handleMetaChange('empName', e.target.value)} 
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-slate-300">Employee ID</span>
              <input 
                className="p-3 border border-slate-600 rounded bg-slate-700 text-slate-100 focus:border-sky-400 focus:outline-none" 
                value={meta.empId} 
                onChange={e => handleMetaChange('empId', e.target.value)} 
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-slate-300">Store Name</span>
              <select
                className="p-3 border border-slate-600 rounded bg-slate-700 text-slate-100"
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
              <span className="mb-1 text-slate-300">Store ID</span>
              <input 
                className="p-3 border border-slate-600 rounded bg-slate-700 text-slate-200" 
                value={meta.storeId} 
                readOnly 
              />
            </label>
          </div>
        </div>

        {/* Questions */}
        {QUESTIONS.map(q => (
          <div key={q.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="font-bold text-slate-100 mb-4">{q.title}</div>
            
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
                        className="w-4 h-4 text-sky-400 bg-slate-700 border-slate-600 focus:ring-sky-400"
                      />
                      <span className="text-slate-200">{c.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <textarea
                    className="w-full p-3 border border-slate-600 rounded bg-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:border-sky-400 focus:outline-none"
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
                        className="w-4 h-4 text-sky-400 bg-slate-700 border-slate-600 focus:ring-sky-400 mb-2"
                      />
                      <span className="text-sm text-slate-300">{c.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <textarea
                    className="w-full p-3 border border-slate-600 rounded bg-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:border-sky-400 focus:outline-none"
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
                  className="w-full mt-2 p-3 border border-slate-600 rounded bg-slate-700 text-slate-100 placeholder-slate-400 focus:border-sky-400 focus:outline-none"
                  type="text"
                  value={responses[q.id] || ''}
                  onChange={e => handleChange(q.id, e.target.value)}
                />
                <div className="mt-4">
                  <textarea
                    className="w-full p-3 border border-slate-600 rounded bg-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:border-sky-400 focus:outline-none"
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
                className="w-full mt-2 p-3 border border-slate-600 rounded bg-slate-700 text-slate-100 placeholder-slate-400 focus:border-sky-400 focus:outline-none"
                rows={4}
                value={responses[q.id] || ''}
                onChange={e => handleChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}

        {/* Submit Section */}
        <div className="flex items-center justify-between bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-slate-400">
            All radio/scale questions are required.
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-6 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors duration-200"
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
        <div className="mt-6 bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="font-bold text-slate-100 text-xl mb-4">Submission Summary</h2>
          
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
    </div>
  );
};

export default Survey;
