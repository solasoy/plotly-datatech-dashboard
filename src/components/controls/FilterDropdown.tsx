import React from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid';

export interface FilterDropdownProps {
  label: string;
  value: string | string[];
  options: Array<{ label: string; value: string }>;
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  multiSelect = false,
  placeholder = 'Select option...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedValues = Array.isArray(value) ? value : [value];
  const selectedOptions = options.filter(option => selectedValues.includes(option.value));
  
  const displayText = selectedOptions.length === 0 
    ? placeholder 
    : multiSelect 
      ? selectedOptions.length === 1 
        ? selectedOptions[0].label 
        : `${selectedOptions.length} selected`
      : selectedOptions[0].label;

  const handleSelect = (selectedValue: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue];
      onChange(newValues);
    } else {
      onChange(selectedValue);
      setIsOpen(false);
    }
  };

  const handleClearAll = () => {
    onChange(multiSelect ? [] : '');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSelected = (optionValue: string) => {
    return selectedValues.includes(optionValue);
  };

  return (
    <div className={`filter-dropdown relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className={`relative w-full min-w-[150px] border rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 sm:text-sm transition-colors duration-200 ${
            disabled
              ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white border-gray-300 hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500'
          }`}
        >
          <span className={`block truncate ${
            selectedOptions.length === 0 ? 'text-gray-500' : 'text-gray-900'
          }`}>
            {displayText}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </span>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {/* Clear All option for multi-select */}
            {multiSelect && selectedValues.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50 border-b border-gray-200 font-medium"
              >
                Clear All
              </button>
            )}
            
            {/* "All" option for single select */}
            {!multiSelect && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors duration-150 flex items-center justify-between ${
                  value === '' ? 'bg-blue-50 text-blue-900 font-medium' : 'text-gray-900'
                }`}
              >
                All
                {value === '' && (
                  <CheckIcon className="h-4 w-4 text-blue-600" />
                )}
              </button>
            )}

            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors duration-150 flex items-center justify-between ${
                  isSelected(option.value)
                    ? 'bg-blue-50 text-blue-900 font-medium'
                    : 'text-gray-900'
                }`}
              >
                {option.label}
                {isSelected(option.value) && (
                  <CheckIcon className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Selected items display for multi-select */}
      {multiSelect && selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {option.label}
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none focus:bg-blue-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;