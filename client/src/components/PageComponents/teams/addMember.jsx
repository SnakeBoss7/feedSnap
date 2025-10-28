import React, { useState } from 'react';
import { X } from 'lucide-react';
import Select from 'react-select'; // Import default, not named
const SELECT_STYLES = {
  control: (base, state) => ({ 
    ...base, 
    padding: "2px",
    borderColor: state.isFocused ? "#00a252" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #00a252" : "none",
    "&:hover": {
      borderColor: "#00a252"
    }
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#00a252" : state.isFocused ? "#e6f7ef" : "#fff",
    color: state.isSelected ? "#fff" : "#000",
    "&:hover": { 
      backgroundColor: "#00a252",
      color: "#fff"
    },
  }),
};
// Define options for react-select
const roleOptions = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'owner', label: 'Owner' }
];
export const AddMemberForm = ({ onAddMember, onCancel, isLoading }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState({ value: 'viewer', label: 'Viewer' });


  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    // Pass the value from the selected option
    onAddMember({ email: email.trim(), role: role.value });
  };

  return (
    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h5 className="font-medium text-gray-900">Add New Member</h5>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="p-1 hover:bg-green-100 rounded disabled:opacity-50"
          type="button"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <Select
            value={role}
            onChange={setRole}
            styles={SELECT_STYLES}
            options={roleOptions}
            isDisabled={isLoading}
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <p className="text-xs text-gray-500 mt-1">
            Viewers can only view, Editors can edit, Owners have full control
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 text-sm py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </div>
  );
};