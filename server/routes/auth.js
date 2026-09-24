const express = require('express');
const router = express.Router();
const store = require('../store');

// Host Login
router.post('/host/login', (req, res) => {
  const { loginId, password } = req.body;
  const settings = store.getSettings();

  if (loginId === 'admin' && password === (settings.hostPassword || 'password123')) {
    return res.json({
      success: true,
      role: 'HOST',
      user: {
        id: 'host',
        name: 'Auction Controller / Host',
        role: 'HOST'
      }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid Host credentials' });
});

// Team Leader Login
router.post('/team/login', (req, res) => {
  const { loginId, password } = req.body;
  const team = store.getTeam(loginId);

  if (team && team.password === password) {
    return res.json({
      success: true,
      role: 'TEAM_LEADER',
      user: {
        id: team.id,
        teamId: team.id,
        name: team.name,
        owner: team.owner,
        loginId: team.loginId,
        color: team.color,
        role: 'TEAM_LEADER'
      }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid Team Login ID or Password' });
});

// Get public team list for easy login selector / switcher
router.get('/teams-list', (req, res) => {
  const teams = store.getTeams().map(t => ({
    id: t.id,
    name: t.name,
    owner: t.owner,
    loginId: t.loginId,
    color: t.color
  }));
  res.json({ success: true, teams });
});

module.exports = router;
