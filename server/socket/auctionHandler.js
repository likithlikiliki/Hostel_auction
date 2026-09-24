const store = require('../store');

let serverCountdownTimer = null;
let serverTickInterval = null;

function clearServerTimer() {
  if (serverCountdownTimer) {
    clearTimeout(serverCountdownTimer);
    serverCountdownTimer = null;
  }
  if (serverTickInterval) {
    clearInterval(serverTickInterval);
    serverTickInterval = null;
  }
}

function startServerCountdown(durationMs, io, targetEnd = Date.now() + durationMs) {
  clearServerTimer();
  console.log(`[Timer] Started server countdown for ${durationMs}ms`);

  // Immediate first tick broadcast
  io.emit('auction:timer_tick', {
    secondsLeft: Math.ceil(durationMs / 1000),
    biddingEndsAt: targetEnd
  });

  // Every second heartbeat broadcast
  serverTickInterval = setInterval(() => {
    const remainingMs = Math.max(0, targetEnd - Date.now());
    const secondsLeft = Math.ceil(remainingMs / 1000);
    io.emit('auction:timer_tick', {
      secondsLeft,
      biddingEndsAt: targetEnd
    });
    if (remainingMs <= 0) {
      if (serverTickInterval) {
        clearInterval(serverTickInterval);
        serverTickInterval = null;
      }
    }
  }, 1000);

  serverCountdownTimer = setTimeout(() => {
    handleTimerExpiration(io);
  }, durationMs);
}

function handleTimerExpiration(io) {
  clearServerTimer();
  const currentAuction = store.getAuctionState();
  if (currentAuction.status !== 'BIDDING') {
    return;
  }

  const player = currentAuction.currentPlayer;
  const playerName = player ? player.name : 'Player';

  // Case A: No valid bids exist
  if (!currentAuction.highestBidderTeamId) {
    console.log(`[Timer] Time expired with NO bids for ${playerName}. Automatically marking UNSOLD.`);
    try {
      const result = store.markCurrentPlayerUnsold();
      store.addAuctionLog('unsold', `TIME UP! No bids received. ${playerName} marked as UNSOLD.`);
      
      io.emit('auction:time_up_unsold', {
        player: result.player,
        historyItem: result.historyItem,
        auction: result.auctionState
      });
      io.emit('auction:player_unsold', {
        player: result.player,
        historyItem: result.historyItem,
        auction: result.auctionState
      });
      io.emit('auction:state_changed', {
        auction: result.auctionState,
        stats: store.getDashboardStats()
      });
    } catch (err) {
      console.error('[Timer] Error auto-marking unsold:', err);
    }
  } else {
    // Case B: A valid leading bid exists.
    console.log(`[Timer] Bidding time ended for ${playerName}. Highest bid: ₹${currentAuction.currentBid} by ${currentAuction.highestBidderTeamName}. Waiting for Host to finalize.`);
    try {
      const updatedAuction = store.updateAuction({
        status: 'TIME_ENDED',
        biddingEndsAt: Date.now()
      });
      store.addAuctionLog('time_ended', `BIDDING TIME ENDED! Highest Bidder: ${currentAuction.highestBidderTeamName} (₹${currentAuction.currentBid.toLocaleString('en-IN')}). Waiting for Host to sell.`);
      
      io.emit('auction:bidding_ended', {
        auction: updatedAuction,
        highestBidderTeamName: currentAuction.highestBidderTeamName,
        finalBid: currentAuction.currentBid
      });
      io.emit('auction:state_changed', {
        auction: updatedAuction,
        stats: store.getDashboardStats()
      });
    } catch (err) {
      console.error('[Timer] Error handling bidding ended:', err);
    }
  }
}

module.exports = function auctionSocketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Send initial state upon connection
    socket.emit('auction:sync', {
      auction: store.getAuctionState(),
      stats: store.getDashboardStats(),
      teams: store.getTeams()
    });

    // Join room based on role / teamId
    socket.on('join', (data) => {
      if (data.role === 'HOST') {
        socket.join('host-room');
        console.log(`[Socket] Host joined host-room (${socket.id})`);
      } else if (data.teamId) {
        socket.join(`team-${data.teamId}`);
        console.log(`[Socket] Team joined team-${data.teamId} (${socket.id})`);
      }
    });

    // Request full state sync
    socket.on('sync:request_state', () => {
      socket.emit('auction:sync', {
        auction: store.getAuctionState(),
        stats: store.getDashboardStats(),
        teams: store.getTeams()
      });
    });

    // --- HOST ACTIONS ---

    // 1. Select random available player
    socket.on('host:select_random_player', (callback) => {
      try {
        clearServerTimer();

        if (store.getTeams().length < 2) {
          const msg = 'Cannot start auction. Please create at least 2 teams first in Team Management.';
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        const auctionState = store.selectRandomPlayer();
        if (!auctionState) {
          const err = 'No available players remaining for auction!';
          if (callback) callback({ success: false, message: err });
          return socket.emit('error:alert', { message: err });
        }

        io.emit('auction:player_selected', { auction: auctionState });
        io.emit('auction:state_changed', {
          auction: auctionState,
          stats: store.getDashboardStats()
        });

        if (callback) callback({ success: true, auction: auctionState });
      } catch (err) {
        console.error('host:select_random_player error:', err);
        socket.emit('error:alert', { message: err.message });
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // 2. Select specific player by ID
    socket.on('host:select_player', (playerId, callback) => {
      try {
        clearServerTimer();

        if (store.getTeams().length < 2) {
          const msg = 'Cannot start auction. Please create at least 2 teams first in Team Management.';
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        const player = store.getPlayer(playerId);
        if (!player || player.status !== 'Available') {
          const msg = 'Player is not available';
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        player.status = 'In Auction';
        const durationSec = store.getSettings().biddingTimeSeconds || 10;
        const auctionState = store.updateAuction({
          status: 'PLAYER_SELECTED',
          currentPlayerId: player.id,
          currentBid: player.basePrice,
          highestBidderTeamId: null,
          highestBidderTeamName: null,
          pendingBids: [],
          biddingHistory: [],
          biddingStartedAt: null,
          biddingEndsAt: null,
          pausedRemainingMs: null,
          timerDurationSeconds: durationSec
        });

        store.addAuctionLog('select', `${player.name} (${player.category}) selected for auction. Base price: ₹${player.basePrice.toLocaleString('en-IN')}`);

        io.emit('auction:player_selected', { auction: auctionState });
        io.emit('auction:state_changed', {
          auction: auctionState,
          stats: store.getDashboardStats()
        });

        if (callback) callback({ success: true, auction: auctionState });
      } catch (err) {
        socket.emit('error:alert', { message: err.message });
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // 3. Start Bidding with Server Timer
    socket.on('host:start_bidding', (callback) => {
      try {
        if (store.getTeams().length < 2) {
          const msg = 'Cannot start bidding. Please create at least 2 teams first in Team Management.';
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        const currentState = store.getAuctionState();
        if (!currentState.currentPlayerId) {
          const msg = 'Please select a player first';
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        const durationSec = store.getSettings().biddingTimeSeconds || 10;
        const durationMs = durationSec * 1000;
        const biddingStartedAt = Date.now();
        const biddingEndsAt = biddingStartedAt + durationMs;

        const auctionState = store.updateAuction({
          status: 'BIDDING',
          biddingStartedAt,
          biddingEndsAt,
          pausedRemainingMs: null,
          timerDurationSeconds: durationSec
        });

        store.addAuctionLog('start', `Bidding started for ${auctionState.currentPlayer?.name}. ${durationSec}-second countdown active.`);

        // Start server authoritative timer
        startServerCountdown(durationMs, io);

        io.emit('auction:bidding_started', { auction: auctionState });
        io.emit('auction:state_changed', {
          auction: auctionState,
          stats: store.getDashboardStats()
        });

        if (callback) callback({ success: true, auction: auctionState });
      } catch (err) {
        socket.emit('error:alert', { message: err.message });
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // 4. Pause Bidding (Freeze Timer)
    socket.on('host:pause_bidding', (callback) => {
      try {
        const currentAuction = store.getAuctionState();
        const remaining = Math.max(0, (currentAuction.biddingEndsAt || Date.now()) - Date.now());
        
        clearServerTimer();

        const auctionState = store.updateAuction({
          status: 'PAUSED',
          pausedRemainingMs: remaining
        });

        store.addAuctionLog('pause', `Auction PAUSED with ${Math.ceil(remaining / 1000)}s remaining.`);

        io.emit('auction:state_changed', {
          auction: auctionState,
          stats: store.getDashboardStats()
        });
        if (callback) callback({ success: true, auction: auctionState });
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // 5. Resume Bidding (Resume from frozen remaining time)
    socket.on('host:resume_bidding', (callback) => {
      try {
        const currentAuction = store.getAuctionState();
        const durationSec = store.getSettings().biddingTimeSeconds || 10;
        const remaining = (typeof currentAuction.pausedRemainingMs === 'number' && currentAuction.pausedRemainingMs > 0)
          ? currentAuction.pausedRemainingMs
          : durationSec * 1000;

        const newBiddingEndsAt = Date.now() + remaining;

        const auctionState = store.updateAuction({
          status: 'BIDDING',
          biddingEndsAt: newBiddingEndsAt,
          pausedRemainingMs: null
        });

        store.addAuctionLog('resume', `Auction RESUMED with ${Math.ceil(remaining / 1000)}s remaining.`);

        // Resume server countdown with remaining time
        startServerCountdown(remaining, io);

        io.emit('auction:state_changed', {
          auction: auctionState,
          stats: store.getDashboardStats()
        });
        if (callback) callback({ success: true, auction: auctionState });
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // 6. Sell Player -> Confirmed by Host
    socket.on('host:sell_player', (callback) => {
      try {
        clearServerTimer();

        const result = store.sellCurrentPlayer();
        store.addAuctionLog('sold', `🏏 SOLD! ${result.player.name} sold to ${result.team.name} for ₹${result.player.soldPrice.toLocaleString('en-IN')}!`);

        io.emit('auction:player_sold', {
          player: result.player,
          team: result.team,
          historyItem: result.historyItem,
          auction: result.auctionState,
          teams: store.getTeams()
        });
        io.emit('auction:state_changed', {
          auction: result.auctionState,
          stats: store.getDashboardStats(),
          teams: store.getTeams()
        });

        if (callback) callback({ success: true, result });
      } catch (err) {
        socket.emit('error:alert', { message: err.message });
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // 7. Mark Unsold -> Confirmed by Host
    socket.on('host:mark_unsold', (callback) => {
      try {
        clearServerTimer();

        const result = store.markCurrentPlayerUnsold();
        store.addAuctionLog('unsold', `Host marked ${result.player.name} as UNSOLD.`);

        io.emit('auction:player_unsold', {
          player: result.player,
          historyItem: result.historyItem,
          auction: result.auctionState
        });
        io.emit('auction:state_changed', {
          auction: result.auctionState,
          stats: store.getDashboardStats()
        });

        if (callback) callback({ success: true, result });
      } catch (err) {
        socket.emit('error:alert', { message: err.message });
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // 8. Update Settings
    socket.on('host:update_settings', (newSettings, callback) => {
      try {
        const updated = store.updateSettings(newSettings);
        io.emit('settings:updated', { settings: updated });
        io.emit('auction:state_changed', {
          auction: store.getAuctionState(),
          stats: store.getDashboardStats()
        });
        if (callback) callback({ success: true, settings: updated });
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // --- TEAM LEADER ACTIONS ---

    // Team Submits Bid
    socket.on('team:submit_bid', (data, callback) => {
      try {
        const { teamId, amount } = data;
        const auctionState = store.getAuctionState();
        const settings = store.getSettings();

        // 1. Check Auction State
        if (auctionState.status !== 'BIDDING') {
          const msg = `Bidding is currently ${auctionState.status.toLowerCase().replace('_', ' ')}. You cannot bid now.`;
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        // 2. Check Timer Expiry
        if (auctionState.biddingEndsAt && Date.now() >= auctionState.biddingEndsAt) {
          const msg = 'Bidding time has expired! Bid cannot be accepted.';
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        // 3. Check Team
        const team = store.getTeam(teamId);
        if (!team) {
          const msg = 'Invalid Team. Please log in again.';
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        // 4. Check Squad Limit (max 10 players)
        const maxLimit = settings.maxTeamPlayers || 10;
        if (team.players && team.players.length >= maxLimit) {
          const msg = `Squad Full! Your team already has ${team.players.length}/${maxLimit} players.`;
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        // 5. Check Team Remaining Purse
        const remainingPurse = (team.totalBudget || 1000000000) - (team.totalSpent || 0);
        if (Number(amount) > remainingPurse) {
          const purseFormatted = (remainingPurse >= 10000000) 
            ? `₹${(remainingPurse / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`
            : (remainingPurse >= 100000)
            ? `₹${(remainingPurse / 100000).toFixed(2).replace(/\.?0+$/, '')} Lakh`
            : `₹${remainingPurse.toLocaleString('en-IN')}`;
          const msg = `Insufficient funds! Your team's remaining purse is ${purseFormatted}.`;
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        // 6. Check Bid Amount
        const minIncrement = settings.bidIncrement || 100;
        let minimumRequiredBid = auctionState.currentBid + minIncrement;
        if (!auctionState.highestBidderTeamId) {
          minimumRequiredBid = auctionState.currentBid || auctionState.currentPlayer.basePrice;
        }

        const bidAmount = Number(amount);
        if (!bidAmount || bidAmount < minimumRequiredBid) {
          const msg = `Minimum valid bid is ₹${minimumRequiredBid.toLocaleString('en-IN')}`;
          if (callback) callback({ success: false, message: msg });
          return socket.emit('error:alert', { message: msg });
        }

        // Update the official bid immediately after all server-side checks pass.
        const newBid = {
          id: `B_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          playerId: auctionState.currentPlayerId,
          teamId: team.id,
          teamName: team.name,
          teamColor: team.color,
          amount: bidAmount,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };

        const durationSec = settings.biddingTimeSeconds || 10;
        const newBiddingEndsAt = Date.now() + (durationSec * 1000);
        store.recordBid(newBid);
        store.updateAuction({
          biddingEndsAt: newBiddingEndsAt,
          pausedRemainingMs: null,
          timerDurationSeconds: durationSec
        });
        store.addAuctionLog('bid_submit', `${team.name} placed a valid bid of ₹${bidAmount.toLocaleString('en-IN')}.`);
        store.addAuctionLog('timer_reset', `Timer reset to ${durationSec} seconds after ${team.name}'s bid.`);
        const finalAuction = store.getAuctionState();

        startServerCountdown(durationSec * 1000, io, finalAuction.biddingEndsAt);
        io.emit('auction:bid_placed', {
          bid: newBid,
          currentBid: finalAuction.currentBid,
          leadingTeam: finalAuction.highestBidderTeamName,
          leadingTeamId: finalAuction.highestBidderTeamId,
          bidder: { id: team.id, name: team.name, color: team.color },
          biddingEndsAt: finalAuction.biddingEndsAt,
          status: finalAuction.status,
          auction: finalAuction
        });
        io.emit('auction:state_changed', {
          auction: finalAuction,
          stats: store.getDashboardStats()
        });

        if (callback) callback({ success: true, bid: newBid, auction: finalAuction });
      } catch (err) {
        console.error('team:submit_bid error:', err);
        if (callback) callback({ success: false, message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};
