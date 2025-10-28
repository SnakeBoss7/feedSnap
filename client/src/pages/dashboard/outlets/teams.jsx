import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/PageComponents/teams/header';
import { StatsGrid } from '../../../components/PageComponents/teams/statsGrid';
import { TeamCard } from '../../../components/PageComponents/teams//teamCard';
import { CreateTeamPopup } from '../../../components/PageComponents/teams/createTeam';
import { TeamManagementPopup } from '../../../components/PageComponents/teams/teamPopUp';
import { Background } from '../../../components/background/background';
import { SimpleHeader } from '../../../components/header/header';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL;
export const TeamsOverview = () => {
  const [teamData, setTeamData] = useState([]);
  useEffect(()=>
  {
    const fetchTeams = async () => {
      try {
      const res = await axios.get(`${apiUrl}/api/team/getTeams`, { withCredentials: true });
      console.log('Fetched teams:', res.data.teams);
      setTeamData(res.data.teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }

    }
    fetchTeams();
  },[])
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isManagePopupOpen, setIsManagePopupOpen] = useState(false);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);

  const handleManageTeam = (team) => {
    setSelectedTeam(team);
    setIsManagePopupOpen(true);
  };

  const handleCreateTeam = async (teamData) => {
    try {
      // Backend call for creating team
      const response = await axios.post(`${apiUrl}/api/team/createTeam`, teamData, { withCredentials: true });
      if (response.ok) {
        const newTeam = await response.json();
        console.log('Team created successfully:', newTeam);
        // Refresh teams list or update state
      } else {
        console.error('Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleSaveTeamChanges = async (teamId, updatedMembers) => {
    try {
      // Backend call for updating team members
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members: updatedMembers }),
      });
      
      if (response.ok) {
        console.log('Team changes saved successfully');
        // Update local state or refresh data
      } else {
        console.error('Failed to save team changes');
      }
    } catch (error) {
      console.error('Error saving team changes:', error);
    }
  };

  const handleAddMember = async (teamId, memberData) => {
    try {
      // Backend call for adding member to team
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });
      
      if (response.ok) {
        const newMember = await response.json();
        console.log('Member added successfully:', newMember);
        // Update local state
      } else {
        console.error('Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const closeManagePopup = () => {
    setIsManagePopupOpen(false);
    setSelectedTeam(null);
  };

  return (
    <div className="h-full w-full overflow-y-auto  font-sans scrollbar-hide">
      <Background color={'#085730ff'}/>
      <SimpleHeader color={'#139152ff'}/>
      <div className=" md:px-10 px-5 py-8">
        <Header onCreateTeam={() => setIsCreatePopupOpen(true)} />
        <StatsGrid teams={teamData} />
        
        <div className="rounded-lg shadow-sm ">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teamData.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onManage={handleManageTeam}
              />
            ))}
          </div>
        </div>
      </div>

      <CreateTeamPopup
      teams={teamData}
      setTeam={setTeamData}
        isOpen={isCreatePopupOpen}
        onClose={() => setIsCreatePopupOpen(false)}
        onCreateTeam={handleCreateTeam}
      />

      <TeamManagementPopup
        team={selectedTeam}
        isOpen={isManagePopupOpen}
        onClose={closeManagePopup}
        onSaveChanges={handleSaveTeamChanges}
        onAddMember={handleAddMember}
      />
    </div>
  );
};