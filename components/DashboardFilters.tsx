
import React from 'react';
import { Store, AreaManager, HRPerson } from '../types';

interface DashboardFiltersProps {
  regions: string[];
  stores: Store[];
  areaManagers: AreaManager[];
  hrPersonnel: HRPerson[];
  filters: {
    region: string;
    store: string;
    am: string;
    hr: string;
  };
  onFilterChange: (filterName: 'region' | 'store' | 'am' | 'hr', value: string) => void;
  onReset: () => void;
}

const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}> = ({ label, value, onChange, options, placeholder, disabled = false }) => (
  <div>
    <label htmlFor={label} className="block text-sm font-medium text-gray-700 dark:text-slate-400">{label}</label>
    <select
      id={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  regions,
  stores,
  areaManagers,
  hrPersonnel,
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <FilterSelect
          label="Region"
          value={filters.region}
          onChange={(e) => onFilterChange('region', e.target.value)}
          placeholder="All Regions"
          options={regions.map(r => ({ value: r, label: r }))}
        />
        <FilterSelect
          label="Store"
          value={filters.store}
          onChange={(e) => onFilterChange('store', e.target.value)}
          placeholder="All Stores"
          options={stores.map(s => ({ value: s.id, label: s.name }))}
          disabled={!filters.region}
        />
        <FilterSelect
          label="Area Manager"
          value={filters.am}
          onChange={(e) => onFilterChange('am', e.target.value)}
          placeholder="All AMs"
          options={areaManagers.map(am => ({ value: am.id, label: am.name }))}
        />
        <FilterSelect
          label="HR Personnel"
          value={filters.hr}
          onChange={(e) => onFilterChange('hr', e.target.value)}
          placeholder="All HR"
          options={hrPersonnel.map(hr => ({ value: hr.id, label: hr.name }))}
        />
        <button
          onClick={onReset}
          className="w-full bg-gray-500 dark:bg-slate-600 hover:bg-gray-600 dark:hover:bg-slate-500 text-white dark:text-slate-100 font-semibold py-2 px-4 rounded-md transition-colors duration-200 h-[42px]"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;
