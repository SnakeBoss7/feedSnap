import React, { useState, useEffect } from 'react';
import { LucideX, LucideLoader2, LucidePlus, LucideMinus, LucideGlobe } from 'lucide-react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

export const CreateTeamPopup = ({ isOpen, onClose, onCreateTeam }) => {
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState(['']);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(false);
  const [error, setError] = useState('');

  // Fetch websites when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchWebsites();
    }
  }, [isOpen]);

  const fetchWebsites = async () => {
    try {
      setIsLoadingWebsites(true);
      const res = await axios.get(`${apiUrl}/api/team/websites`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setWebsites(res.data.websites || []);
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
      setError('Failed to load websites. Please try again.');
    } finally {
      setIsLoadingWebsites(false);
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.website-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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

    if (!selectedWebsite) {
      setError('Please select a website for this team');
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
        memberEmails: validEmails,
        webDataId: selectedWebsite
      });

      setName('');
      setMail('');
      setDescription('');
      setMemberEmails(['']);
      setSelectedWebsite('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };



  const selectedWebsiteData = websites.find(w => w.id === selectedWebsite);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-bg-secondary w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Create Team</h2>
              <p className="text-sm text-gray-500 dark:text-dark-text-muted mt-0.5">Set up a new team for collaboration</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-hover rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-dark-text-secondary"
            >
              <LucideX size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
          {/* Website Selection Custom UI */}
          <div className="website-dropdown-container relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-2 flex items-center justify-between">
              <span>Website Association</span>
              <span className="text-[10px] uppercase tracking-wider bg-primary2/10 text-primary2 px-2 py-0.5 rounded-full font-bold">Required</span>
            </label>

            {isLoadingWebsites ? (
              <div className="h-[52px] flex items-center gap-3 bg-gray-50 dark:bg-dark-bg-tertiary/50 rounded-xl px-4 animate-pulse border border-gray-100 dark:border-dark-border-subtle">
                <LucideLoader2 size={16} className="animate-spin text-primary2" />
                <span className="text-sm text-gray-400">Loading your websites...</span>
              </div>
            ) : websites.length === 0 ? (
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 text-sm text-orange-700 dark:text-orange-400 flex items-center gap-3">
                <LucideGlobe size={18} className="shrink-0" />
                <p>No websites found. Create one first to start a team.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Custom Trigger */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl text-sm transition-all border outline-none ${isDropdownOpen
                    ? 'border-primary2 ring-4 ring-primary2/10 shadow-sm'
                    : 'border-gray-200 dark:border-dark-border-subtle hover:border-primary2/50'
                    }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${selectedWebsite ? 'bg-primary2/10 text-primary2' : 'bg-gray-100 dark:bg-dark-bg-hover text-gray-400'}`}>
                      <LucideGlobe size={14} />
                    </div>
                    <span className={`truncate text-sm ${selectedWebsite ? 'text-gray-900 dark:text-dark-text-primary font-medium' : 'text-gray-500 dark:text-dark-text-muted'}`}>
                      {selectedWebsiteData ? selectedWebsiteData.url : 'Select website'}
                    </span>
                  </div>
                  <div className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>

                {/* Custom Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-[60] w-full mt-1.5 bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border-subtle rounded-lg shadow-lg overflow-hidden">


                    <div className="max-h-[200px] overflow-y-auto scrollbar-hide py-1">
                      {websites.length > 0 ? (
                        websites.map((website) => (
                          <button
                            key={website.id}
                            type="button"
                            onClick={() => {
                              setSelectedWebsite(website.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`group w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left ${selectedWebsite === website.id
                              ? 'bg-primary2/5 text-primary2'
                              : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-hover'
                              }`}
                          >
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${selectedWebsite === website.id ? 'bg-primary2/10' : 'bg-gray-100 dark:bg-dark-bg-tertiary'}`}>
                              <LucideGlobe size={13} />
                            </div>
                            <span className="flex-1 truncate text-sm font-medium">{website.url}</span>
                            {selectedWebsite === website.id && (
                              <svg className="w-4 h-4 text-primary2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-6 text-center">
                          <p className="text-xs text-gray-400">No websites found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
              Team Name <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering, Marketing"
              className="w-full bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-subtle rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-dark-text-primary placeholder:text-gray-400 focus:border-primary2 focus:ring-2 focus:ring-primary2/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">Team Email</label>
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="team@company.com (optional)"
              className="w-full bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-subtle rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-dark-text-primary placeholder:text-gray-400 focus:border-primary2 focus:ring-2 focus:ring-primary2/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this team for? (optional)"
              rows={3}
              className="w-full bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-subtle rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-dark-text-primary placeholder:text-gray-400 focus:border-primary2 focus:ring-2 focus:ring-primary2/20 outline-none resize-none transition-all"
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
        <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border-subtle flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-hover rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingWebsites || websites.length === 0}
            className="px-5 py-2 bg-primary2 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary2 shadow-sm"
          >
            {isSubmitting && <LucideLoader2 size={16} className="animate-spin" />}
            Create Team
          </button>
        </div>
      </div>
    </div>
  );
};