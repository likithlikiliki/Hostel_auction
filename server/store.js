const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Default 100 Cr = 1,00,00,00,000 (100 Crore INR)
const DEFAULT_PURSE = 1000000000;

// Optional demo data for the Host-controlled "Load Demo Data" action only.
const SAMPLE_TEAMS = [
  {
    name: 'Demo Team A',
    owner: 'Demo Owner A',
    loginId: 'demo-team-a',
    password: 'password123',
    color: '#3B82F6'
  },
  {
    name: 'Demo Team B',
    owner: 'Demo Owner B',
    loginId: 'demo-team-b',
    password: 'password123',
    color: '#8B5CF6'
  },
  {
    name: 'Demo Team C',
    owner: 'Demo Owner C',
    loginId: 'demo-team-c',
    password: 'password123',
    color: '#F59E0B'
  },
  {
    name: 'Demo Team D',
    owner: 'Demo Owner D',
    loginId: 'demo-team-d',
    password: 'password123',
    color: '#10B981'
  }
];

const SAMPLE_PLAYERS = [
  {
    id: 'P001',
    name: 'Rahul Kumar',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    category: 'Batsman',
    basePrice: 5000000, // 50 Lakh
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P002',
    name: 'Akash Patel',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    category: 'Bowler',
    basePrice: 3000000, // 30 Lakh
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P003',
    name: 'Manoj Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    category: 'All-Rounder',
    basePrice: 7500000, // 75 Lakh
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P004',
    name: 'Suresh Raina',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    category: 'Wicket Keeper',
    basePrice: 10000000, // 1 Cr
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P005',
    name: 'Vinay Kumar',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    category: 'Batsman',
    basePrice: 5000000, // 50 Lakh
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P006',
    name: 'Jasprit Bumrah',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    category: 'Bowler',
    basePrice: 20000000, // 2 Cr
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P007',
    name: 'Hardik Pandya',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    category: 'All-Rounder',
    basePrice: 20000000, // 2 Cr
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P008',
    name: 'Rishabh Pant',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    category: 'Wicket Keeper',
    basePrice: 15000000, // 1.5 Cr
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P009',
    name: 'Rohit Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    category: 'Batsman',
    basePrice: 20000000, // 2 Cr
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P010',
    name: 'Mohammed Shami',
    photoUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400&auto=format&fit=crop&q=80',
    category: 'Bowler',
    basePrice: 15000000, // 1.5 Cr
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P011',
    name: 'Ravindra Jadeja',
    photoUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&auto=format&fit=crop&q=80',
    category: 'All-Rounder',
    basePrice: 20000000, // 2 Cr
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  },
  {
    id: 'P012',
    name: 'Sanju Samson',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    category: 'Wicket Keeper',
    basePrice: 10000000, // 1 Cr
    status: 'Available',
    soldTo: null,
    soldPrice: null,
    soldTeamName: null
  }
];

const INITIAL_TEAMS = [];
const INITIAL_PLAYERS = [];

const INITIAL_SETTINGS = {
  defaultTeamBudget: DEFAULT_PURSE, // 100 Cr
  bidIncrement: 2000000, // 20 Lakh
  minTeamPlayers: 8,
  maxTeamPlayers: 10,
  biddingTimeSeconds: 10, // Default 10 seconds
  hostPassword: 'password123'
};

const INITIAL_AUCTION = {
  status: 'WAITING', // WAITING, PLAYER_SELECTED, BIDDING, PAUSED, TIME_ENDED, SOLD, UNSOLD
  currentPlayerId: null,
  currentBid: 0,
  highestBidderTeamId: null,
  highestBidderTeamName: null,
  bidIncrement: 2000000,
  pendingBids: [],
  biddingHistory: [],
  biddingStartedAt: null,
  biddingEndsAt: null,
  pausedRemainingMs: null,
  timerDurationSeconds: 10,
  logs: []
};

class Store {
  constructor() {
    this.data = {
      teams: [], // Dynamic teams array (NOT hardcoded)
      players: [],
      auction: { ...INITIAL_AUCTION },
      settings: { ...INITIAL_SETTINGS },
      history: []
    };
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        if (!this.data.settings) this.data.settings = { ...INITIAL_SETTINGS };
        if (!this.data.settings.defaultTeamBudget) this.data.settings.defaultTeamBudget = DEFAULT_PURSE;
        if (!this.data.settings.biddingTimeSeconds) this.data.settings.biddingTimeSeconds = 10;
        if (!this.data.auction) this.data.auction = { ...INITIAL_AUCTION };
        if (!this.data.auction.logs) this.data.auction.logs = [];
        if (!this.data.history) this.data.history = [];
        if (!this.data.teams) this.data.teams = [];
        if (!this.data.players) this.data.players = [];
      } catch (err) {
        console.error('Error loading store.json, re-initializing empty:', err);
        this.resetToDefaults();
      }
    } else {
      this.resetToDefaults();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist store.json:', err);
    }
  }

  resetToDefaults() {
    this.data = {
      teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
      players: JSON.parse(JSON.stringify(INITIAL_PLAYERS)),
      auction: JSON.parse(JSON.stringify(INITIAL_AUCTION)),
      settings: JSON.parse(JSON.stringify(INITIAL_SETTINGS)),
      history: []
    };
    this.save();
  }

  loadDemoData() {
    const defaultBudget = this.data.settings.defaultTeamBudget || DEFAULT_PURSE;
    SAMPLE_TEAMS.forEach((st) => {
      // Only add if loginId doesn't exist
      if (!this.getTeam(st.loginId)) {
        this.createTeam({
          name: st.name,
          owner: st.owner,
          loginId: st.loginId,
          password: st.password,
          color: st.color,
          totalBudget: defaultBudget
        });
      }
    });

    const addedPlayers = [];
    SAMPLE_PLAYERS.forEach((player) => {
      if (!this.getPlayer(player.id)) {
        const demoPlayer = JSON.parse(JSON.stringify(player));
        this.data.players.push(demoPlayer);
        addedPlayers.push(demoPlayer);
      }
    });

    this.save();
    return {
      teams: this.getTeams(),
      players: this.getPlayers(),
      addedPlayers
    };
  }

  // --- TEAMS (FULLY DYNAMIC) ---
  getTeams() {
    return (this.data.teams || []).map(t => ({
      ...t,
      totalBudget: t.totalBudget || this.data.settings.defaultTeamBudget || DEFAULT_PURSE,
      remainingPurse: (t.totalBudget || this.data.settings.defaultTeamBudget || DEFAULT_PURSE) - (t.totalSpent || 0)
    }));
  }

  getTeam(idOrLoginId) {
    if (!idOrLoginId) return null;
    const query = String(idOrLoginId).toLowerCase();
    const t = this.data.teams.find(team => 
      team.id === idOrLoginId || 
      (team.loginId && team.loginId.toLowerCase() === query)
    );
    if (!t) return null;
    const totalBudget = t.totalBudget || this.data.settings.defaultTeamBudget || DEFAULT_PURSE;
    return {
      ...t,
      totalBudget,
      remainingPurse: totalBudget - (t.totalSpent || 0)
    };
  }

  createTeam(teamData) {
    const name = String(teamData.name || '').trim();
    const owner = String(teamData.owner || '').trim();
    const loginId = String(teamData.loginId || '').trim();
    const password = String(teamData.password || 'password123').trim();

    if (!name) throw new Error('Team Name is required');
    if (!owner) throw new Error('Team Leader / Owner Name is required');
    if (!loginId) throw new Error('Team Login ID is required');
    if (!password) throw new Error('Team Password is required');

    // Check duplicate login ID
    const existing = this.getTeam(loginId);
    if (existing) {
      throw new Error(`Login ID "${loginId}" is already taken by team "${existing.name}". Please choose a different Login ID.`);
    }

    // Generate unique automatic ID
    const uniqueId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const budget = Number(teamData.totalBudget) || this.data.settings.defaultTeamBudget || DEFAULT_PURSE;

    // Palette of vibrant colors for dynamic team accents
    const palette = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#06B6D4', '#EF4444', '#F97316'];
    const assignedColor = teamData.color || palette[this.data.teams.length % palette.length];

    const newTeam = {
      id: uniqueId,
      name,
      owner,
      loginId,
      password,
      players: [],
      playerCount: 0,
      totalSpent: 0,
      totalBudget: budget,
      maxPlayers: this.data.settings.maxTeamPlayers || 10,
      minPlayers: this.data.settings.minTeamPlayers || 8,
      color: assignedColor,
      createdAt: new Date().toISOString()
    };

    this.data.teams.push(newTeam);
    this.save();
    return this.getTeam(uniqueId);
  }

  updateTeam(id, updateData) {
    const index = this.data.teams.findIndex(t => t.id === id);
    if (index === -1) return null;

    const currentTeam = this.data.teams[index];

    // If loginId is changing, check uniqueness
    if (updateData.loginId && updateData.loginId !== currentTeam.loginId) {
      const duplicate = this.getTeam(updateData.loginId);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`Login ID "${updateData.loginId}" is already taken by another team.`);
      }
    }

    const oldName = currentTeam.name;
    const newName = updateData.name ? String(updateData.name).trim() : oldName;

    // Merge updates
    this.data.teams[index] = {
      ...currentTeam,
      ...updateData,
      name: newName,
      owner: updateData.owner ? String(updateData.owner).trim() : currentTeam.owner,
      loginId: updateData.loginId ? String(updateData.loginId).trim() : currentTeam.loginId,
      password: updateData.password ? String(updateData.password).trim() : currentTeam.password,
      totalBudget: Number(updateData.totalBudget) || currentTeam.totalBudget || DEFAULT_PURSE
    };

    // Cascade name update if name was modified
    if (newName !== oldName) {
      if (this.data.auction.highestBidderTeamId === id) {
        this.data.auction.highestBidderTeamName = newName;
      }
      this.data.auction.pendingBids.forEach(b => {
        if (b.teamId === id) b.teamName = newName;
      });
      this.data.auction.biddingHistory.forEach(b => {
        if (b.teamId === id) b.teamName = newName;
      });
      this.data.players.forEach(p => {
        if (p.soldTo === id) p.soldTeamName = newName;
      });
      this.data.history.forEach(h => {
        if (h.teamId === id) h.teamName = newName;
      });
    }

    this.save();
    return this.getTeam(id);
  }

  deleteTeam(id) {
    const index = this.data.teams.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Team not found');
    }

    const team = this.data.teams[index];
    if (team.players && team.players.length > 0) {
      throw new Error(`This team cannot be deleted because it already has ${team.players.length} purchased player(s).`);
    }

    // Clean auction references if any
    if (this.data.auction.highestBidderTeamId === id) {
      this.data.auction.highestBidderTeamId = null;
      this.data.auction.highestBidderTeamName = null;
    }
    this.data.auction.pendingBids = this.data.auction.pendingBids.filter(b => b.teamId !== id);

    this.data.teams.splice(index, 1);
    this.save();
    return true;
  }

  // --- PLAYERS ---
  getPlayers() {
    return this.data.players;
  }

  getPlayer(id) {
    return this.data.players.find(p => p.id === id);
  }

  createPlayer(playerData) {
    const newId = playerData.id || `P${String(this.data.players.length + 1).padStart(3, '0')}`;
    const newPlayer = {
      id: newId,
      name: playerData.name,
      photoUrl: playerData.photoUrl || '',
      category: playerData.category || 'Batsman',
      basePrice: Number(playerData.basePrice) || 5000000,
      status: playerData.status || 'Available',
      soldTo: null,
      soldPrice: null,
      soldTeamName: null
    };
    this.data.players.push(newPlayer);
    this.save();
    return newPlayer;
  }

  bulkAddPlayers(playersList) {
    const added = [];
    playersList.forEach((p, idx) => {
      let id = p.id || `P${String(this.data.players.length + 1).padStart(3, '0')}`;
      if (this.data.players.some(existing => existing.id === id)) {
        id = `P${String(Date.now() + idx).slice(-4)}`;
      }
      const player = {
        id,
        name: p.name || 'Unnamed Player',
        photoUrl: p.photoUrl || p.photo || '',
        category: p.category || 'Batsman',
        basePrice: Number(p.basePrice) || 5000000,
        status: 'Available',
        soldTo: null,
        soldPrice: null,
        soldTeamName: null
      };
      this.data.players.push(player);
      added.push(player);
    });
    this.save();
    return added;
  }

  updatePlayer(id, updateData) {
    const index = this.data.players.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.players[index] = { ...this.data.players[index], ...updateData };
    this.save();
    return this.data.players[index];
  }

  deletePlayer(id) {
    const index = this.data.players.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.players.splice(index, 1);
    this.save();
    return true;
  }

  // --- AUCTION STATE & CONTROLLER ---
  getAuctionState() {
    const currentPlayer = this.data.auction.currentPlayerId 
      ? this.getPlayer(this.data.auction.currentPlayerId) 
      : null;
    return {
      ...this.data.auction,
      currentPlayer,
      bidIncrement: this.data.settings.bidIncrement || 2000000,
      timerDurationSeconds: this.data.settings.biddingTimeSeconds || 10,
      logs: this.data.auction.logs || [],
      serverTime: Date.now()
    };
  }

  addAuctionLog(type, message) {
    if (!this.data.auction.logs) this.data.auction.logs = [];
    const now = new Date();
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type, // 'start', 'bid_submit', 'bid_accept', 'bid_reject', 'timer_reset', 'pause', 'resume', 'time_ended', 'sold', 'unsold', 'select'
      message,
      timestamp: now.toISOString(),
      timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    this.data.auction.logs.unshift(logEntry);
    if (this.data.auction.logs.length > 100) {
      this.data.auction.logs = this.data.auction.logs.slice(0, 100);
    }
    this.save();
    return logEntry;
  }

  updateAuction(updateData) {
    this.data.auction = { ...this.data.auction, ...updateData };
    this.save();
    return this.getAuctionState();
  }

  // --- BID MANAGEMENT ---
  addPendingBid(bid) {
    this.data.auction.pendingBids.unshift(bid);
    this.save();
    return this.data.auction.pendingBids;
  }

  resolveBid(bidId, status) {
    const bidIndex = this.data.auction.pendingBids.findIndex(b => b.id === bidId);
    if (bidIndex === -1) return null;
    const bid = this.data.auction.pendingBids[bidIndex];
    bid.status = status;
    bid.resolvedAt = new Date().toISOString();

    if (status === 'Accepted') {
      this.data.auction.currentBid = bid.amount;
      this.data.auction.highestBidderTeamId = bid.teamId;
      this.data.auction.highestBidderTeamName = bid.teamName;
      this.data.auction.biddingHistory.unshift({
        id: bid.id,
        teamId: bid.teamId,
        teamName: bid.teamName,
        amount: bid.amount,
        timestamp: bid.resolvedAt
      });
      // Mark lower/equal pending bids as superseded
      this.data.auction.pendingBids.forEach(b => {
        if (b.id !== bidId && b.status === 'Pending' && b.amount <= bid.amount) {
          b.status = 'Superseded';
          b.resolvedAt = new Date().toISOString();
        }
      });
    }

    this.save();
    return { bid, auctionState: this.getAuctionState() };
  }

  // --- SELL & UNSOLD ---
  sellCurrentPlayer() {
    const { currentPlayerId, currentBid, highestBidderTeamId } = this.data.auction;
    if (!currentPlayerId || !highestBidderTeamId) {
      throw new Error('No active player or highest bidder to sell to');
    }

    const player = this.getPlayer(currentPlayerId);
    const team = this.data.teams.find(t => t.id === highestBidderTeamId);

    if (!player || !team) {
      throw new Error('Player or Team not found');
    }

    if (team.players.length >= (this.data.settings.maxTeamPlayers || 10)) {
      throw new Error(`Team ${team.name} has already reached the maximum squad limit of 10`);
    }

    const budget = team.totalBudget || this.data.settings.defaultTeamBudget || DEFAULT_PURSE;
    if ((team.totalSpent || 0) + currentBid > budget) {
      throw new Error(`Team ${team.name} has insufficient purse balance (Purse: ₹${(budget/10000000).toFixed(2)} Cr)`);
    }

    // Update Player
    player.status = 'Sold';
    player.soldTo = team.id;
    player.soldTeamName = team.name;
    player.soldPrice = currentBid;

    // Update Team
    team.players.push({
      id: player.id,
      name: player.name,
      category: player.category,
      photoUrl: player.photoUrl,
      soldPrice: currentBid,
      boughtAt: new Date().toISOString()
    });
    team.totalSpent = (team.totalSpent || 0) + currentBid;
    team.playerCount = team.players.length;

    // Add to History
    const historyItem = {
      id: `H_${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      category: player.category,
      photoUrl: player.photoUrl,
      basePrice: player.basePrice,
      finalPrice: currentBid,
      teamId: team.id,
      teamName: team.name,
      status: 'Sold',
      timestamp: new Date().toISOString()
    };
    this.data.history.unshift(historyItem);

    // Update Auction State
    this.data.auction.status = 'SOLD';
    this.data.auction.pendingBids = [];
    this.save();

    return {
      player,
      team: this.getTeam(team.id),
      historyItem,
      auctionState: this.getAuctionState()
    };
  }

  markCurrentPlayerUnsold() {
    const { currentPlayerId } = this.data.auction;
    if (!currentPlayerId) {
      throw new Error('No active player to mark unsold');
    }

    const player = this.getPlayer(currentPlayerId);
    if (!player) {
      throw new Error('Player not found');
    }

    player.status = 'Unsold';
    player.soldTo = null;
    player.soldTeamName = null;
    player.soldPrice = null;

    // Add to History
    const historyItem = {
      id: `H_${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      category: player.category,
      photoUrl: player.photoUrl,
      basePrice: player.basePrice,
      finalPrice: null,
      teamId: null,
      teamName: null,
      status: 'Unsold',
      timestamp: new Date().toISOString()
    };
    this.data.history.unshift(historyItem);

    this.data.auction.status = 'UNSOLD';
    this.data.auction.pendingBids = [];
    this.save();

    return {
      player,
      historyItem,
      auctionState: this.getAuctionState()
    };
  }

  // --- RANDOM PLAYER SELECTION WITH AUCTION VALIDATION ---
  selectRandomPlayer() {
    // Check tournament readiness
    if (this.data.teams.length < 2) {
      throw new Error('Cannot start auction. Please create at least 2 teams first in Team Management.');
    }

    const availablePlayers = this.data.players.filter(p => p.status === 'Available');
    if (availablePlayers.length === 0) {
      throw new Error('No available players remaining in the tournament pool.');
    }

    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    const chosenPlayer = availablePlayers[randomIndex];

    chosenPlayer.status = 'In Auction';

    this.data.auction = {
      status: 'PLAYER_SELECTED',
      currentPlayerId: chosenPlayer.id,
      currentBid: chosenPlayer.basePrice,
      highestBidderTeamId: null,
      highestBidderTeamName: null,
      bidIncrement: this.data.settings.bidIncrement || 2000000,
      pendingBids: [],
      biddingHistory: [],
      biddingStartedAt: null,
      biddingEndsAt: null,
      pausedRemainingMs: null,
      timerDurationSeconds: this.data.settings.biddingTimeSeconds || 10,
      logs: this.data.auction.logs || []
    };

    this.addAuctionLog('select', `${chosenPlayer.name} (${chosenPlayer.category}) brought to auction stage. Base price: ₹${chosenPlayer.basePrice.toLocaleString('en-IN')}`);

    this.save();
    return this.getAuctionState();
  }

  // --- HISTORY & SETTINGS ---
  getHistory() {
    return this.data.history;
  }

  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    if (newSettings.bidIncrement) {
      this.data.auction.bidIncrement = Number(newSettings.bidIncrement);
    }
    if (newSettings.biddingTimeSeconds) {
      this.data.settings.biddingTimeSeconds = Number(newSettings.biddingTimeSeconds);
    }
    if (newSettings.defaultTeamBudget) {
      const newBudget = Number(newSettings.defaultTeamBudget);
      this.data.teams.forEach(t => {
        t.totalBudget = newBudget;
      });
    }
    this.save();
    return this.data.settings;
  }

  getDashboardStats() {
    const totalTeams = this.data.teams.length;
    const totalPlayers = this.data.players.length;
    const available = this.data.players.filter(p => p.status === 'Available').length;
    const inAuction = this.data.players.filter(p => p.status === 'In Auction').length;
    const sold = this.data.players.filter(p => p.status === 'Sold').length;
    const unsold = this.data.players.filter(p => p.status === 'Unsold').length;

    const totalSpentAll = this.data.teams.reduce((acc, t) => acc + (t.totalSpent || 0), 0);
    const totalPurseAll = this.data.teams.reduce((acc, t) => acc + (t.totalBudget || this.data.settings.defaultTeamBudget || DEFAULT_PURSE), 0);

    return {
      totalTeams,
      totalPlayers,
      available,
      inAuction,
      sold,
      unsold,
      totalSpentAll,
      totalPurseAll,
      teams: this.getTeams(),
      auctionStatus: this.data.auction.status,
      settings: this.data.settings
    };
  }
}

const store = new Store();
module.exports = store;
