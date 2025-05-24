import React from 'react';
import { LucideIcon, Info } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  footer?: string;
  variant?: 'default' | 'emergency' | 'success' | 'warning' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  change,
  footer,
  variant = 'default',
}) => {
  // Define styles based on variant
  let variantClasses = '';
  let iconColorClass = iconColor || '';
  
  switch (variant) {
    case 'emergency':
      variantClasses = 'border-emergency-200 bg-emergency-50';
      iconColorClass = iconColor || 'text-emergency-600';
      break;
    case 'success':
      variantClasses = 'border-success-200 bg-success-50';
      iconColorClass = iconColor || 'text-success-600';
      break;
    case 'warning':
      variantClasses = 'border-warning-200 bg-warning-50';
      iconColorClass = iconColor || 'text-warning-600';
      break;
    case 'info':
      variantClasses = 'border-primary-200 bg-primary-50';
      iconColorClass = iconColor || 'text-primary-600';
      break;
    default:
      variantClasses = 'border-gray-200 bg-white';
      iconColorClass = iconColor || 'text-gray-600';
  }

  return (
    <div className={`p-4 rounded-lg border ${variantClasses}`}>
      <div className="flex items-center mb-2">
        {Icon ? (
          <Icon className={`h-6 w-6 mr-2 ${iconColorClass}`} />
        ) : (
          <Info className={`h-6 w-6 mr-2 ${iconColorClass}`} />
        )}
        <div className="flex-1">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
      
      <div className="mt-2">
        {change && (
          <p className="mt-1 flex items-center text-sm">
            <span className={change.isPositive ? 'text-success-600' : 'text-emergency-600'}>
              {change.isPositive ? '+' : ''}{change.value}%
            </span>
            <svg 
              className={`ml-1 h-4 w-4 ${change.isPositive ? 'text-success-500' : 'text-emergency-500'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              {change.isPositive ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              )}
            </svg>
          </p>
        )}
      </div>
      
      {footer && (
        <p className="mt-4 text-xs text-gray-500">{footer}</p>
      )}
    </div>
  );
};

export default StatCard;
