import React, { useState } from 'react';
import { LucideX, LucideUsers, LucideSettings, LucidePlus, LucideLoader2, LucideTrash2 } from 'lucide-react';
import { MemberRow } from './MemberRow';
import { ConfirmationDialog } from './ConfirmationDialog';

export const TeamManagementPopup = ({ team, isOpen, onClose, onAddMember, onRoleChange, onRemoveMember, onDeleteTeam }) => {
  const [activeTab, setActiveTab] = useState('members');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !team) return null;

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    setIsAdding(true);
    setAddError('');
    try {
      await onAddMember(team.teamId, { email: newMemberEmail });
      setNewMemberEmail('');
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    try {
      await onDeleteTeam(team.teamId);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-dark-bg-secondary w-full h-full sm:h-auto sm:max-w-3xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[85vh]">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between shrink-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary truncate">{team.teamName}</h2>
              <p className="text-sm text-gray-500 dark:text-dark-text-muted mt-0.5">{team.members.length} members</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-hover rounded-lg transition-colors text-gray-500 dark:text-dark-text-secondary shrink-0">
              <LucideX size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-4 sm:px-6 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('members')}
              className={`py-3 px-3 sm:px-4 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'bg-gray-50 dark:bg-dark-bg-tertiary text-primary2'
                  : 'text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text-secondary'
              }`}
            >
              <LucideUsers size={16} />
              <span className="hidden sm:inline">Members</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-3 sm:px-4 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-gray-50 dark:bg-dark-bg-tertiary text-primary2'
                  : 'text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text-secondary'
              }`}
            >
              <LucideSettings size={16} />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-bg-tertiary p-4 sm:p-6">
            {activeTab === 'members' && (
              <div className="space-y-4">
                {/* Add Member */}
                <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary mb-3">Invite Member</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-primary2/40 outline-none transition-all"
                    />
                    <button
                      onClick={handleAddMember}
                      disabled={isAdding || !newMemberEmail}
                      className="bg-primary2 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                      {isAdding ? <LucideLoader2 size={16} className="animate-spin" /> : <LucidePlus size={16} />}
                      <span>Invite</span>
                    </button>
                  </div>
                  {addError && <p className="text-sm text-red-500 mt-2">{addError}</p>}
                </div>

                {/* Members List */}
                <div className="space-y-2">
                  {team.members.map((member) => (
                    <MemberRow
                      key={member.userId}
                      member={member}
                      currentUserRole={team.yourRole}
                      onRoleChange={(userId, newRole) => onRoleChange(team.teamId, userId, newRole)}
                      onRemove={(userId) => onRemoveMember(team.teamId, userId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                {/* Danger Zone */}
                <div className="bg-white dark:bg-dark-bg-secondary p-4 sm:p-5 rounded-lg">
                  <h3 className="text-sm font-medium text-red-600 mb-3">Delete Team</h3>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                    Permanently delete this team and all its data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting || team.yourRole !== 'owner'}
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-500/10 text-red-600 text-sm font-medium rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <LucideTrash2 size={16} />
                    Delete Team
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTeam}
        title="Delete Team?"
        message={`Are you sure you want to delete "${team.teamName}"? This action cannot be undone.`}
        confirmText="Delete Team"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
};