import React from 'react';
import { LucideUsers, LucideSettings, } from 'lucide-react';

export const TeamCard = ({ team, onManage }) => {
  return (
    <div className="group relative bg-white dark:bg-dark-bg-secondary rounded-2xl border border-gray-100 dark:border-dark-border-subtle p-5 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:border-gray-200 dark:hover:border-dark-border-DEFAULT transition-all duration-300">

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary2/10 to-purple-500/10 flex items-center justify-center text-primary2">
            <LucideUsers size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary text-base tracking-tight">{team.teamName}</h3>
            <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-0.5 line-clamp-1">
              {team.description || 'No description'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onManage(team)}
          className="p-2 text-gray-400 hover:text-primary2 hover:bg-primary2/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <LucideSettings size={18} />
        </button>
      </div>

      {/* Stats / Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-100 dark:border-dark-border-subtle text-xs font-medium text-gray-600 dark:text-dark-text-secondary">
          {team.totalMembers} Members
        </div>
        <div className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-xs font-medium text-blue-600 dark:text-blue-400 capitalize">
          {team.yourRole}
        </div>
      </div>

      {/* Members Avatars */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden">
          {team.members.slice(0, 4).map((member, i) => (
            <div
              key={i}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-dark-bg-secondary bg-gray-100 dark:bg-dark-bg-tertiary flex items-center justify-center text-xs font-medium text-gray-600 dark:text-dark-text-secondary"
              title={member.name}
            >
              {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
            </div>
          ))}
          {team.totalMembers > 4 && (
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-dark-bg-secondary bg-gray-50 dark:bg-dark-bg-tertiary flex items-center justify-center text-xs font-medium text-gray-500 dark:text-dark-text-muted">
              +{team.totalMembers - 4}
            </div>
          )}
        </div>

        <button
          onClick={() => onManage(team)}
          className="text-xs font-medium text-primary5 hover:text-blue-600 transition-colors"
        >
          Manage Team →
        </button>
      </div>
    </div>
  );
};