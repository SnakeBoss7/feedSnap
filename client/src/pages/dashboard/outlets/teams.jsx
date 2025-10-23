import React, { useState } from 'react';
import { Header } from '../../../components/PageComponents/teams/header';
import { StatsGrid } from '../../../components/PageComponents/teams/statsGrid';
import { TeamCard } from '../../../components/PageComponents/teams//teamCard';
import { CreateTeamPopup } from '../../../components/PageComponents/teams/createTeam';
import { TeamManagementPopup } from '../../../components/PageComponents/teams/teamPopUp';
import { Background } from '../../../components/background/background';
import { SimpleHeader } from '../../../components/header/header';

// Sample data
const mockTeams = [
  {
    id: 1,
    name: "Frontend Development",
    description: "Building amazing user interfaces",
    memberCount: 8,
    createdAt: "2024-01-15",
    members: [
      { id: 1, name: "John Doe", email: "john@company.com", role: "owner" },
      { id: 2, name: "Jane Smith", email: "jane@company.com", role: "editor" },
      { id: 3, name: "Mike Johnson", email: "mike@company.com", role: "viewer" },
      { id: 4, name: "Sarah Wilson", email: "sarah@company.com", role: "editor" },
      { id: 5, name: "Tom Brown", email: "tom@company.com", role: "viewer" },
    ],
  },
  {
    id: 2,
    name: "Backend Development",
    description: "Server-side architecture and APIs",
    memberCount: 6,
    createdAt: "2024-01-10",
    members: [
      { id: 4, name: "Sarah Wilson", email: "sarah@company.com", role: "owner" },
      { id: 5, name: "Tom Brown", email: "tom@company.com", role: "editor" },
      { id: 6, name: "Lisa Davis", email: "lisa@company.com", role: "editor" },
    ],
  },
];

// Main Component
export const TeamsOverview = () => {
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
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      
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
    <div className="h-full w-full overflow-y-auto  font-sans">
      <Background color={'#5BAE83'}/>
      <SimpleHeader color={'#5BAE83'}/>
      <div className=" md:px-10 px-5 py-8">
        <Header onCreateTeam={() => setIsCreatePopupOpen(true)} />
        <StatsGrid teams={mockTeams} />
        
        <div className="rounded-lg shadow-sm ">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockTeams.map((team) => (
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