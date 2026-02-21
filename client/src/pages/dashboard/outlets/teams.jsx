import React, { useEffect, useState } from "react";
import { LucidePlus, LucideSearch, LucideUsers } from "lucide-react";
import axios from "axios";
import { TeamCard } from "../../../components/PageComponents/teams/teamCard";
import { CreateTeamPopup } from "../../../components/PageComponents/teams/createTeam";
import { TeamManagementPopup } from "../../../components/PageComponents/teams/teamPopUp";
import { SimpleHeader } from "../../../components/header/header";

const apiUrl = process.env.REACT_APP_API_URL;

export const TeamsOverview = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [manageTeam, setManageTeam] = useState(null);

  // Fetch Teams
  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${apiUrl}/api/team/getTeams`, {
        withCredentials: true,
      });
      console.log('Fetched teams:', res.data.teams);
      setTeams(res.data.teams || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Handlers
  const handleCreateTeam = async (teamData) => {
    const res = await axios.post(`${apiUrl}/api/team/createTeam`, teamData, {
      withCredentials: true,
    });
    if (res.data.success) {
      fetchTeams(); // Refresh list
    }
  };

  const handleAddMember = async (teamId, memberData) => {
    await axios.post(`${apiUrl}/api/team/${teamId}/addMember`, memberData, {
      withCredentials: true,
    });
    fetchTeams(); // Refresh to show new member
  };

  const handleRoleChange = async (teamId, memberId, newRole) => {
    // Optimistic update
    setTeams(prevTeams => prevTeams.map(team => {
      if (team.teamId === teamId) {
        const updatedMembers = team.members.map(member => {
          // If changing someone to owner, current owner becomes admin
          if (newRole === 'owner' && member.userId === memberId) {
            return { ...member, role: 'owner' };
          }
          if (newRole === 'owner' && member.role === 'owner') {
            return { ...member, role: 'admin' };
          }
          if (member.userId === memberId) {
            return { ...member, role: newRole };
          }
          return member;
        });
        return { ...team, members: updatedMembers };
      }
      return team;
    }));

    // Update manageTeam if it's currently open
    if (manageTeam && manageTeam.teamId === teamId) {
      setManageTeam(prev => ({
        ...prev,
        members: prev.members.map(member => {
          if (newRole === 'owner' && member.userId === memberId) {
            return { ...member, role: 'owner' };
          }
          if (newRole === 'owner' && member.role === 'owner') {
            return { ...member, role: 'admin' };
          }
          if (member.userId === memberId) {
            return { ...member, role: newRole };
          }
          return member;
        }),
        yourRole: newRole === 'owner' && manageTeam.yourRole === 'owner' ? 'admin' : manageTeam.yourRole
      }));
    }

    try {
      await axios.put(`${apiUrl}/api/team/${teamId}/member/${memberId}/role`, { role: newRole }, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Error changing role:', error);
      // Revert on error
      fetchTeams();
    }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    await axios.delete(`${apiUrl}/api/team/${teamId}/member/${memberId}`, {
      withCredentials: true,
    });
    fetchTeams();
  };

  const handleDeleteTeam = async (teamId) => {
    await axios.delete(`${apiUrl}/api/team/${teamId}`, {
      withCredentials: true,
    });
    fetchTeams();
    setManageTeam(null);
  };

  // Filtered Teams
  const filteredTeams = teams.filter(team =>
    team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-scroll scrollbar-hide dark:bg-dark-bg-primary font-sans transition-colors duration-300">
      <SimpleHeader color={"#5BAE83"} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary tracking-tight">Teams</h1>
            <p className="text-sm text-gray-500 dark:text-dark-text-muted mt-1">
              Manage your teams, members, and permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-dark-bg-secondary rounded-xl text-sm focus:ring-2 focus:ring-primary2/20 outline-none w-64 transition-all"
              />
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary2/70 hover:bg-primary2 text-white rounded-lg text-sm font-medium transition-all transform "
            >
              <LucidePlus size={18} />
              Create Team
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white dark:bg-dark-bg-secondary rounded-2xl animate-pulse border border-gray-100 dark:border-dark-border-subtle"></div>
            ))}
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.teamId}
                team={team}
                onManage={() => setManageTeam(team)}
              />
            ))}
            <div className="h-24 w-full" ></div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <LucideUsers size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">No teams found</h3>
            <p className="text-gray-500 dark:text-dark-text-muted mt-1 max-w-sm mx-auto">
              {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first team to collaborate with others."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 text-primary2 font-medium hover:underline"
              >
                Create a team now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTeamPopup
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTeam={handleCreateTeam}
      />

      {manageTeam && (
        <TeamManagementPopup
          team={manageTeam}
          isOpen={!!manageTeam}
          onClose={() => setManageTeam(null)}
          onAddMember={handleAddMember}
          onRoleChange={handleRoleChange}
          onRemoveMember={handleRemoveMember}
          onDeleteTeam={handleDeleteTeam}
        />
      )}

    </div>
  );
};
