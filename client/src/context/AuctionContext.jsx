import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { API_BASE, API_URL } from '../config/api';

const AuctionContext = createContext();

export const AuctionProvider = ({ children }) => {
  const { user, role } = useAuth();

  const [connected, setConnected] = useState(false);
  const [auction, setAuction] = useState({
    status: 'WAITING',
    currentPlayerId: null,
    currentPlayer: null,
    currentBid: 0,
    highestBidderTeamId: null,
    highestBidderTeamName: null,
    bidIncrement: 100,
    pendingBids: [],
    biddingHistory: []
  });

  const [stats, setStats] = useState({
    totalTeams: 0,
    totalPlayers: 0,
    available: 0,
    inAuction: 0,
    sold: 0,
    unsold: 0,
    totalSpentAll: 0
  });

  const [teams, setTeams] = useState([]);
  const [history, setHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState(null);

  const socketRef = useRef(null);

  // Audio synthesizers via Web Audio API (no external asset dependencies)
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'bid') {
        // High ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'accept') {
        // Double triumphant chime
        [0, 0.12].forEach((delay, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(i === 0 ? 523.25 : 783.99, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.25);
        });
      } else if (type === 'sold') {
        // Major fanfare chord
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const startTime = ctx.currentTime + (idx * 0.08);
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.25, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.65);
        });
      } else if (type === 'buzzer') {
        // Low rejection tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }, [soundEnabled]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Fire Confetti on Sold
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FBBF24']
      });
    } catch (e) {
      // Ignore if canvas blocked
    }
  }, []);

  // Fetch initial history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auction/history`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
  }, []);

  // Socket Connection Setup
  useEffect(() => {
    const socket = io(API_URL, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Auction Socket Server');
      setConnected(true);
      if (role === 'HOST') {
        socket.emit('join', { role: 'HOST' });
      } else if (user?.teamId) {
        socket.join?.(`team-${user.teamId}`);
        socket.emit('join', { teamId: user.teamId });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Auction Socket Server');
      setConnected(false);
    });

    socket.on('auction:sync', (data) => {
      if (data.auction) setAuction(data.auction);
      if (data.stats) setStats(data.stats);
      if (data.teams) setTeams(data.teams);
    });

    socket.on('teams:changed', (data) => {
      if (data.teams) setTeams(data.teams);
      if (data.stats) setStats(data.stats);
      if (data.auction) setAuction(data.auction);
    });

    socket.on('auction:state_changed', (data) => {
      if (data.auction) setAuction(data.auction);
      if (data.stats) setStats(data.stats);
      if (data.teams) setTeams(data.teams);
    });

    socket.on('auction:player_selected', (data) => {
      if (data.auction) setAuction(data.auction);
      showToast(`Selected player: ${data.auction.currentPlayer?.name}`, 'info');
    });

    socket.on('auction:bidding_started', (data) => {
      if (data.auction) setAuction(data.auction);
      playSound('bid');
      showToast('Bidding is now LIVE! Teams can place bids.', 'success');
    });

    socket.on('auction:bid_placed', (data) => {
      if (data.auction) setAuction(data.auction);
      playSound('bid');
      showToast(`${data.bid.teamName} bid ₹${data.bid.amount.toLocaleString('en-IN')} - now leading`, 'success');
    });

    socket.on('auction:timer_tick', (data) => {
      setAuction(prev => ({
        ...prev,
        biddingEndsAt: data.biddingEndsAt,
        serverSecondsLeft: data.secondsLeft
      }));
    });

    socket.on('auction:bidding_ended', (data) => {
      if (data.auction) setAuction(data.auction);
      playSound('buzzer');
      showToast(`⏱️ Bidding Time Ended! Highest Bidder: ${data.highestBidderTeamName}. Awaiting Host sale.`, 'warning');
    });

    socket.on('auction:time_up_unsold', (data) => {
      if (data.auction) setAuction(data.auction);
      playSound('buzzer');
      showToast(`⏱️ TIME UP! No bids placed. ${data.player?.name || 'Player'} marked UNSOLD.`, 'warning');
      fetchHistory();
    });

    socket.on('settings:updated', (data) => {
      if (data.settings) {
        showToast(`Settings updated (Timer: ${data.settings.biddingTimeSeconds || 10}s)`, 'info');
      }
    });

    socket.on('auction:player_sold', (data) => {
      if (data.auction) setAuction(data.auction);
      if (data.teams) setTeams(data.teams);
      playSound('sold');
      triggerConfetti();
      showToast(`🏏 SOLD! ${data.player.name} sold to ${data.team.name} for ₹${data.player.soldPrice.toLocaleString('en-IN')}!`, 'success');
      fetchHistory();
    });

    socket.on('auction:player_unsold', (data) => {
      if (data.auction) setAuction(data.auction);
      playSound('buzzer');
      showToast(`Player ${data.player.name} marked UNSOLD`, 'warning');
      fetchHistory();
    });

    socket.on('error:alert', (data) => {
      showToast(data.message, 'danger');
    });

    fetchHistory();

    return () => {
      socket.disconnect();
    };
  }, [role, user?.teamId, playSound, showToast, triggerConfetti, fetchHistory]);

  // Actions
  const selectRandomPlayer = useCallback(() => {
    return new Promise((resolve) => {
      socketRef.current?.emit('host:select_random_player', (res) => {
        if (!res?.success) showToast(res?.message || 'Failed to select player', 'danger');
        resolve(res);
      });
    });
  }, [showToast]);

  const selectPlayer = useCallback((playerId) => {
    return new Promise((resolve) => {
      socketRef.current?.emit('host:select_player', playerId, (res) => {
        if (!res?.success) showToast(res?.message || 'Failed to select player', 'danger');
        resolve(res);
      });
    });
  }, [showToast]);

  const startBidding = useCallback(() => {
    return new Promise((resolve) => {
      socketRef.current?.emit('host:start_bidding', (res) => {
        if (!res?.success) showToast(res?.message || 'Failed to start bidding', 'danger');
        resolve(res);
      });
    });
  }, [showToast]);

  const pauseBidding = useCallback(() => {
    return new Promise((resolve) => {
      socketRef.current?.emit('host:pause_bidding', (res) => {
        resolve(res);
      });
    });
  }, []);

  const resumeBidding = useCallback(() => {
    return new Promise((resolve) => {
      socketRef.current?.emit('host:resume_bidding', (res) => {
        resolve(res);
      });
    });
  }, []);

  const sellPlayer = useCallback(() => {
    return new Promise((resolve) => {
      socketRef.current?.emit('host:sell_player', (res) => {
        if (!res?.success) showToast(res?.message || 'Failed to sell player', 'danger');
        resolve(res);
      });
    });
  }, [showToast]);

  const markUnsold = useCallback(() => {
    return new Promise((resolve) => {
      socketRef.current?.emit('host:mark_unsold', (res) => {
        if (!res?.success) showToast(res?.message || 'Failed to mark unsold', 'danger');
        resolve(res);
      });
    });
  }, [showToast]);

  const submitBid = useCallback((amount) => {
    return new Promise((resolve) => {
      if (!user?.teamId) {
        showToast('You must be logged in as a Team Leader to bid', 'danger');
        return resolve({ success: false });
      }
      socketRef.current?.emit('team:submit_bid', {
        teamId: user.teamId,
        amount
      }, (res) => {
        if (!res?.success) {
          showToast(res?.message || 'Bid submission failed', 'danger');
        } else {
          showToast(`Bid of ₹${amount.toLocaleString('en-IN')} is now official.`, 'success');
        }
        resolve(res);
      });
    });
  }, [user, showToast]);

  const refreshData = useCallback(() => {
    socketRef.current?.emit('sync:request_state');
    fetchHistory();
  }, [fetchHistory]);

  return (
    <AuctionContext.Provider value={{
      connected,
      auction,
      stats,
      teams,
      history,
      soundEnabled,
      setSoundEnabled,
      toast,
      showToast,
      selectRandomPlayer,
      selectPlayer,
      startBidding,
      pauseBidding,
      resumeBidding,
      sellPlayer,
      markUnsold,
      submitBid,
      refreshData
    }}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => useContext(AuctionContext);
