import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'emergency' | 'success' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    className = '',
    ...props 
  }, ref) => {
    // Base styles
    let variantClasses = '';
    
    // Determine variant styles
    switch(variant) {
      case 'primary':
        variantClasses = 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-400';
        break;
      case 'secondary':
        variantClasses = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500';
        break;
      case 'emergency':
        variantClasses = 'bg-emergency-600 text-white hover:bg-emergency-700 focus:ring-emergency-500 disabled:bg-emergency-400';
        break;
      case 'success':
        variantClasses = 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 disabled:bg-success-400';
        break;
      case 'warning':
        variantClasses = 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 disabled:bg-warning-400';
        break;
      case 'outline':
        variantClasses = 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500';
        break;
      case 'ghost':
        variantClasses = 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500';
        break;
      default:
        variantClasses = 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-400';
    }

    // Determine size styles
    let sizeClasses = '';
    switch(size) {
      case 'sm':
        sizeClasses = 'text-xs px-3 py-1.5 rounded';
        break;
      case 'md':
        sizeClasses = 'text-sm px-4 py-2 rounded-md';
        break;
      case 'lg':
        sizeClasses = 'text-base px-5 py-2.5 rounded-md';
        break;
      default:
        sizeClasses = 'text-sm px-4 py-2 rounded-md';
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-medium transition-colors duration-200 
          focus:outline-none focus:ring-2 focus:ring-offset-2 
          disabled:opacity-60 disabled:cursor-not-allowed
          ${fullWidth ? 'w-full' : ''}
          ${variantClasses} 
          ${sizeClasses}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!isLoading && React.isValidElement(leftIcon) && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!isLoading && React.isValidElement(rightIcon) && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
