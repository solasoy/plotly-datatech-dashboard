import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export interface DateRangePickerProps {
  value: string;
  onChange: (range: string) => void;
  options?: Array<{ label: string; value: string }>;
  className?: string;
}

const defaultOptions = [
  { label: '6 Months', value: '6M' },
  { label: '1 Year', value: '1Y' },
  { label: '2 Years', value: '2Y' },
  { label: 'All Time', value: 'ALL' }
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  options = defaultOptions,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(option => option.value === value) || options[0];

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.date-range-picker')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`date-range-picker relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Time Range
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          className="relative w-full min-w-[120px] bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
        >
          <span className="block truncate text-gray-900">
            {selectedOption.label}
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

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors duration-150 ${
                  option.value === value
                    ? 'bg-blue-50 text-blue-900 font-medium'
                    : 'text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;