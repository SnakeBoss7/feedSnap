import React from 'react';
import { LucideSettings, LucideGlobe } from 'lucide-react';

export const TeamCard = ({ team, onManage }) => {
  return (
    <div className="group bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-subtle p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-dark-border-DEFAULT transition-all duration-200">

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary text-base mb-1 truncate">{team.teamName}</h3>
          <p className="text-sm text-gray-500 dark:text-dark-text-muted line-clamp-1">
            {team.description || 'No description'}
          </p>
        </div>
        <button
          onClick={() => onManage(team)}
          className="p-2 text-gray-400 hover:text-primary2 hover:bg-primary2/5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ml-2 shrink-0"
        >
          <LucideSettings size={18} />
        </button>
      </div>

      {/* Website Info */}
      {team.webData?.url && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-100 dark:border-dark-border-subtle">
          <div className="flex items-center gap-2 text-xs">
            <LucideGlobe size={12} className="text-gray-400 shrink-0" />
            <span className="text-gray-600 dark:text-dark-text-secondary font-medium truncate">{team.webData.url}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 mb-5">
        <div className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-dark-bg-tertiary text-xs font-medium text-gray-600 dark:text-dark-text-secondary">
          {team.totalMembers} Members
        </div>
        <div className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-600 dark:text-blue-400 capitalize">
          {team.yourRole}
        </div>
      </div>

      {/* Members Avatars */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {team.members.slice(0, 4).map((member, i) => (
            <div
              key={i}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-dark-bg-secondary bg-gradient-to-br from-primary2/20 to-blue-500/20 dark:from-primary2/30 dark:to-blue-500/30 flex items-center justify-center text-xs font-semibold text-primary2"
              title={member.name}
            >
              {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
            </div>
          ))}
          {team.totalMembers > 4 && (
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-dark-bg-secondary bg-gray-100 dark:bg-dark-bg-tertiary flex items-center justify-center text-xs font-medium text-gray-500 dark:text-dark-text-muted">
              +{team.totalMembers - 4}
            </div>
          )}
        </div>

        <button
          onClick={() => onManage(team)}
          className="text-sm font-medium text-primary2 hover:text-green-600 transition-colors"
        >
          Manage →
        </button>
      </div>
    </div>
  );
};