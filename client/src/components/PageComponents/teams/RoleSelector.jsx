import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LucideChevronDown, LucideCheck } from 'lucide-react';

const roles = [
  { value: 'admin', label: 'Admin', description: 'Manage team & members' },
  { value: 'editor', label: 'Editor', description: 'Edit team content' },
  { value: 'viewer', label: 'Viewer', description: 'View only access' }
];

export const RoleSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedRole = roles.find(r => r.value === value);

  // Calculate position synchronously before rendering dropdown
  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = roles.length * 56 + 8; // approx height per item + padding
    const dropdownWidth = 224;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;

    let left = rect.right - dropdownWidth;
    // Ensure dropdown doesn't go off-screen to the left
    if (left < 8) left = 8;

    return {
      top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
      left,
      openUpward
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      // Calculate position BEFORE opening so the dropdown never appears at 0,0
      const pos = calculatePosition();
      setPosition(pos);
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setPosition(null);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setPosition(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Recalculate on scroll/resize while open (e.g. scrolling modal content)
  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => {
      const pos = calculatePosition();
      if (pos) setPosition(pos);
    };
    window.addEventListener('resize', handleReposition);
    // Listen on capture phase so we catch scroll events from any container
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, calculatePosition]);

  const handleSelect = (roleValue) => {
    onChange(roleValue);
    setIsOpen(false);
    setPosition(null);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg pl-3 pr-2 py-2 text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-all min-w-[110px]"
      >
        <span className="flex-1 text-left">{selectedRole?.label || value}</span>
        <LucideChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && position && (
        <div
          ref={dropdownRef}
          className="fixed w-56 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-2xl py-1 border border-gray-200 dark:border-dark-border-subtle"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999
          }}
        >
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => handleSelect(role.value)}
              className="w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors flex items-start gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
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
          ))}
        </div>
      )}
    </>
  );
};
