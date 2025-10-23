import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { CircleQuestionMarkIcon, ShieldQuestion, X } from 'lucide-react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

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

export const CreateTeamPopup = ({ isOpen, onClose, teams, setTeam }) => {
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    description: '',
    webDataId: ''
  });
  
  const [memberEmails, setMemberEmails] = useState('');
  const [mail, setMail] = useState('');
  const [webUrls, setWebUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get user data and web URLs on mount
  useEffect(() => {
    const userDataString = localStorage.getItem('UserData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setWebUrls(userData.webURl || []);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const createTeam = async () => {
    
    setIsLoading(true);


    // Generate temp ID once
    const tempId = 'temp-' + Date.now();

    try {
      // Get current user data
      const userDataString = localStorage.getItem('UserData');
 
      if (!userDataString) {
        alert('User data not found in localStorage');
        setIsLoading(false);
        return;
      }
      
      const userData = JSON.parse(userDataString);

      const currentUser = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        mail:userData.mail,
        profile: userData.profile
      };
      console.log('5. Created currentUser:', currentUser);

      // Create temporary team object for optimistic update
      const tempTeam = {
        teamId: tempId,
        teamName: newTeamData.name,
        description: newTeamData.description,
        createdAt: new Date().toISOString(),
        yourRole: 'owner',
        webData: {
          id: newTeamData.webDataId,
          url: newTeamData.webDataId
        },
        members: [{ 
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          profile: currentUser.profile,
          role: 'owner'
        }],
        totalMembers: 1,
        isOptimistic: true
      };
      console.log('6. Created tempTeam:', tempTeam);

      // Ensure teams is always an array before spreading
      console.log('7. Current teams:', teams);
      setTeam([tempTeam, ...(Array.isArray(teams) ? teams : [])]);
      console.log('9. setTeam called successfully - optimistic update done');

      // Prepare API payload
      const payload = {
        name: newTeamData.name,
        webDataId: newTeamData.webDataId,
        description: newTeamData.description,
        mail:newTeamData.mail,
        memberEmails: memberEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email)
      };

      console.log('10. Prepared payload:', payload);
      console.log('11. API URL:', `${apiUrl}/api/team/createTeam`);
      console.log('12. About to make axios POST request...');
      
      // CORRECT API CALL: payload as 2nd param, config as 3rd param
      const response = await axios.post(
        `${apiUrl}/api/team/createTeam`,
        payload,  // <-- Request body data
        { 
          withCredentials: true,  // <-- Config options
          timeout: 10000
        }
      );
      
      console.log('13. Got response:', response);
      console.log('13a. Response data:', response.data);
      
      // Replace temp team with real data from server
      console.log('14. Replacing temp team with real data');
      setTeam(prevTeams =>
        (Array.isArray(prevTeams) ? prevTeams : []).map(t =>
          t.teamId === tempId ? response.data.team : t
        )
      );

      // Reset form
      console.log('15. Resetting form');
      setNewTeamData({ name: '', description: '', webDataId: '' });
      setMemberEmails('');
      
      console.log('16. Team created successfully!');
      
      // Close modal only after successful creation
      console.log('17. Closing modal');
      onClose();
      
    } catch (error) {
      console.error('ERROR:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      // Remove temp team on error
      console.log('18. Removing temp team due to error');
      setTeam(prevTeams =>
        (Array.isArray(prevTeams) ? prevTeams : []).filter(t => t.teamId !== tempId)
      );
      
      alert(error.response?.data?.message || 'Failed to create team. Please try again.');
    } finally {
      console.log('19. Finally block - setting loading to false');
      setIsLoading(false);
    }
    
    console.log('=== END createTeam ===');
  };

  const handleClose = () => {
    if (!isLoading) {
      setNewTeamData({ name: '', description: '', webDataId: '' });
      setMemberEmails('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Team</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form action="">
          <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required={1}
              value={newTeamData.name}
              onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-primary2 rounded-md"
              placeholder="Enter team name"
              onKeyPress={(e) => e.key === 'Enter' && createTeam()}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
            required={true}
              value={newTeamData.description}
              onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-primary2 rounded-md resize-none"
              placeholder="Brief description of the team's purpose"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website <span className="text-red-500">*</span>
            </label>
            <Select
              required={true}
              options={webUrls.map((u) => ({ value: u, label: u }))}
              value={webUrls.find((u) => u === newTeamData.webDataId) ? { value: newTeamData.webDataId, label: newTeamData.webDataId } : null}
              onChange={(option) => setNewTeamData({ ...newTeamData, webDataId: option ? option.value : '' })}
              placeholder="Select a website"
              className="text-sm"
              styles={SELECT_STYLES}
              isDisabled={isLoading}
            />
          </div>

          <div>
            <label className="flex gap-2 items-center  group text-sm font-medium text-gray-700 mb-2 relative ">
              Mail
              <CircleQuestionMarkIcon  size={15}/>
              <p className='group-hover:flex hidden absolute left-[70px] text-white bg-zinc-600 p-1 text-xs rounded-sm'>mail address where to send reports</p>
            </label>
            
            <input
            required={true}
              type="mail"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-primary2 rounded-md"
              placeholder="email1@example.com"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Members (Optional)
            </label>
            <input
              type="text"
              required={true}
              value={memberEmails}
              onChange={(e) => setMemberEmails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-primary2 rounded-md"
              placeholder="email1@example.com, email2@example.com"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple emails with commas
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              onClick={() => {
                console.log('Create Team Button clicked!');
                createTeam();
              }}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};