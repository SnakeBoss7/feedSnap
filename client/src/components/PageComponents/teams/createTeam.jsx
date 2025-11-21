import React, { useState } from 'react';
import { LucideX, LucideLoader2, LucideUsers, LucidePlus, LucideMinus } from 'lucide-react';

export const CreateTeamPopup = ({ isOpen, onClose, onCreateTeam }) => {
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleEmailChange = (index, value) => {
    const newEmails = [...memberEmails];
    newEmails[index] = value;
    setMemberEmails(newEmails);
  };

  const addEmailField = () => {
    setMemberEmails([...memberEmails, '']);
  };

  const removeEmailField = (index) => {
    const newEmails = memberEmails.filter((_, i) => i !== index);
    setMemberEmails(newEmails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Team name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const validEmails = memberEmails.filter(email => email.trim() !== '');
      
      await onCreateTeam({
        name,
        mail,
        description,
        memberEmails: validEmails
      });
      
      setName('');
      setMail('');
      setDescription('');
      setMemberEmails(['']);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-bg-secondary w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary2/10 rounded-lg flex items-center justify-center">
              <LucideUsers size={20} className="text-primary2" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Create Team</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-hover rounded-lg transition-colors text-gray-500 dark:text-dark-text-secondary">
            <LucideX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 pb-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-dark-text-primary mb-2">Team Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering, Marketing"
              className="w-full bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-primary2/40 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-dark-text-primary mb-2">Team Email</label>
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="team@company.com (optional)"
              className="w-full bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-primary2/40 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-dark-text-primary mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this team for? (optional)"
              rows={3}
              className="w-full bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-primary2/40 outline-none resize-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-dark-text-primary">Invite Members</label>
              <button
                type="button"
                onClick={addEmailField}
                className="text-sm font-medium text-primary2 hover:text-green-600 flex items-center gap-1 transition-colors"
              >
                <LucidePlus size={16} />
                Add
              </button>
            </div>
            
            <div className="space-y-2">
              {memberEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder="colleague@company.com"
                    className="flex-1 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-primary2/40 outline-none transition-all"
                  />
                  {memberEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailField(index)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LucideMinus size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary2 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <LucideLoader2 size={16} className="animate-spin" />}
            Create Team
          </button>
        </div>
      </div>
    </div>
  );
};