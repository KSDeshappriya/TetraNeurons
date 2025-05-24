import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: Array<{ value: string, label: string }>;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className = '',
    label,
    helperText,
    error,
    options,
    fullWidth = true,
    disabled,
    ...props 
  }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors
            appearance-none bg-no-repeat
            ${error 
              ? 'border-emergency-500 focus:border-emergency-500 focus:ring-emergency-500' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
            ${className}
          `}
          style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
            backgroundPosition: "right 0.5rem center",
            backgroundSize: "1.5em 1.5em"
          }}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {(error || helperText) && (
          <div className="mt-1 text-sm">
            {error ? (
              <div className="flex items-center text-emergency-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{error}</span>
              </div>
            ) : (
              <p className="text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
