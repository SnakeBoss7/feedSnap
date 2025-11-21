import React, { useState, useRef, useEffect } from 'react';
import { LucideChevronDown, LucideCheck, LucideCrown } from 'lucide-react';

const roles = [
  { value: 'owner', label: 'Owner', description: 'Full control & ownership', icon: LucideCrown },
  { value: 'admin', label: 'Admin', description: 'Manage team & members' },
  { value: 'editor', label: 'Editor', description: 'Edit team content' },
  { value: 'viewer', label: 'Viewer', description: 'View only access' }
];

export const RoleSelector = ({ value, onChange, isOwner = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, openUpward: false });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedRole = roles.find(r => r.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 200;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setDropdownPosition({
        top: openUpward ? rect.top - dropdownHeight : rect.bottom + 4,
        left: rect.right - 224,
        openUpward
      });
    }
  }, [isOpen]);

  const handleSelect = (roleValue) => {
    onChange(roleValue);
    setIsOpen(false);
  };

  // Filter out owner option if current user is not owner
  const availableRoles = isOwner ? roles : roles.filter(r => r.value !== 'owner');

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg pl-3 pr-2 py-2 text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-all min-w-[110px]"
      >
        <span className="flex-1 text-left">{selectedRole?.label}</span>
        <LucideChevronDown 
          size={14} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed w-56 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-2xl py-1 border border-gray-200 dark:border-dark-bg-secondary rounded-lg"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 9999
          }}
        >
          {availableRoles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.value}
                onClick={() => handleSelect(role.value)}
                className="w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors flex items-start gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon size={14} className="text-yellow-500" />}
                    <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      {role.label}
                    </span>
                    {role.value === value && (
                      <LucideCheck size={14} className="text-primary2 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-0.5">
                    {role.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};
