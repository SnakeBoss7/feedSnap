import React, { useState } from 'react';
import { Crown, Edit, Eye, ChevronDown } from 'lucide-react';

// Role configuration
const roleOptions = [
  { value: 'owner', label: 'Owner', icon: Crown, color: 'text-yellow-600' },
  { value: 'editor', label: 'Editor', icon: Edit, color: 'text-blue-600' },
  { value: 'viewer', label: 'Viewer', icon: Eye, color: 'text-gray-600' }
];

export const RoleSelect = ({ value, onChange, disabled = false, shouldDropUp = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedRole = roleOptions.find(role => role.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg
          ${disabled 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
            : 'bg-white cursor-pointer'
          }
          ${isOpen ? 'border-blue-500' : 'border-gray-300'}
        `}
      >
        <div className="flex items-center gap-2">
          <selectedRole.icon className={`h-4 w-4 ${selectedRole.color}`} />
          <span>{selectedRole.label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className={`absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg ${shouldDropUp ? 'bottom-full mb-1' : ''}`}>
          {roleOptions.map((role) => (
            <button
              key={role.value}
              onClick={() => {
                onChange(role.value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                ${value === role.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                first:rounded-t-lg last:rounded-b-lg
              `}
            >
              <role.icon className={`h-4 w-4 ${role.color}`} />
              <span>{role.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};