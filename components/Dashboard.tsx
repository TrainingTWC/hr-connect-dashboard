import React, { useEffect, useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Submission, Store } from '../types';
import { fetchSubmissions } from '../services/dataService';
import { hapticFeedback } from '../utils/haptics';
import StatCard from './StatCard';
import Loader from './Loader';
import ScoreDistributionChart from './ScoreDistributionChart';
import AverageScoreByManagerChart from './AverageScoreByManagerChart';
import { QUESTIONS, AREA_MANAGERS, HR_PERSONNEL, REGIONS } from '../constants';
import DashboardFilters from './DashboardFilters';
import RegionPerformanceInfographic from './RegionPerformanceInfographic';
import AMPerformanceInfographic from './AMPerformanceInfographic';
import HRPerformanceInfographic from './HRPerformanceInfographic';
import QuestionScoresInfographic from './QuestionScoresInfographic';
import AMRadarChart from './AMRadarChart';
import { UserRole, canAccessStore, canAccessAM, canAccessHR } from '../roleMapping';

interface DashboardProps {
  userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [allAreaManagers, setAllAreaManagers] = useState<any[]>([]);
  const [allHRPersonnel, setAllHRPersonnel] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    region: '',
    store: '',
    am: '',
    hr: '',
  });

  // Auto-populate filters from URL parameters - but only when explicitly intended for dashboard filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hrId = urlParams.get('hrId') || urlParams.get('hr_id');
    const hrName = urlParams.get('hrName') || urlParams.get('hr_name');
    const storeId = urlParams.get('storeId') || urlParams.get('store_id');
    const amId = urlParams.get('amId') || urlParams.get('am_id');
    const region = urlParams.get('region');
    const dashboardFilter = urlParams.get('dashboardFilter'); // Only apply filters if this param exists
    
    // Only auto-populate filters if explicitly intended for dashboard (not when just passing HR for survey)
    if (dashboardFilter || storeId || amId || region) {
      setFilters(prev => ({
        ...prev,
        hr: hrId || prev.hr,
        store: storeId || prev.store,
        am: amId || prev.am,
        region: region || prev.region
      }));
      console.log('Dashboard filters auto-populated from URL');
    } else {
      console.log('Skipping auto-filter population - no dashboardFilter param');
    }
  }, []);

  // Load stores, area managers, and HR personnel from hr_mapping.json
  useEffect(() => {
    const loadMappingData = async () => {
      try {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const response = await fetch(`${base}hr_mapping.json`);
        const hrMappingData = await response.json();
        
        // Extract unique stores
        const storeMap = new Map();
        const amMap = new Map();
        const hrMap = new Map();
        
        hrMappingData.forEach((item: any) => {
          // Stores
          if (!storeMap.has(item.storeId)) {
            storeMap.set(item.storeId, {
              name: item.locationName,
              id: item.storeId,
              region: item.region
            });
          }
          
          // Area Managers
          if (item.areaManagerId && !amMap.has(item.areaManagerId)) {
            // Find the AM name from constants or use ID
            const amFromConstants = AREA_MANAGERS.find(am => am.id === item.areaManagerId);
            amMap.set(item.areaManagerId, {
              name: amFromConstants?.name || `AM ${item.areaManagerId}`,
              id: item.areaManagerId
            });
          }
          
          // HR Personnel (HRBP, Regional HR, HR Head)
          [
            { id: item.hrbpId, type: 'HRBP' },
            { id: item.regionalHrId, type: 'Regional HR' },
            { id: item.hrHeadId, type: 'HR Head' },
            { id: item.lmsHeadId, type: 'LMS Head' }
          ].forEach(({ id, type }) => {
            if (id && !hrMap.has(id)) {
              const hrFromConstants = HR_PERSONNEL.find(hr => hr.id === id);
              hrMap.set(id, {
                name: hrFromConstants?.name || `${type} ${id}`,
                id: id
              });
            }
          });
        });
        
        const stores = Array.from(storeMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
        const areaManagers = Array.from(amMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
        const hrPersonnel = Array.from(hrMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
        
        setAllStores(stores);
        setAllAreaManagers(areaManagers);
        setAllHRPersonnel(hrPersonnel);
        
        console.log(`Dashboard loaded ${stores.length} stores, ${areaManagers.length} AMs, ${hrPersonnel.length} HR personnel from mapping data`);
      } catch (error) {
        console.warn('Dashboard could not load mapping data:', error);
        // Fallback to constants
        setAllStores([
          { name: 'Defence Colony', id: 'S027' },
          { name: 'Khan Market', id: 'S037' },
          { name: 'UB City', id: 'S007' },
          { name: 'Koramangala 1', id: 'S001' }
        ]);
        setAllAreaManagers(AREA_MANAGERS);
        setAllHRPersonnel(HR_PERSONNEL);
      }
    };
    
    loadMappingData();
  }, []);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await fetchSubmissions();
      console.log('Dashboard loaded data:', data.length, 'submissions');
      console.log('Sample submission:', data[0]);
      setSubmissions(data);
      setError(null);
      setLastRefresh(new Date());
      
      if (isRefresh) {
        console.log('Data refreshed from Google Sheets');
      }
    } catch (err) {
      setError('Failed to load submission data.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Load data immediately
    loadData(false);
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  const availableStores = useMemo(() => {
    let stores = allStores;
    
    // Filter by region first
    if (filters.region) {
      stores = stores.filter(s => s.region === filters.region);
    }
    
    // Filter by user role permissions
    stores = stores.filter(store => canAccessStore(userRole, store.id));
    
    return stores;
  }, [filters.region, userRole, allStores]);

  const availableAreaManagers = useMemo(() => {
    return allAreaManagers.filter(am => canAccessAM(userRole, am.id));
  }, [userRole, allAreaManagers]);

  const availableHRPersonnel = useMemo(() => {
    return allHRPersonnel.filter(hr => canAccessHR(userRole, hr.id));
  }, [userRole, allHRPersonnel]);

  const availableRegions = useMemo(() => {
    if (userRole.region) {
      return [userRole.region];
    }
    return REGIONS;
  }, [userRole]);

  const filteredData = useMemo(() => {
    if (!submissions) return null;

    console.log('Dashboard filtering - userRole:', userRole);
    console.log('Dashboard filtering - raw submissions:', submissions.length);

    let filtered = [...submissions];

    // Apply role-based filtering
    if (userRole) {
      const beforeRoleFilter = filtered.length;
      filtered = filtered.filter(submission => 
        canAccessStore(userRole, submission.storeID)
      );
      console.log(`Role filtering: ${beforeRoleFilter} -> ${filtered.length} submissions`);
    }

    // Filter by region
    if (filters.region) {
      const beforeRegionFilter = filtered.length;
      filtered = filtered.filter(submission => {
        const store = allStores.find(s => s.id === submission.storeID);
        return store && store.region === filters.region;
      });
      console.log(`Region filter (${filters.region}): ${beforeRegionFilter} -> ${filtered.length} submissions`);
    }

    // Filter by store
    if (filters.store) {
      const beforeStoreFilter = filtered.length;
      filtered = filtered.filter(submission => submission.storeID === filters.store);
      console.log(`Store filter (${filters.store}): ${beforeStoreFilter} -> ${filtered.length} submissions`);
    }

    // Filter by area manager
    if (filters.am) {
      const beforeAMFilter = filtered.length;
      filtered = filtered.filter(submission => submission.amId === filters.am);
      console.log(`AM filter (${filters.am}): ${beforeAMFilter} -> ${filtered.length} submissions`);
    }

    // Filter by HR personnel
    if (filters.hr) {
      const beforeHRFilter = filtered.length;
      filtered = filtered.filter(submission => submission.hrId === filters.hr);
      console.log(`HR filter (${filters.hr}): ${beforeHRFilter} -> ${filtered.length} submissions`);
    }

    console.log('Final filtered submissions:', filtered.length);
    return filtered;
  }, [submissions, filters, userRole, allStores]);

  const filteredSubmissions = filteredData || [];

  const stats = useMemo(() => {
    if (!filteredSubmissions) return null;

    const totalSubmissions = filteredSubmissions.length;
    const avgScore = totalSubmissions > 0 ? filteredSubmissions.reduce((acc, s) => acc + s.percent, 0) / totalSubmissions : 0;
    const uniqueEmployees = new Set(filteredSubmissions.map(s => s.empId)).size;
    const uniqueStores = new Set(filteredSubmissions.map(s => s.storeID)).size;

    return {
      totalSubmissions,
      avgScore: Math.round(avgScore),
      uniqueEmployees,
      uniqueStores
    };
  }, [filteredSubmissions]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    if (filterName === 'region') {
      newFilters.store = ''; // Reset store when region changes
    }
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({ region: '', store: '', am: '', hr: '' });
  };

  const generatePDFReport = () => {
    try {
      console.log('Starting PDF generation...');
      // Strong haptic feedback when starting PDF generation
      hapticFeedback.confirm();
      
      if (!filteredSubmissions || filteredSubmissions.length === 0) {
        alert('No data available to generate report');
        hapticFeedback.error();
        return;
      }

      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      let y = 15;

      // Header - matching hrconnect.html exactly
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(34, 107, 140); // Dark blue color
      doc.text('THIRD WAVE COFFEE | HR CONNECT', 14, y);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      y += 12;

      // Determine report type and entity details based on current filters
      let reportTitle = 'Dashboard Report';
      let entityDetails = {};

      if (filters.store) {
        const storeInfo = allStores.find(s => s.id === filters.store);
        reportTitle = 'Store Report';
        entityDetails = {
          'Store Name': storeInfo?.name || filters.store,
          'Store ID': filters.store,
          'Total Submissions': filteredSubmissions.length,
          'Employees Surveyed': stats?.uniqueEmployees || 0
        };
      } else if (filters.am) {
        const amInfo = AREA_MANAGERS.find(am => am.id === filters.am);
        reportTitle = 'Area Manager Report';
        const amStores = filteredSubmissions.reduce((acc, sub) => {
          if (sub.storeName && !acc.includes(sub.storeName)) {
            acc.push(sub.storeName);
          }
          return acc;
        }, []);
        entityDetails = {
          'Area Manager': amInfo?.name || filters.am,
          'AM ID': filters.am,
          'Stores Managed': amStores.join(', ') || 'N/A',
          'Total Submissions': filteredSubmissions.length,
          'Stores Covered': stats?.uniqueStores || 0,
          'Employees Surveyed': stats?.uniqueEmployees || 0
        };
      } else if (filters.hr) {
        const hrInfo = HR_PERSONNEL.find(hr => hr.id === filters.hr);
        reportTitle = 'HR Personnel Report';
        entityDetails = {
          'HR Name': hrInfo?.name || filters.hr,
          'HR ID': filters.hr,
          'Total Submissions': filteredSubmissions.length,
          'Stores Covered': stats?.uniqueStores || 0,
          'Employees Surveyed': stats?.uniqueEmployees || 0
        };
      } else if (filters.region) {
        reportTitle = 'Region Report';
        entityDetails = {
          'Region': filters.region,
          'Total Submissions': filteredSubmissions.length,
          'Stores Covered': stats?.uniqueStores || 0,
          'Employees Surveyed': stats?.uniqueEmployees || 0
        };
      } else {
        // General dashboard report
        entityDetails = {
          'Generated by': userRole?.name || 'Unknown',
          'Role': userRole?.role?.replace('_', ' ').toUpperCase() || 'Unknown',
          'Region Access': userRole?.region || 'All Regions',
          'Total Submissions': filteredSubmissions.length,
          'Stores Covered': stats?.uniqueStores || 0,
          'Employees Surveyed': stats?.uniqueEmployees || 0
        };
      }

      // Report Title Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      doc.text(reportTitle, 14, y);
      y += 10;

      // Entity Details - two columns like hrconnect.html
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const entityEntries = Object.entries(entityDetails);
      for (let i = 0; i < entityEntries.length; i += 2) {
        const [key1, value1] = entityEntries[i];
        const [key2, value2] = entityEntries[i + 1] || ['', ''];
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${key1}:`, 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${value1}`, 45, y);
        
        if (key2) {
          doc.setFont('helvetica', 'bold');
          doc.text(`${key2}:`, 110, y);
          doc.setFont('helvetica', 'normal');
          doc.text(`${value2}`, 140, y);
        }
        y += 6;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('Generated:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleString(), 45, y);
      y += 15;

      // Score and progress bar
      if (filteredSubmissions.length !== 1) {
        // Multi-submission: show average percent and bar here
        const scoreToShow = stats?.avgScore || 0;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(51, 51, 51);
        doc.text(`Average Score: ${scoreToShow}%`, 14, y);
        y += 8;

        const barX = 14, barY = y, barW = 170, barH = 8;
        doc.setFillColor(235, 235, 235);
        doc.rect(barX, barY, barW, barH, 'F');
        function lerp(a: number, b: number, t: number) { return Math.round(a + (b - a) * t); }
        function colorAt(t: number) {
          if (t <= 0.5) {
            const tt = t / 0.5;
            return [lerp(255, 255, tt), lerp(99, 204, tt), lerp(71, 0, tt)];
          } else {
            const tt = (t - 0.5) / 0.5;
            return [lerp(255, 34, tt), lerp(204, 177, tt), lerp(0, 76, tt)];
          }
        }
        const scorePercentage = scoreToShow;
        const fillW = Math.max(0, Math.min(barW, Math.round((scorePercentage / 100) * barW)));
        const sliceW = 1;
        for (let i = 0; i < fillW; i += sliceW) {
          const t = i / (barW - 1);
          const [r, g, b] = colorAt(t);
          doc.setFillColor(r, g, b);
          doc.rect(barX + i, barY, sliceW, barH, 'F');
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const pctText = `${Math.round(scorePercentage)}%`;
        const pctWidth = doc.getTextWidth(pctText);
        doc.text(pctText, barX + barW - pctWidth, barY + barH - 1);
        y += barH + 15;
      }

      // For individual submission reports (when filtered to specific store/employee)
      if (filteredSubmissions.length === 1) {
        const submission = filteredSubmissions[0];
        console.log('Single submission data:', submission);
        
        // Survey Details Section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Survey Details', 14, y);
        y += 8;

        // Survey details in two columns (like the attachment)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Left column
        doc.setFont('helvetica', 'bold');
        doc.text('HR Name:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(submission.hrName || 'N/A', 50, y);
        
        // Right column
        doc.setFont('helvetica', 'bold');
        doc.text('HR ID:', 110, y);
        doc.setFont('helvetica', 'normal');
        doc.text(submission.hrId || 'N/A', 130, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.text('Area Manager:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(submission.amName || 'N/A', 50, y);
        
        doc.setFont('helvetica', 'bold');
        doc.text('AM ID:', 110, y);
        doc.setFont('helvetica', 'normal');
        doc.text(submission.amId || 'N/A', 130, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.text('Emp Name:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(submission.empName || 'N/A', 50, y);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Emp ID:', 110, y);
        doc.setFont('helvetica', 'normal');
        doc.text(submission.empId || 'N/A', 130, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.text('Store Name:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(submission.storeName || 'N/A', 50, y);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Store ID:', 110, y);
        doc.setFont('helvetica', 'normal');
        doc.text(submission.storeID || 'N/A', 130, y);
        y += 15;

        // Score section with bar (after details)
        const singleScore = submission.totalScore || 0;
        const singlePct = Math.round((singleScore / (submission.maxScore || 50)) * 100);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`Score: ${singleScore} / 50   (${singlePct}%)`, 14, y);
        y += 8;

        const barX = 14, barY = y, barW = 170, barH = 8;
        doc.setFillColor(235, 235, 235);
        doc.rect(barX, barY, barW, barH, 'F');
        function lerp(a: number, b: number, t: number) { return Math.round(a + (b - a) * t); }
        function colorAt(t: number) {
          if (t <= 0.5) {
            const tt = t / 0.5;
            return [lerp(255, 255, tt), lerp(99, 204, tt), lerp(71, 0, tt)];
          } else {
            const tt = (t - 0.5) / 0.5;
            return [lerp(255, 34, tt), lerp(204, 177, tt), lerp(0, 76, tt)];
          }
        }
        const fillW = Math.max(0, Math.min(barW, Math.round((singlePct / 100) * barW)));
        const sliceW = 1;
        for (let i = 0; i < fillW; i += sliceW) {
          const t = i / (barW - 1);
          const [r, g, b] = colorAt(t);
          doc.setFillColor(r, g, b);
          doc.rect(barX + i, barY, sliceW, barH, 'F');
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const pctText = `${singlePct}%`;
        const pctWidth = doc.getTextWidth(pctText);
        doc.text(pctText, barX + barW - pctWidth, barY + barH - 1);
        y += barH + 12;

        // Individual Question Responses Table
        const questionResponses = QUESTIONS.map((question) => {
          // Access Submission fields directly (q1..q12) and remarks if present
          const respKey = question.id as keyof Submission;
          const remarksKey = `${question.id}_remarks` as keyof Submission;
          const raw = (submission as any)[respKey];
          const remarks = ((submission as any)[remarksKey] as string) || '';
          let answerText = 'No Response';

          // Always display the raw value if it exists, regardless of whether it matches expected choices
          if (raw !== undefined && raw !== null && raw !== '') {
            answerText = String(raw).trim();
          }

          return [
            question.title,
            answerText,
            remarks || '-'
          ];
        });

          autoTable(doc, {
            startY: y,
            head: [['Question', 'Answer', 'Remarks']],
            body: questionResponses,
            styles: { 
              fontSize: 9, 
              textColor: '#000000',
              cellPadding: 3,
              lineWidth: 0.3,
              lineColor: [0, 0, 0]
            },
            headStyles: { 
              fillColor: [255, 255, 255], 
              textColor: '#000000', 
              fontStyle: 'bold',
              lineWidth: 0.5,
              lineColor: [0, 0, 0]
            },
            bodyStyles: {
              lineWidth: 0.2,
              lineColor: [180, 180, 180]
            },
            columnStyles: {
              0: { cellWidth: 90 },
              1: { cellWidth: 55 },
              2: { cellWidth: 45 }
            },
            margin: { left: 14, right: 14 }
          });

          y = doc.lastAutoTable ? (doc.lastAutoTable.finalY + 10) : (y + 10);
        

        // End of single-submission section (timestamp already printed above in entity details)

      } else {
        // Summary Statistics Table for multiple submissions
        const summaryData = [
          ['Total Responses', filteredSubmissions.length.toString()],
          ['Average Score', `${stats?.avgScore || 0}%`],
          ['Unique Employees', (stats?.uniqueEmployees || 0).toString()],
          ['Stores Covered', (stats?.uniqueStores || 0).toString()],
          ['Response Rate', `${Math.round(((stats?.uniqueEmployees || 0) / Math.max(1, stats?.uniqueStores || 1)) * 100)}% avg per store`]
        ];

        autoTable(doc, {
          startY: y,
          head: [['Metric', 'Value']],
          body: summaryData,
          styles: { 
            fontSize: 10, 
            textColor: '#000000',
            cellPadding: 3
          },
          headStyles: { 
            fillColor: [245, 245, 245], 
            textColor: '#000000', 
            fontStyle: 'bold',
            lineWidth: 0.5,
            lineColor: [200, 200, 200]
          },
          bodyStyles: {
            lineWidth: 0.3,
            lineColor: [220, 220, 220]
          },
          columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { cellWidth: 40 }
          },
          margin: { left: 14, right: 14 }
        });

        y = doc.lastAutoTable ? (doc.lastAutoTable.finalY + 15) : (y + 15);
      }

      // Question Performance + Individual Submissions (only for multi-result reports)
      if (filteredSubmissions.length !== 1) {
        // Question Performance Table
        const questionPerformance = QUESTIONS.map((question) => {
          const questionScores = filteredSubmissions
            .map(s => {
              const val = (s as any)[question.id];
              if (val == null || val === '') return null;
              if (question.type === 'radio' && question.choices) {
                const choice = question.choices.find(c => c.label === String(val));
                return choice ? choice.score : null;
              }
              // For non-scored questions, skip
              return null;
            })
            .filter((score): score is number => score !== null && !isNaN(score as any));

          const avgQuestionScore = questionScores.length > 0 
            ? (questionScores.reduce((a, b) => a + b, 0) / questionScores.length)
            : 0;

          const maxScore = (question.choices && question.choices.length)
            ? Math.max(...question.choices.map(c => c.score || 5))
            : 5;

          const responseCount = questionScores.length;
          const percentage = Math.round((avgQuestionScore / maxScore) * 100);

          return [
            question.title.length > 50 ? question.title.substring(0, 47) + '...' : question.title,
            responseCount.toString(),
            avgQuestionScore.toFixed(1),
            `${percentage}%`
          ];
        });

        // Check if we need a new page
        if (y > 200) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51);
        doc.text('Question Performance Analysis', 14, y);
        y += 8;

        autoTable(doc, {
          startY: y,
          head: [['Question', 'Responses', 'Avg Score', 'Performance']],
          body: questionPerformance,
          styles: { 
            fontSize: 9, 
            textColor: '#000000',
            cellPadding: 2.5
          },
          headStyles: { 
            fillColor: [245, 245, 245], 
            textColor: '#000000', 
            fontStyle: 'bold',
            lineWidth: 0.5,
            lineColor: [200, 200, 200]
          },
          bodyStyles: {
            lineWidth: 0.3,
            lineColor: [220, 220, 220]
          },
          columnStyles: {
            0: { cellWidth: 110 },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' }
          },
          margin: { left: 14, right: 14 }
        });

        y = doc.lastAutoTable ? (doc.lastAutoTable.finalY + 15) : (y + 15);

        // Individual Submissions Table (if manageable number)
        if (filteredSubmissions.length <= 20) {
          if (y > 220) {
            doc.addPage();
            y = 20;
          }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(51, 51, 51);
          doc.text('Individual Submissions', 14, y);
          y += 8;

          const submissionData = filteredSubmissions.map((submission, index) => [
            (index + 1).toString(),
            submission.empName || 'N/A',
            submission.storeName || 'N/A',
            new Date(submission.submissionTime).toLocaleDateString(),
            `${submission.percent || 0}%`
          ]);

          autoTable(doc, {
            startY: y,
            head: [['#', 'Employee', 'Store', 'Date', 'Score']],
            body: submissionData,
            styles: { 
              fontSize: 8, 
              textColor: '#000000',
              cellPadding: 2
            },
            headStyles: { 
              fillColor: [245, 245, 245], 
              textColor: '#000000', 
              fontStyle: 'bold',
              lineWidth: 0.5,
              lineColor: [200, 200, 200]
            },
            bodyStyles: {
              lineWidth: 0.3,
              lineColor: [220, 220, 220]
            },
            columnStyles: {
              0: { cellWidth: 15, halign: 'center' },
              1: { cellWidth: 50 },
              2: { cellWidth: 50 },
              3: { cellWidth: 35, halign: 'center' },
              4: { cellWidth: 25, halign: 'center' }
            },
            margin: { left: 14, right: 14 }
          });

          y = doc.lastAutoTable ? (doc.lastAutoTable.finalY + 15) : (y + 15);
        }
      }

      // Store Performance Section (for AM reports showing multiple stores)
      if (filters.am && stats?.uniqueStores && stats.uniqueStores > 1) {
        if (y > 220) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51);
        doc.text('Store Performance Breakdown', 14, y);
        y += 8;

        const storePerformance: { [key: string]: Submission[] } = {};
        filteredSubmissions.forEach(sub => {
          if (!storePerformance[sub.storeName]) {
            storePerformance[sub.storeName] = [];
          }
          storePerformance[sub.storeName].push(sub);
        });

        const storeData = Object.entries(storePerformance).map(([storeName, storeSubmissions]) => {
          const storeScores = storeSubmissions.map(s => s.totalScore).filter(s => s !== undefined);
          const avgStoreScore = storeScores.length > 0 
            ? Math.round(storeScores.reduce((a, b) => a + b, 0) / storeScores.length)
            : 0;

          return [
            storeName,
            storeSubmissions.length.toString(),
            `${avgStoreScore}%`,
            storeSubmissions.map(s => s.empName).filter(Boolean).join(', ')
          ];
        });

        autoTable(doc, {
            startY: y,
            head: [['Store Name', 'Submissions', 'Avg Score', 'Employees']],
            body: storeData,
            styles: { 
              fontSize: 9, 
              textColor: '#000000',
              cellPadding: 2.5
            },
            headStyles: { 
              fillColor: [245, 245, 245], 
              textColor: '#000000', 
              fontStyle: 'bold',
              lineWidth: 0.5,
              lineColor: [200, 200, 200]
            },
            bodyStyles: {
              lineWidth: 0.3,
              lineColor: [220, 220, 220]
            },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 25, halign: 'center' },
              2: { cellWidth: 25, halign: 'center' },
              3: { cellWidth: 80 }
            },
            margin: { left: 14, right: 14 }
          });
        }

      // Generate filename based on entity type
      let filename = 'HRConnect_Report';
      if (filters.store) {
        const storeInfo = allStores.find(s => s.id === filters.store);
        filename = `HRConnect_Store_${(storeInfo?.name || filters.store).replace(/\s+/g, '_')}`;
      } else if (filters.am) {
        const amInfo = AREA_MANAGERS.find(am => am.id === filters.am);
        filename = `HRConnect_AM_${(amInfo?.name || filters.am).replace(/\s+/g, '_')}`;
      } else if (filters.hr) {
        const hrInfo = HR_PERSONNEL.find(hr => hr.id === filters.hr);
        filename = `HRConnect_HR_${(hrInfo?.name || filters.hr).replace(/\s+/g, '_')}`;
      } else if (filters.region) {
        filename = `HRConnect_Region_${filters.region.replace(/\s+/g, '_')}`;
      }

      // Single-submission: use HRPulse_* naming like the sample
      if (filteredSubmissions.length === 1) {
        const s = filteredSubmissions[0];
        const emp = (s.empId || 'EMP').replace(/\s+/g, '_');
        const ts = new Date().toISOString().replace(/[:.]/g, '').replace('T','_').slice(0,15);
        doc.save(`HRPulse_${emp}_${ts}.pdf`);
      } else {
        doc.save(`${filename}_${Date.now()}.pdf`);
      }
      console.log('PDF generated successfully');
      // Ultra-strong success haptic for PDF completion (like premium apps)
      hapticFeedback.ultraStrong();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
      hapticFeedback.error();
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center text-red-600 dark:text-red-400">{error}</div>;
  }
  
  if (!submissions) {
    return <div className="text-center text-gray-500 dark:text-slate-400">No submission data available.</div>
  }

  return (
    <div className="space-y-6">
      {/* Refresh Indicator */}
      {refreshing && (
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
            <span className="text-sm">Refreshing data from Google Sheets...</span>
          </div>
        </div>
      )}

      {/* Last Updated Indicator */}
      {!loading && submissions && (
        <div className="flex justify-end items-center gap-4">
          <span className="text-xs text-gray-500 dark:text-slate-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 2l4 4-4 4"/>
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12a9 9 0 019-9h9"/>
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 22l-4-4 4-4"/>
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9H3"/>
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      )}

      <DashboardFilters
        regions={availableRegions}
        stores={availableStores}
        areaManagers={availableAreaManagers}
        hrPersonnel={availableHRPersonnel}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      {/* Download Report Button */}
      {filteredSubmissions.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={generatePDFReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
        </div>
      )}
      
      {filteredSubmissions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Submissions" value={stats?.totalSubmissions} />
            <StatCard title="Average Score" value={`${stats?.avgScore}%`} />
            <StatCard title="Employees Surveyed" value={stats?.uniqueEmployees} />
            <StatCard title="Stores Covered" value={stats?.uniqueStores} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <RegionPerformanceInfographic submissions={filteredSubmissions} stores={allStores} />
            <AMPerformanceInfographic submissions={filteredSubmissions} />
            <HRPerformanceInfographic submissions={filteredSubmissions} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScoreDistributionChart submissions={filteredSubmissions} />
              <AverageScoreByManagerChart submissions={filteredSubmissions} />
          </div>
          
          <QuestionScoresInfographic submissions={filteredSubmissions} questions={QUESTIONS} />
          
          <div className="grid grid-cols-1 gap-6">
            <AMRadarChart submissions={filteredSubmissions} />
          </div>
        </>
      ) : (
        <div className="text-center py-10 bg-slate-800/50 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-slate-100">No Results Found</h3>
            <p className="text-slate-400 mt-1">Try adjusting your filters to find data.</p>
        </div>
      )}

    </div>
  );
};

export default Dashboard;