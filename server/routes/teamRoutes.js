
const express = require('express'); 
const jwtverify = require('../middleware/jwtverify');
const router = express.Router();
const {getUserTeams,deleteMemberFromTeam,addMemberToTeam,createTeam,updateTeamMembers} = require('../controllers/teamController');
router.post('/createTeam', jwtverify, createTeam);
router.get('/getTeams', jwtverify, getUserTeams);
router.put('/:teamId/members', jwtverify, updateTeamMembers);
router.post('/:teamId/addMember', jwtverify, addMemberToTeam); 
router.delete('/:teamId/member/:memberId',jwtverify, deleteMemberFromTeam);
module.exports = router;