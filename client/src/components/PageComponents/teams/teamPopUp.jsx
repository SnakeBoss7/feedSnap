import React, { useState } from 'react';
import { X, Users, Calendar, Mail, UserPlus } from 'lucide-react';
import { RoleSelect } from './roleSelect';
import { AddMemberForm } from './addMember';

export const TeamManagementPopup = ({ team, isOpen, onClose, onSaveChanges, onAddMember }) => {
  const [members, setMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);

  React.useEffect(() => {
    if (team) {
      setMembers([...team.members]);
    }
  }, [team]);

  const handleRoleChange = (memberId, newRole) => {
    setMembers(prev => 
      prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleAddMember = (memberData) => {
    const newMember = {
      id: Date.now(), // In real app, this would come from backend
      ...memberData
    };
    setMembers(prev => [...prev, newMember]);
    onAddMember(team.id, memberData);
    setShowAddMember(false);
  };

  const handleSave = () => {
    onSaveChanges(team.id, members);
    onClose();
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden scrollbar-hide">
        <div className="flex items-center justify-between p-6 border-b border-green-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Team</h2>
          <button
            onClick={onClose}
            className="p-1 rounded"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-hide" >
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900">{team.name}</h3>
            <p className="text-gray-600 mt-1">{team.description}</p>
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
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-2 px-3 py-2 bg-green-700 text-white rounded-lg text-sm"
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </button>
            </div>
            {showAddMember && (
            <AddMemberForm
              onAddMember={handleAddMember}
              onCancel={() => setShowAddMember(false)}
            />
          )}
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={member.id} className="flex items-center gap-3 md:p-4 py-4 bg-gray-50 rounded-lg">
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
                    <RoleSelect
                      value={member.role}
                      onChange={(newRole) => handleRoleChange(member.id, newRole)}
                      shouldDropUp={index >= members.length - 2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          
        </div>

        <div className="p-6  flex    md:justify-end justify-center  gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-green-700 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
        {/* <div className='h-10'></div> */}
      </div>
    </div>
  );
};