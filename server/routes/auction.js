const express = require('express');
const router = express.Router();
const store = require('../store');

// GET current auction state
router.get('/state', (req, res) => {
  const state = store.getAuctionState();
  res.json({ success: true, state });
});

// GET dashboard statistics
router.get('/dashboard', (req, res) => {
  const stats = store.getDashboardStats();
  res.json({ success: true, stats });
});

// GET auction history
router.get('/history', (req, res) => {
  const history = store.getHistory();
  res.json({ success: true, history });
});

// GET auction history as downloadable CSV
router.get('/history/export', (req, res) => {
  const history = store.getHistory();
  const headers = ['Player ID', 'Player Name', 'Category', 'Base Price (₹)', 'Final Price (₹)', 'Sold To Team', 'Status', 'Timestamp'];
  const rows = history.map(h => [
    `"${h.playerId || ''}"`,
    `"${h.playerName || ''}"`,
    `"${h.category || ''}"`,
    h.basePrice || 0,
    h.finalPrice || '-',
    `"${h.teamName || '-'}"`,
    `"${h.status || ''}"`,
    `"${h.timestamp || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=auction_history_${Date.now()}.csv`);
  res.send(csvContent);
});

// GET system settings
router.get('/settings', (req, res) => {
  const settings = store.getSettings();
  res.json({ success: true, settings });
});

// POST update settings
router.post('/settings', (req, res) => {
  const updated = store.updateSettings(req.body);
  const io = req.app.get('io');
  if (io) {
    io.emit('settings:updated', { settings: updated });
    io.emit('auction:state_changed', {
      auction: store.getAuctionState(),
      stats: store.getDashboardStats()
    });
  }
  res.json({ success: true, settings: updated });
});

// POST reset auction data / restore defaults
router.post('/reset', (req, res) => {
  store.resetToDefaults();
  const io = req.app.get('io');
  if (io) {
    io.emit('auction:sync', {
      auction: store.getAuctionState(),
      stats: store.getDashboardStats(),
      teams: store.getTeams()
    });
  }
  res.json({ success: true, message: 'Auction tournament reset to initial default state' });
});

module.exports = router;
