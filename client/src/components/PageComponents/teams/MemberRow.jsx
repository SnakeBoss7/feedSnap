import React, { useState } from 'react';
import { LucideTrash2 } from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';
import { RoleSelector } from './RoleSelector';

export const MemberRow = ({ member, currentUserRole, onRoleChange, onRemove }) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const canManage = currentUserRole === 'owner' || (currentUserRole === 'admin' && member.role !== 'owner');

  const handleRemove = () => {
    onRemove(member.userId);
    setShowRemoveConfirm(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white dark:bg-dark-bg-secondary rounded-lg transition-colors gap-3 sm:gap-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary2 flex items-center justify-center text-white font-medium text-sm shrink-0">
            {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">
                {member.name || 'Unknown User'}
              </h4>
              {member.role === 'owner' && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary rounded font-medium shrink-0">
                  Owner
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-text-muted truncate">{member.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pl-0 sm:pl-3">
          {canManage && member.role !== 'owner' ? (
            <RoleSelector
              value={member.role}
              onChange={(newRole) => onRoleChange(member.userId, newRole)}
            />
          ) : (
            <span className="text-sm text-gray-500 dark:text-dark-text-muted px-3 capitalize">
              {member.role}
            </span>
          )}

          {canManage && member.role !== 'owner' && (
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Remove member"
            >
              <LucideTrash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleRemove}
        title="Remove Member?"
        message={`Are you sure you want to remove ${member.name || member.email} from this team?`}
        confirmText="Remove"
        isDestructive={true}
      />
    </>
  );
};
