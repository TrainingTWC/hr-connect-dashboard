import React, { useEffect, useState, useMemo } from 'react';
import { UserRole } from '../roleMapping';
import { hapticFeedback } from '../utils/haptics';
import Loader from './Loader';
import NotificationOverlay from './NotificationOverlay';
import * as XLSX from 'xlsx';

// Google Apps Script endpoint for fetching reference check data (fixed unified endpoint)
const REFERENCE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwNZ-5uCFxrwZuJ2c76TXjmX_gwRrzAsXtfLPA3Pi9AhRqtFb2aR_ZzuQ0Yt0J21xJoNQ/exec';

interface ReferenceCheckData {
  submissionTime: string;
  hrName: string;
  hrId: string;
  candidateName: string;
  candidateId: string;
  referenceName: string;
  referenceContact: string;
  region: string;
  rc1: string; // Since how long do you know this person
  rc2: string; // Designation of the reference
  rc3: string; // Employment History (Duration)
  rc4: string; // Warning Letter
  rc5: string; // Integrity Issue
  rc6: string; // Punctuality
  rc7: string; // Behavior in terms of Customer
  rc8: string; // Would you consider rehiring this person
  rc9: string; // Reason for Exit
  rc10: string; // Overall Feedback
  totalScore: string;
  maxScore: string;
  percent: string;
}

interface ReferenceDashboardProps {
  userRole: UserRole;
}

const ReferenceDashboard: React.FC<ReferenceDashboardProps> = ({ userRole }) => {
  const [referenceData, setReferenceData] = useState<ReferenceCheckData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Filters
  const [filters, setFilters] = useState({
    hrName: '',
    region: '',
    candidateName: '',
    referenceName: '',
    dateFrom: '',
    dateTo: ''
  });

  // Notification overlay state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');

  const showNotificationMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const loadReferenceData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      hapticFeedback.strong();
      showNotificationMessage('Refreshing reference check data...', 'info');
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      console.log('Fetching reference check data from Google Sheets...');
      
      // Try direct request first (works if CORS is properly configured)
      let response;
      let data;
      
      try {
        console.log('Trying direct request to Google Apps Script for reference data...');
        const directUrl = REFERENCE_SHEETS_ENDPOINT + '?action=getReferenceData';
        
        response = await fetch(directUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          redirect: 'follow',
        });
        
        if (response.ok) {
          data = await response.json();
          console.log('Direct request successful, reference data received:', data);
          console.log('First record structure:', data[0]);
          console.log('All field names in first record:', Object.keys(data[0] || {}));
        } else {
          throw new Error(`Direct request failed: ${response.status}`);
        }
      } catch (directError) {
        console.log('Direct request failed, trying CORS proxy for reference data...', directError);
        
        // Fallback to CORS proxy
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = REFERENCE_SHEETS_ENDPOINT + '?action=getReferenceData';

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
          console.log('No real reference data available, returning empty array');
          setReferenceData([]);
          return;
        }

        data = await response.json();
        console.log('CORS proxy request successful, reference data received:', data);
      }
      
      // Check if the received data is an array, as expected
      if (!Array.isArray(data)) {
        console.error('Reference data from Google Sheets is not an array:', data);
        setReferenceData([]);
        return;
      }
      
      console.log('Reference check data processed:', data);
      console.log('Setting referenceData with:', data);
      
      // Map the Google Sheets field names to the expected interface
      const mappedData = data.map((item: any) => ({
        submissionTime: item['Times'] || item.submissionTime || new Date().toISOString(),
        hrName: item['HR Name'] || item.hrName || '',
        hrId: item['HR ID'] || item.hrId || '',
        candidateName: item['Employee Name'] || item.candidateName || '',
        candidateId: item['Employee ID'] || item.candidateId || '',
        referenceName: item['Reference Name'] || item.referenceName || '',
        referenceContact: item['Reference ID'] || item.referenceContact || '',
        region: item['Region'] || item.region || '',
        rc1: item['Since how long do you know this person?'] || item.rc1 || '',
        rc2: item['2. Designation of the reference'] || item.rc2 || '',
        rc3: item['3. Employment History (Duration)'] || item.rc3 || '',
        rc4: item['Warning Letter'] || item.rc4 || '',
        rc5: item['Integrity Issue'] || item.rc5 || '',
        rc6: item['Punctuality'] || item.rc6 || '',
        rc7: item['Behavior in terms of Customer'] || item.rc7 || '',
        rc8: item['Would you consider rehiring this person'] || item.rc8 || '',
        rc9: item['Reason for Exit'] || item.rc9 || '',
        rc10: item['Overall Feedback (if any)'] || item.rc10 || '',
        totalScore: item['Total'] || item.totalScore || '',
        maxScore: item.maxScore || '100',
        percent: item['Percentage'] || item.percent || ''
      }));
      
      console.log('Mapped data:', mappedData);
      setReferenceData(mappedData);
      setLastRefresh(new Date());
      
      if (isRefresh) {
        showNotificationMessage(`Successfully loaded ${data.length} reference check records`, 'success');
        hapticFeedback.success();
      }
      
    } catch (error) {
      console.error('Error fetching reference check data:', error);
      
      // Show sample data when the sheet doesn't exist yet
      setReferenceData([
        {
          submissionTime: new Date().toISOString(),
          hrName: 'Sample HR',
          hrId: 'H001',
          candidateName: 'John Doe',
          candidateId: 'E001',
          referenceName: 'Jane Smith',
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
          rc10: 'Highly recommended',
          totalScore: '85',
          maxScore: '100',
          percent: '85'
        }
      ]);
      
      setError('Failed to load reference check data. Showing sample data. Please ensure the "Reference Checks" sheet exists in your Google Sheets.');
      
      if (isRefresh) {
        showNotificationMessage('Failed to refresh data - showing sample data', 'error');
        hapticFeedback.error();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    if (!referenceData) return [];
    
    return referenceData.filter(item => {
      // HR Name filter
      if (filters.hrName && !item.hrName.toLowerCase().includes(filters.hrName.toLowerCase())) {
        return false;
      }
      
      // Region filter
      if (filters.region && !item.region.toLowerCase().includes(filters.region.toLowerCase())) {
        return false;
      }
      
      // Candidate Name filter
      if (filters.candidateName && !item.candidateName.toLowerCase().includes(filters.candidateName.toLowerCase())) {
        return false;
      }
      
      // Reference Name filter
      if (filters.referenceName && !item.referenceName.toLowerCase().includes(filters.referenceName.toLowerCase())) {
        return false;
      }
      
      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const itemDate = new Date(item.submissionTime);
        if (filters.dateFrom && itemDate < new Date(filters.dateFrom)) {
          return false;
        }
        if (filters.dateTo && itemDate > new Date(filters.dateTo + 'T23:59:59')) {
          return false;
        }
      }
      
      return true;
    });
  }, [referenceData, filters]);

  // Get unique values for filter dropdowns
  const uniqueHRNames = useMemo(() => {
    if (!referenceData) return [];
    return [...new Set(referenceData.map(item => item.hrName))].sort();
  }, [referenceData]);

  const uniqueRegions = useMemo(() => {
    if (!referenceData) return [];
    return [...new Set(referenceData.map(item => item.region))].filter(region => region && region !== 'Unknown').sort();
  }, [referenceData]);

  // Statistics
  const stats = useMemo(() => {
    if (!filteredData.length) return { total: 0, avgScore: 0, passRate: 0 };
    
    const validScores = filteredData.filter(item => item.percent && !isNaN(Number(item.percent)));
    const totalScore = validScores.reduce((sum, item) => sum + Number(item.percent), 0);
    const avgScore = validScores.length > 0 ? Math.round(totalScore / validScores.length) : 0;
    const passRate = validScores.length > 0 ? Math.round((validScores.filter(item => Number(item.percent) >= 70).length / validScores.length) * 100) : 0;
    
    return {
      total: filteredData.length,
      avgScore,
      passRate
    };
  }, [filteredData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      hrName: '',
      region: '',
      candidateName: '',
      referenceName: '',
      dateFrom: '',
      dateTo: ''
    });
    hapticFeedback.tap();
  };

  const exportToExcel = () => {
    if (!filteredData.length) {
      showNotificationMessage('No data to export', 'error');
      return;
    }

    hapticFeedback.strong();
    
    try {
      // Prepare data for Excel export
      const exportData = filteredData.map(item => ({
        'Submission Time': item.submissionTime,
        'HR Name': item.hrName,
        'HR ID': item.hrId,
        'Candidate Name': item.candidateName,
        'Candidate ID': item.candidateId,
        'Reference Name': item.referenceName,
        'Reference Contact': item.referenceContact,
        'Region': item.region,
        'Duration Known': item.rc1,
        'Reference Designation': item.rc2,
        'Employment History': item.rc3,
        'Warning Letter': item.rc4,
        'Integrity Issue': item.rc5,
        'Punctuality': item.rc6,
        'Customer Behavior': item.rc7,
        'Rehiring Consideration': item.rc8,
        'Exit Reason': item.rc9,
        'Overall Feedback': item.rc10,
        'Total Score': item.totalScore,
        'Max Score': item.maxScore,
        'Percentage': item.percent + '%'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = [
        { wch: 20 }, // Submission Time
        { wch: 25 }, // HR Name
        { wch: 10 }, // HR ID
        { wch: 20 }, // Candidate Name
        { wch: 15 }, // Candidate ID
        { wch: 20 }, // Reference Name
        { wch: 20 }, // Reference Contact
        { wch: 10 }, // Region
        { wch: 15 }, // Duration Known
        { wch: 20 }, // Reference Designation
        { wch: 25 }, // Employment History
        { wch: 15 }, // Warning Letter
        { wch: 15 }, // Integrity Issue
        { wch: 15 }, // Punctuality
        { wch: 25 }, // Customer Behavior
        { wch: 20 }, // Rehiring Consideration
        { wch: 25 }, // Exit Reason
        { wch: 30 }, // Overall Feedback
        { wch: 12 }, // Total Score
        { wch: 12 }, // Max Score
        { wch: 12 }  // Percentage
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Reference Check Data');

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `Reference_Check_Report_${dateStr}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      showNotificationMessage(`Excel file "${filename}" downloaded successfully!`, 'success');
      hapticFeedback.success();
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotificationMessage('Error exporting to Excel', 'error');
      hapticFeedback.error();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600 dark:text-slate-300">Loading reference check data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Data</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => loadReferenceData()}
            className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Overlay */}
      <NotificationOverlay 
        isVisible={showNotification}
        message={notificationMessage}
        type={notificationType}
      />

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Reference Check Dashboard
            </h1>
            <p className="text-gray-600 dark:text-slate-300 mt-2">
              Monitor and analyze reference check submissions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => loadReferenceData(true)}
              disabled={refreshing}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 w-full sm:w-auto ${
                refreshing
                  ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
              }`}
            >
              {refreshing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>
        
        {/* Last refresh time */}
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Last updated: {lastRefresh.toLocaleString()}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Total Reference Checks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Pass Rate (≥70%)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.passRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">HR Name</label>
            <select
              value={filters.hrName}
              onChange={(e) => handleFilterChange('hrName', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All HR Personnel</option>
              {uniqueHRNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Region</label>
            <select
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All Regions</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Candidate Name</label>
            <input
              type="text"
              value={filters.candidateName}
              onChange={(e) => handleFilterChange('candidateName', e.target.value)}
              placeholder="Search candidate..."
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Reference Name</label>
            <input
              type="text"
              value={filters.referenceName}
              onChange={(e) => handleFilterChange('referenceName', e.target.value)}
              placeholder="Search reference..."
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Reference Check Records ({filteredData.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">HR Personnel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Region</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-slate-400">
                    No reference check records found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const score = Number(item.percent) || 0;
                  const scoreColor = score >= 80 ? 'text-green-600 dark:text-green-400' : 
                                  score >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 
                                  'text-red-600 dark:text-red-400';
                  const statusColor = score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';

                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.submissionTime ? new Date(item.submissionTime).toLocaleDateString() : 'Invalid Date'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.hrName}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{item.hrId}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.candidateName}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{item.candidateId}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.referenceName}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{item.referenceContact}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.region}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${scoreColor}`}>
                          {score}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          {item.totalScore}/{item.maxScore}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                          {score >= 70 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReferenceDashboard;