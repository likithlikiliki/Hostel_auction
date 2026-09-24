const express = require('express');
const router = express.Router();
const store = require('../store');

// GET all teams
router.get('/', (req, res) => {
  const teams = store.getTeams();
  res.json({ success: true, teams });
});

// GET single team with full squad details
router.get('/:id', (req, res) => {
  const team = store.getTeam(req.params.id);
  if (!team) {
    return res.status(404).json({ success: false, message: 'Team not found' });
  }
  res.json({ success: true, team });
});

// CREATE new team (Host only)
router.post('/', (req, res) => {
  try {
    const { name, owner, loginId, password, color, totalBudget } = req.body;
    const createdTeam = store.createTeam({ name, owner, loginId, password, color, totalBudget });
    
    // Broadcast team change if io attached to app
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('teams:changed', { teams: store.getTeams(), stats: store.getDashboardStats() });
    }

    res.status(201).json({ success: true, team: createdTeam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE team details (Host only)
router.put('/:id', (req, res) => {
  try {
    const updatedTeam = store.updateTeam(req.params.id, req.body);
    if (!updatedTeam) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('teams:changed', { teams: store.getTeams(), stats: store.getDashboardStats(), auction: store.getAuctionState() });
    }

    res.json({ success: true, team: updatedTeam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE team (Host only - only allowed if team has 0 players)
router.delete('/:id', (req, res) => {
  try {
    store.deleteTeam(req.params.id);

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('teams:changed', { teams: store.getTeams(), stats: store.getDashboardStats(), auction: store.getAuctionState() });
    }

    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST load optional demo data. This is never called automatically.
router.post('/sample/load', (req, res) => {
  try {
    const demoData = store.loadDemoData();

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('teams:changed', {
        teams: store.getTeams(),
        stats: store.getDashboardStats(),
        auction: store.getAuctionState()
      });
    }

    res.json({
      success: true,
      message: 'Demo data loaded successfully',
      teams: demoData.teams,
      players: demoData.players
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET team validation summary (Min 8 / Max 10 players status)
router.get('/validation/summary', (req, res) => {
  const teams = store.getTeams();
  const settings = store.getSettings();
  const minRequired = settings.minTeamPlayers || 8;
  const maxAllowed = settings.maxTeamPlayers || 10;

  const validation = teams.map(team => {
    const count = team.players ? team.players.length : 0;
    const isValid = count >= minRequired && count <= maxAllowed;
    const isFull = count >= maxAllowed;
    const isUnderMin = count < minRequired;

    let status = 'Valid';
    if (isUnderMin) status = `Incomplete (${count}/${minRequired} min)`;
    else if (isFull) status = `Full (${count}/${maxAllowed})`;
    else status = `Complete (${count}/${maxAllowed})`;

    return {
      id: team.id,
      name: team.name,
      owner: team.owner,
      playerCount: count,
      minRequired,
      maxAllowed,
      slotsRemaining: Math.max(0, maxAllowed - count),
      totalSpent: team.totalSpent || 0,
      remainingPurse: (team.totalBudget || 1000000000) - (team.totalSpent || 0),
      isValid,
      isFull,
      isUnderMin,
      statusBadge: isValid ? 'VALID' : 'WARNING'
    };
  });

  const allCompliant = validation.length >= 2 && validation.every(v => v.isValid);
  res.json({ success: true, validation, allCompliant, minRequired, maxAllowed, totalTeams: teams.length });
});

module.exports = router;
