import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
}) => {
  // Define styles based on variant
  const variantStyles: Record<AlertVariant, {
    containerClass: string,
    iconClass: string,
    icon: React.ReactNode
  }> = {
    success: {
      containerClass: 'bg-success-50 text-success-800 border-success-200',
      iconClass: 'text-success-500',
      icon: <CheckCircle className="h-5 w-5" />
    },
    warning: {
      containerClass: 'bg-warning-50 text-warning-800 border-warning-200',
      iconClass: 'text-warning-500',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    error: {
      containerClass: 'bg-emergency-50 text-emergency-800 border-emergency-200',
      iconClass: 'text-emergency-500',
      icon: <AlertCircle className="h-5 w-5" />
    },
    info: {
      containerClass: 'bg-primary-50 text-primary-800 border-primary-200',
      iconClass: 'text-primary-500',
      icon: <Info className="h-5 w-5" />
    }
  };

  const { containerClass, iconClass, icon } = variantStyles[variant];

  return (
    <div className={`p-4 rounded-lg border ${containerClass} ${className}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${iconClass}`}>
          {icon}
        </div>
        <div className="ml-3">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
