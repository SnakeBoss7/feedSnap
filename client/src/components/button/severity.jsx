
import React from 'react';

const SeverityBadge = ({ severity }) => {
  const getSeverityConfig = (level) => {
    if (level === null || level === undefined || level === '') {
      return {
        label: 'Unknown',
        bgColor: 'bg-gray-100 dark:bg-gray-500/10',
        textColor: 'text-gray-700 dark:text-gray-400',
        borderColor: 'border-gray-200 dark:border-gray-500/20',
        dotColor: 'bg-gray-500'
      };
    }

    const severityNum = Number(level);

    if (isNaN(severityNum) || severityNum < 0 || severityNum > 10) {
      return {
        label: 'Invalid',
        bgColor: 'bg-gray-100 dark:bg-gray-500/10',
        textColor: 'text-gray-700 dark:text-gray-400',
        borderColor: 'border-gray-200 dark:border-gray-500/20',
        dotColor: 'bg-gray-400'
      };
    }

    if (severityNum === 0) {
      return {
        label: 'None',
        bgColor: 'bg-green-100 dark:bg-green-500/10',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-500/20',
        dotColor: 'bg-green-500'
      };
    } else if (severityNum <= 3) {
      return {
        label: 'Low',
        bgColor: 'bg-green-100 dark:bg-green-500/10',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-500/20',
        dotColor: 'bg-green-500'
      };
    } else if (severityNum <= 6) {
      return {
        label: 'Medium',
        bgColor: 'bg-amber-100 dark:bg-amber-500/10',
        textColor: 'text-amber-700 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-500/20',
        dotColor: 'bg-amber-500'
      };
    } else if (severityNum <= 8) {
      return {
        label: 'High',
        bgColor: 'bg-red-100 dark:bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-500/20',
        dotColor: 'bg-red-500'
      };
    } else {
      return {
        label: 'Critical',
        bgColor: 'bg-red-100 dark:bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-500/20',
        dotColor: 'bg-red-600'
      };
    }
  };

  const config = getSeverityConfig(severity);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full md:text-xs text-[10px] font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
      {config.label}
      {severity !== null && severity !== undefined && severity !== '' && !isNaN(Number(severity)) && (
        <span className="opacity-75">({severity})</span>
      )}
    </span>
  );
};

// Export for use in other components
export { SeverityBadge };