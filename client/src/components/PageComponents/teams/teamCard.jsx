import React from 'react';
import { Users } from 'lucide-react';

export const TeamCard = ({ team, onManage }) => (
  <div className="bg-white rounded-lg border border-gray-200 transition-colors">
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{team.teamName}</h3>
        <p className="text-gray-600 text-sm">{team.description}</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Users className="h-4 w-4" />
        <span>{team.members.length} members</span>
      </div>

      <div className="flex -space-x-2 mb-4">
        {team.members.slice(0, 4).map((member) => (
          <div
            key={member.id}
            className="w-8 h-8 bg-gray-600 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
            title={member.name}
          >
            {member.name.split(' ').map(n => n[0]).join('')}
          </div>
        ))}
        {team.memberCount > 4 && (
          <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
            +{team.memberCount - 4}
          </div>
        )}
      </div>

      <button
        onClick={() => onManage(team)}
        className="w-full py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Manage Team
      </button>
    </div>
  </div>
);