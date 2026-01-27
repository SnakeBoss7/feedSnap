const Team = require('../models/teamSchema');
const User = require('../models/user');
const WebData = require('../models/WebData');

// Create Team (existing function - for reference)
// Create Team
const createTeam = async (req, res) => {
  console.log('=== CREATE TEAM BACKEND ===');
  try {
    const { name, description, memberEmails, mail, webDataId } = req.body;
    const userId = req.user.id;

    // Validate webDataId is provided
    if (!webDataId) {
      return res.status(400).json({
        success: false,
        message: 'Website selection is required'
      });
    }

    // Verify the website exists and user has access to it
    const website = await WebData.findById(webDataId);
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Selected website not found'
      });
    }

    // Check if user is owner of the website
    const isOwner = website.owner.some(ownerId => ownerId.toString() === userId);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create a team for this website'
      });
    }

    // Initial members array with owner
    const members = [{ user: userId, role: "owner" }];

    // Handle initial member invites
    if (memberEmails && Array.isArray(memberEmails) && memberEmails.length > 0) {
      const users = await User.find({ email: { $in: memberEmails } });
      users.forEach(user => {
        if (user._id.toString() !== userId) {
          members.push({ user: user._id, role: "viewer" });
        }
      });
    }

    const team = new Team({
      name,
      description,
      mail,
      members,
      webData: webDataId
    });

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name email profile')
      .populate('webData', 'webUrl color position');

    const formattedTeam = {
      teamId: populatedTeam._id,
      teamName: populatedTeam.name,
      description: populatedTeam.description,
      createdAt: populatedTeam.createdAt,
      yourRole: 'owner',
      webData: populatedTeam.webData ? {
        id: populatedTeam.webData._id,
        url: populatedTeam.webData.webUrl,
        color: populatedTeam.webData.color,
        position: populatedTeam.webData.position
      } : null,
      members: populatedTeam.members.map(m => ({
        userId: m.user._id,
        name: m.user.name,
        email: m.user.email,
        profile: m.user.profile,
        role: m.role
      })),
      totalMembers: populatedTeam.members.length
    };

    res.status(201).json({
      success: true,
      team: formattedTeam
    });

  } catch (error) {
    console.error('ERROR in createTeam:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Team
const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Only owner can delete team
    const userMember = team.members.find(m => m.user.toString() === userId);
    if (!userMember || userMember.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Only the team owner can delete the team' });
    }

    await Team.findByIdAndDelete(teamId);

    res.status(200).json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Team Members - Save Changes
const updateTeamMembers = async (req, res) => {
  console.log('=== UPDATE TEAM MEMBERS ===');
  console.log('Request body:', req.body);
  console.log('Team ID from params:', req.params.teamId);

  try {
    const { teamId } = req.params;
    const { members } = req.body; // Array of { userId, role }
    const userId = req.user.id;

    console.log('User ID:', userId);
    console.log('Members to update:', members);

    // Find the team
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is owner or editor
    const userMember = team.members.find(m => m.user.toString() === userId);
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update team members'
      });
    }

    // Update members array
    team.members = members.map(m => ({
      user: m.userId,
      role: m.role
    }));

    await team.save();
    console.log('Team members updated successfully');

    // Populate and return updated team
    const populatedTeam = await Team.findById(team._id)
      .populate('webData', 'webUrl color position')
      .populate('members.user', 'name email profile');

    const formattedTeam = {
      teamId: populatedTeam._id,
      teamName: populatedTeam.name,
      motive: populatedTeam.motive,
      createdAt: populatedTeam.createdAt,
      yourRole: userMember.role,
      webData: {
        id: populatedTeam.webData._id,
        url: populatedTeam.webData.webUrl,
        color: populatedTeam.webData.color,
        position: populatedTeam.webData.position
      },
      members: populatedTeam.members.map(m => ({
        userId: m.user._id,
        name: m.user.name,
        email: m.user.email,
        profile: m.user.profile,
        role: m.role
      })),
      totalMembers: populatedTeam.members.length
    };

    res.status(200).json({
      success: true,
      team: formattedTeam,
      message: 'Team members updated successfully'
    });

  } catch (error) {
    console.error('ERROR in updateTeamMembers:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add Member to Team
const addMemberToTeam = async (req, res) => {
  console.log('=== ADD MEMBER TO TEAM ===');
  console.log('Request body:', req.body);
  console.log('Team ID from params:', req.params.teamId);

  try {
    const { teamId } = req.params;
    const { email, role = 'viewer' } = req.body;
    const userId = req.user.id;

    console.log('User ID:', userId);
    console.log('Adding member with email:', email, 'and role:', role);

    // Find the team
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user has permission to add members
    const userMember = team.members.find(m => m.user.toString() === userId);
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add members'
      });
    }

    // Find the user to add by email
    const userToAdd = await User.findOne({ email: email.trim().toLowerCase() });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found. Please ask them to sign up first.'
      });
    }

    // Check if user is already a member
    const isAlreadyMember = team.members.some(
      m => m.user.toString() === userToAdd._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team'
      });
    }

    // Add new member
    team.members.push({
      user: userToAdd._id,
      role: role
    });

    await team.save();
    console.log('Member added successfully');

    // Return the newly added member info
    const newMember = {
      userId: userToAdd._id,
      name: userToAdd.name,
      email: userToAdd.email,
      profile: userToAdd.profile,
      role: role
    };

    res.status(200).json({
      success: true,
      member: newMember,
      message: 'Member added successfully',
      totalMembers: team.members.length
    });

  } catch (error) {
    console.error('ERROR in addMemberToTeam:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Team Details
// Get All Teams for Logged-in User
const getUserTeams = async (req, res) => {
  console.log('=== GET USER TEAMS ===');
  try {
    const userId = req.user.id;

    const teams = await Team.find({ 'members.user': userId })
      .populate('webData', 'webUrl color position')
      .populate('members.user', 'name email profile')
      .sort({ createdAt: -1 });

    if (!teams || teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No teams found'
      });
    }

    const formattedTeams = teams.map(team => ({
      teamId: team._id,
      teamName: team.name,
      description: team.description,
      mail: team.mail,
      createdAt: team.createdAt,
      webData: {
        id: team.webData?._id,
        url: team.webData?.webUrl,
        color: team.webData?.color,
        position: team.webData?.position
      },
      members: team.members.map(m => ({
        userId: m.user._id,
        name: m.user.name,
        email: m.user.email,
        profile: m.user.profile,
        role: m.role
      })),
      totalMembers: team.members.length,
      yourRole: team.members.find(m => m.user._id.toString() === userId)?.role
    }));
    console.log(formattedTeams)

    res.status(200).json({
      success: true,
      teams: formattedTeams
    });

  } catch (error) {
    console.error('ERROR in getUserTeams:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Delete Member from Team
const deleteMemberFromTeam = async (req, res) => {
  console.log('=== DELETE MEMBER FROM TEAM ===');
  console.log('Request params:', req.params);
  console.log('Authenticated user:', req.user);

  try {
    const { teamId, memberId } = req.params;
    const userId = req.user._id || req.user.id;

    console.log('Current User ID:', userId);
    console.log('Team ID:', teamId);
    console.log('Member ID to delete:', memberId);

    // Find the team and populate to get full member data
    const team = await Team.findById(teamId).populate('members.user', 'name email');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    console.log('Team members:', team.members);

    // Check if user has permission to delete members - compare as strings
    const userMember = team.members.find(m => {
      const mUserId = m.user._id.toString();
      const cUserId = userId.toString();
      console.log('Comparing:', mUserId, '===', cUserId);
      return mUserId === cUserId;
    });

    console.log('User member found:', userMember);

    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete team members'
      });
    }

    // Check if the member to delete exists in the team
    const memberToDelete = team.members.find(m => m.user._id.toString() === memberId);

    if (!memberToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in this team'
      });
    }

    console.log('Member to delete:', memberToDelete);

    // Prevent deletion of owner (only owner can delete other owners)
    if (memberToDelete.role === 'owner' && userMember.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete the team owner'
      });
    }

    // Remove the member
    team.members = team.members.filter(m => m.user._id.toString() !== memberId);

    await team.save();
    console.log('Member deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Member removed from team successfully',
      totalMembers: team.members.length
    });

  } catch (error) {
    console.error('ERROR in deleteMemberFromTeam:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Change Member Role
const changeMemberRole = async (req, res) => {
  console.log('=== CHANGE MEMBER ROLE ===');
  try {
    const { teamId, memberId } = req.params;
    const { role } = req.body; // 'admin', 'editor', 'viewer', 'owner'
    const userId = req.user.id;

    console.log(`User ${userId} changing role of ${memberId} to ${role} in team ${teamId}`);

    if (!['owner', 'admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check permissions
    const userMember = team.members.find(m => m.user.toString() === userId);
    if (!userMember || userMember.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the team owner can change member roles'
      });
    }

    // Find member to update
    const memberToUpdate = team.members.find(m => m.user.toString() === memberId);
    if (!memberToUpdate) {
      return res.status(404).json({ success: false, message: 'Member not found in team' });
    }

    // If changing to owner, transfer ownership
    if (role === 'owner') {
      // Current owner becomes admin
      userMember.role = 'admin';
      memberToUpdate.role = 'owner';
      console.log(`Ownership transferred from ${userId} to ${memberId}`);
    } else {
      // Regular role change
      memberToUpdate.role = role;
    }

    await team.save();

    console.log('Role updated successfully');

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      member: {
        userId: memberToUpdate.user,
        role: memberToUpdate.role
      }
    });

  } catch (error) {
    console.error('ERROR in changeMemberRole:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User's Accessible Websites
const getUserWebsites = async (req, res) => {
  console.log('=== GET USER WEBSITES ===');
  try {
    const userId = req.user.id;

    // Find websites where user is owner
    const websites = await WebData.find({
      owner: userId
    }).select('_id webUrl color position');

    const formattedWebsites = websites.map(web => ({
      id: web._id,
      url: web.webUrl,
      color: web.color,
      position: web.position
    }));

    res.status(200).json({
      success: true,
      websites: formattedWebsites
    });

  } catch (error) {
    console.error('ERROR in getUserWebsites:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createTeam,
  updateTeamMembers,
  addMemberToTeam,
  getUserTeams,
  deleteMemberFromTeam,
  changeMemberRole,
  deleteTeam,
  getUserWebsites
};