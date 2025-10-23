import React, { useState } from 'react';
import { RoleSelect } from './roleSelect';

export const AddMemberForm = ({ onAddMember, onCancel }) => {
  const [memberData, setMemberData] = useState({
    name: '',
    email: '',
    role: 'viewer'
  });

  const handleSubmit = () => {
    if (memberData.name.trim() && memberData.email.trim()) {
      onAddMember(memberData);
      setMemberData({ name: '', email: '', role: 'viewer' });
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Member</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          value={memberData.name}
          onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Full Name"
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <input
          type="email"
          value={memberData.email}
          onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Email Address"
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <RoleSelect
          value={memberData.role}
          onChange={(role) => setMemberData({ ...memberData, role })}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Add Member
        </button>
      </div>
    </div>
  );
};