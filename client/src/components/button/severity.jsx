
import React from 'react';

const SeverityBadge = ({ severity }) => {
  const getSeverityConfig = (level) => {
    if (level === null || level === undefined || level === '') {
      return {
        label: 'Unknown',
        bgColor: 'bg-gray-500 dark:bg-gray-600',
        textColor: 'text-white',
        borderColor: 'border-gray-600 dark:border-gray-500'
      };
    }

    const severityNum = Number(level);
    
    if (isNaN(severityNum) || severityNum < 0 || severityNum > 10) {
      return {
        label: 'Invalid',
        bgColor: 'bg-gray-400 dark:bg-gray-600',
        textColor: 'text-white',
        borderColor: 'border-gray-500 dark:border-gray-500'
      };
    }

    if (severityNum === 0) {
      return {
        label: 'None',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-400',
        borderColor: 'border-green-300 dark:border-green-800'
      };
    } else if (severityNum <= 3) {
      return {
        label: 'Low',
        bgColor: 'bg-green-300 dark:bg-green-800',
        textColor: 'text-green-900 dark:text-green-100',
        borderColor: 'border-green-400 dark:border-green-700'
      };
    } else if (severityNum <= 6) {
      return {
        label: 'Medium',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-800 dark:text-yellow-400',
        borderColor: 'border-yellow-300 dark:border-yellow-800'
      };
    } else if (severityNum <= 8) {
      return {
        label: 'High',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-800 dark:text-orange-400',
        borderColor: 'border-orange-300 dark:border-orange-800'
      };
    } else {
      return {
        label: 'Critical',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-400',
        borderColor: 'border-red-300 dark:border-red-800'
      };
    }
  };

  const config = getSeverityConfig(severity);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor} `}>
      {config.label}
      {severity !== null && severity !== undefined && severity !== '' && !isNaN(Number(severity)) && (
        <span className="ml-1.5 opacity-75">({severity})</span>
      )}
    </span>
  );
};

// Export for use in other components
export { SeverityBadge };