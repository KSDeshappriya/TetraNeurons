import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className = '',
    label,
    helperText,
    error,
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
        
        <textarea
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
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

Textarea.displayName = 'Textarea';

export default Textarea;
