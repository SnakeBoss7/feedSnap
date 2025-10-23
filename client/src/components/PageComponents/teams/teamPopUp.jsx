import React, { useState } from 'react';
import { X, Users, Calendar, Mail, UserPlus, Trash2 } from 'lucide-react';
import { RoleSelect } from './roleSelect';
import { AddMemberForm } from './addMember';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
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
        // Remove the member from local state
        setMembers(prev => prev.filter(m => m.userId !== memberToDelete.userId));
        
        // Update parent component
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
        // Add the new member to local state
        const newMember = response.data.member;
        setMembers(prev => [...prev, newMember]);
        
        // Update parent component
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
      // Prepare members data for backend
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
        // Update parent component with new team data
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
      // Reset members to original team data
      if (team) {
        setMembers([...team.members]);
      }
      setShowAddMember(false);
      onClose();
    }
  };

  if (!isOpen || !team) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden scrollbar-hide">
          <div className="flex items-center justify-between p-6 border-b border-green-200">
            <h2 className="text-xl font-semibold text-gray-900">Manage Team</h2>
            <button
              onClick={handleClose}
              disabled={isLoading || isSaving || deletingMemberId !== null || showDeleteConfirm}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-hide">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900">{team.teamName}</h3>
              <p className="text-gray-600 mt-1">{team.motive || 'No description'}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
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

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Team Members</h4>
                {(team.yourRole === 'owner' || team.yourRole === 'editor') && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    disabled={isLoading || isSaving || deletingMemberId !== null || showDeleteConfirm}
                    className="flex items-center gap-2 px-3 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Member
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

              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={member.userId} className="flex items-center gap-3 md:p-4 py-4 bg-gray-50 rounded-lg">
                    <div className="min-w-8 min-h-8 md:w-10 md:h-10 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm md:text-lg text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                    </div>
                    <div className="w-32">
                      {(team.yourRole === 'owner' || team.yourRole === 'editor') ? (
                        <RoleSelect
                          value={member.role}
                          onChange={(newRole) => handleRoleChange(member.userId, newRole)}
                          shouldDropUp={index >= members.length - 2}
                          disabled={member.role === 'owner' && team.yourRole !== 'owner'}
                        />
                      ) : (
                        <span className="text-sm text-gray-600 capitalize">{member.role}</span>
                      )}
                    </div>
                    {(team.yourRole === 'owner' || team.yourRole === 'editor') && member.role !== 'owner' && (
                      <button
                        onClick={() => confirmDeleteMember(member)}
                        disabled={deletingMemberId === member.userId || isLoading || isSaving || showDeleteConfirm}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove member"
                      >
                        {deletingMemberId === member.userId ? (
                          <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 flex md:justify-end justify-center gap-3 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isLoading || isSaving || deletingMemberId !== null || showDeleteConfirm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            {(team.yourRole === 'owner' || team.yourRole === 'editor') && (
              <button 
                onClick={handleSave}
                disabled={isLoading || isSaving || deletingMemberId !== null || showDeleteConfirm}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
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