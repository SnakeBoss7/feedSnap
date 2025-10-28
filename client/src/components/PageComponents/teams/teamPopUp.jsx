import React, { useState } from 'react';
import { X, Users, Calendar, Mail, UserPlus, Trash2, MoreVertical } from 'lucide-react';
import { RoleSelect } from './roleSelect';
import { AddMemberForm } from './addMember';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-[300px] p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Removing...
              </>
            ) : (
              'Remove'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Member Actions Menu - Mobile friendly dropdown
const MemberActionsMenu = ({ member, onRoleChange, onDelete, isDeleting, yourRole, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDeleting || disabled}
        className="p-2 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
        title="Member actions"
      >
        {isDeleting ? (
          <div className="h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <MoreVertical className="h-5 w-5 text-gray-600" />
        )}
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-[-150px] mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Change Role</div>
              {['editor', 'viewer'].map(role => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange(role);
                    setIsOpen(false);
                  }}
                  disabled={member.role === 'owner' && yourRole !== 'owner'}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded capitalize flex items-center gap-2 disabled:opacity-50"
                >
                  <div className={`h-2 w-2 rounded-full ${member.role === role ? 'bg-green-600' : 'bg-gray-300'}`} />
                  {role}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200">
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove from team
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const TeamManagementPopup = ({ team, isOpen, onClose, onUpdateTeam }) => {
  const [members, setMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  React.useEffect(() => {
    if (team) {
      setMembers([...team.members]);
    }
  }, [team]);

  const handleRoleChange = (memberId, newRole) => {
    setMembers(prev => 
      prev.map(member => 
        member.userId === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  const confirmDeleteMember = (member) => {
    setMemberToDelete(member);
    setShowDeleteConfirm(true);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    setDeletingMemberId(memberToDelete.userId);
    
    try {
      const response = await axios.delete(
        `${apiUrl}/api/team/${team.teamId}/member/${memberToDelete.userId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setMembers(prev => prev.filter(m => m.userId !== memberToDelete.userId));
        
        if (onUpdateTeam) {
          onUpdateTeam(team.teamId, {
            ...team,
            members: members.filter(m => m.userId !== memberToDelete.userId),
            totalMembers: response.data.totalMembers
          });
        }
        
        setShowDeleteConfirm(false);
        setMemberToDelete(null);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove member. Please try again.';
      alert(errorMessage);
    } finally {
      setDeletingMemberId(null);
    }
  };

  const handleAddMember = async (memberData) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${apiUrl}/api/team/${team.teamId}/addMember`,
        {
          email: memberData.email,
          role: memberData.role || 'viewer'
        },
        {
          withCredentials: true,
          timeout: 10000
        }
      );

      if (response.data.success) {
        const newMember = response.data.member;
        setMembers(prev => [...prev, newMember]);
        
        if (onUpdateTeam) {
          onUpdateTeam(team.teamId, {
            ...team,
            members: [...members, newMember],
            totalMembers: response.data.totalMembers
          });
        }
        
        setShowAddMember(false);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add member. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const membersData = members.map(m => ({
        userId: m.userId,
        role: m.role
      }));

      const response = await axios.put(
        `${apiUrl}/api/team/${team.teamId}/members`,
        {
          members: membersData
        },
        {
          withCredentials: true,
          timeout: 10000
        }
      );

      if (response.data.success) {
        if (onUpdateTeam) {
          onUpdateTeam(team.teamId, response.data.team);
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save changes. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isSaving && deletingMemberId === null && !showDeleteConfirm) {
      if (team) {
        setMembers([...team.members]);
      }
      setShowAddMember(false);
      onClose();
    }
  };

  if (!isOpen || !team) return null;

  const canEdit = team.yourRole === 'owner' || team.yourRole === 'editor';

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden scrollbar-hide">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-green-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Manage Team</h2>
            <button
              onClick={handleClose}
              disabled={isLoading || isSaving || deletingMemberId !== null || showDeleteConfirm}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-hide">
            <div className="p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">{team.teamName}</h3>
              <p className="text-sm md:text-base text-gray-600 mt-1">{team.description || 'No description'}</p>
              <p className="text-sm md:text-base text-gray-600 mt-1">{team.mail || 'No description'}</p>
              <div className="flex items-center gap-3 md:gap-4 mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{members.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base md:text-lg font-semibold text-gray-900">Team Members</h4>
                {canEdit && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    disabled={isLoading || isSaving || deletingMemberId !== null || showDeleteConfirm}
                    className="flex items-center gap-2 px-3 py-2 bg-green-700 text-white rounded-lg text-xs md:text-sm hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Member</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                )}
              </div>

              {showAddMember && (
                <AddMemberForm
                  onAddMember={handleAddMember}
                  onCancel={() => setShowAddMember(false)}
                  isLoading={isLoading}
                />
              )}

              <div className="space-y-2 md:space-y-3">
                {members.map((member) => (
                  <div key={member.userId} className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-600 rounded-full flex items-center justify-center text-sm md:text-base font-medium text-white flex-shrink-0">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      
                      {/* Member Info & Actions */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium flex items-center justify-between text-sm md:text-base text-gray-900 truncate">
                              {member.name}
                               {canEdit && member.role !== 'owner' && (
                          <div className="">
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-green-100 text-green-800 capitalize">
                               {member.role}
                            </span>
                          </div>
                        )}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          </div>
                          
                          {/* Role & Actions */}
                          {canEdit && member.role !== 'owner' ? (
                            <MemberActionsMenu
                              member={member}
                              onRoleChange={(newRole) => handleRoleChange(member.userId, newRole)}
                              onDelete={() => confirmDeleteMember(member)}
                              isDeleting={deletingMemberId === member.userId}
                              yourRole={team.yourRole}
                              disabled={isLoading || isSaving || showDeleteConfirm}
                            />
                          ) : (
                            <div className="px-2.5 py-1 bg-gray-200 rounded text-xs md:text-sm font-medium text-gray-700 capitalize flex-shrink-0">
                              {member.role}
                            </div>
                          )}
                        </div>
                        
                        {/* Current Role Display - Shows below name on mobile */}
                       
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 flex justify-center md:justify-end gap-3 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isLoading || isSaving || deletingMemberId !== null || showDeleteConfirm}
              className="px-4 py-2 text-sm md:text-base text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            {canEdit && (
              <button 
                onClick={handleSave}
                disabled={isLoading || isSaving || deletingMemberId !== null || showDeleteConfirm}
                className="px-4 py-2 text-sm md:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${memberToDelete?.name} from the team? This action cannot be undone.`}
        onConfirm={handleDeleteMember}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setMemberToDelete(null);
        }}
        isLoading={deletingMemberId !== null}
      />
    </>
  );
};