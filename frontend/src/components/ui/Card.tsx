import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  title,
  subtitle,
  footer,
  headerAction
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-soft border border-gray-200 overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      
      <div className="px-6 py-5">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
