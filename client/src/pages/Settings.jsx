import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import ConfirmModal from '../components/ConfirmModal';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Save,
  Shield,
  DollarSign,
  Users,
  Clock,
  Check
} from 'lucide-react';

export default function Settings() {
  const { refreshData, showToast } = useAuction();

  const [biddingTimeSeconds, setBiddingTimeSeconds] = useState(10);
  const [bidIncrement, setBidIncrement] = useState(100);
  const [minTeamPlayers, setMinTeamPlayers] = useState(8);
  const [maxTeamPlayers, setMaxTeamPlayers] = useState(10);
  const [hostPassword, setHostPassword] = useState('password123');

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/auction/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setBiddingTimeSeconds(data.settings.biddingTimeSeconds || 10);
          setBidIncrement(data.settings.bidIncrement || 100);
          setMinTeamPlayers(data.settings.minTeamPlayers || 8);
          setMaxTeamPlayers(data.settings.maxTeamPlayers || 10);
          setHostPassword(data.settings.hostPassword || 'password123');
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auction/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          biddingTimeSeconds: Number(biddingTimeSeconds),
          bidIncrement: Number(bidIncrement),
          minTeamPlayers: Number(minTeamPlayers),
          maxTeamPlayers: Number(maxTeamPlayers),
          hostPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Auction settings updated successfully', 'success');
        refreshData();
      } else {
        showToast('Failed to update settings', 'danger');
      }
    } catch (err) {
      showToast('Server error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleResetTournament = async () => {
    setConfirmResetOpen(false);
    try {
      const res = await fetch('http://localhost:5000/api/auction/reset', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Auction tournament reset to initial default state', 'success');
        refreshData();
        window.location.reload();
      }
    } catch (err) {
      showToast('Failed to reset tournament', 'danger');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Tournament & System Settings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Configure live bid increments, minimum and maximum squad roster rules, and tournament resets.
        </p>
      </div>

      <form onSubmit={handleSaveSettings}>
        {/* Bidding Time Countdown Card (Requirement 20) */}
        <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="#38BDF8" /> Bidding Countdown Timer
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            The countdown duration granted for bidding. Resets automatically to this full duration whenever the Host accepts an official bid.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            {[5, 10, 15, 20, 30].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setBiddingTimeSeconds(val)}
                className="btn"
                style={{
                  background: biddingTimeSeconds === val ? '#38BDF8' : 'rgba(255, 255, 255, 0.05)',
                  color: biddingTimeSeconds === val ? '#000' : '#fff',
                  border: '1px solid ' + (biddingTimeSeconds === val ? '#38BDF8' : 'var(--border-subtle)'),
                  fontWeight: 700
                }}
              >
                {val}s
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Custom Bidding Time (Seconds)</label>
            <input
              type="number"
              min="3"
              max="120"
              className="form-input"
              value={biddingTimeSeconds}
              onChange={e => setBiddingTimeSeconds(Number(e.target.value))}
              required
            />
            <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Default: 10 seconds</small>
          </div>
        </div>

        {/* Bid Increments Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} color="var(--gold-primary)" /> Bidding Step Increment
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            The minimum amount added to the current official bid each time a team submits a bid.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            {[100, 250, 500, 1000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setBidIncrement(val)}
                className="btn"
                style={{
                  background: bidIncrement === val ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: bidIncrement === val ? '#000' : '#fff',
                  border: '1px solid ' + (bidIncrement === val ? 'var(--gold-primary)' : 'var(--border-subtle)'),
                  fontWeight: 700
                }}
              >
                ₹{val}
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Custom Bid Increment (₹)</label>
            <input
              type="number"
              step="50"
              min="50"
              className="form-input"
              value={bidIncrement}
              onChange={e => setBidIncrement(Number(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Squad Rules Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="#38BDF8" /> Franchise Squad Limits
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Enforced limits for tournament eligibility and automatic bid button locking.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Minimum Required Players</label>
              <input
                type="number"
                min="1"
                max="25"
                className="form-input"
                value={minTeamPlayers}
                onChange={e => setMinTeamPlayers(Number(e.target.value))}
                required
              />
              <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Default: 8 players</small>
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Allowed Players</label>
              <input
                type="number"
                min="5"
                max="30"
                className="form-input"
                value={maxTeamPlayers}
                onChange={e => setMaxTeamPlayers(Number(e.target.value))}
                required
              />
              <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Default: 10 players (Blocks 11th player)</small>
            </div>
          </div>
        </div>

        {/* Host Password Security Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="#10B981" /> Host Security & Password
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Master controller authentication password for Host administrative actions.
          </p>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Host Password</label>
            <input
              type="text"
              className="form-input"
              value={hostPassword}
              onChange={e => setHostPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-gold btn-lg"
          style={{ width: '100%', marginBottom: '2.5rem' }}
        >
          <Save size={18} /> {loading ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </form>

      {/* Danger Zone: Reset Tournament */}
      <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#F87171', marginBottom: '0.5rem' }}>
          Reset Tournament Data
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Restores default sample teams (Thunder Strikers, Royal Warriors, Super Kings, Night Riders) and resets all players back to Available.
        </p>

        <button
          type="button"
          onClick={() => setConfirmResetOpen(true)}
          className="btn btn-danger"
        >
          <RotateCcw size={16} /> Reset Tournament & Re-seed Defaults
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Reset Entire Auction?"
        message="This will reset all squad assignments, clear bid history, and return all players to the Available pool with default sample data. Are you sure?"
        confirmText="Yes, Reset Everything"
        cancelText="Cancel"
        onConfirm={handleResetTournament}
        onCancel={() => setConfirmResetOpen(false)}
        type="danger"
      />
    </div>
  );
}
