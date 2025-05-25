import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '',
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
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
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error 
                ? 'border-emergency-500 focus:border-emergency-500 focus:ring-emergency-500' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
              ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
              ${className}
            `}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
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

Input.displayName = 'Input';

export default Input;
