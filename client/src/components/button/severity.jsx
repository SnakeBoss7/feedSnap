
import React from 'react';

const SeverityBadge = ({ severity }) => {
  const getSeverityConfig = (level) => {
    if (level === null || level === undefined || level === '') {
      return {
        label: 'Unknown',
        bgColor: 'bg-gray-500',
        textColor: 'text-white',
        borderColor: 'border-gray-600'
      };
    }

    const severityNum = Number(level);
    
    if (isNaN(severityNum) || severityNum < 0 || severityNum > 10) {
      return {
        label: 'Invalid',
        bgColor: 'bg-gray-400',
        textColor: 'text-white',
        borderColor: 'border-gray-500'
      };
    }

    if (severityNum === 0) {
      return {
        label: 'None',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
      };
    } else if (severityNum <= 3) {
      return {
        label: 'Low',
        bgColor: 'bg-green-300',
        textColor: 'text-green-800',
        borderColor: 'border-green-400'
      };
    } else if (severityNum <= 6) {
      return {
        label: 'Medium',
        bgColor: 'bg-yellow-100',
        textColor: 'text-orange-800',
        borderColor: 'border-yellow-300'
      };
    } else if (severityNum <= 8) {
      return {
        label: 'High',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-300'
      };
    } else {
      return {
        label: 'Critical',
        bgColor: 'bg-red-300',
        textColor: 'text-red-900',
        borderColor: 'border-red-400'
      };
    }
  };

  const config = getSeverityConfig(severity);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bgColor} ${config.textColor} `}>
      {config.label}
      {severity !== null && severity !== undefined && severity !== '' && !isNaN(Number(severity)) && (
        <span className="ml-1.5 opacity-75">({severity})</span>
      )}
    </span>
  );
};

// Export for use in other components
export { SeverityBadge };