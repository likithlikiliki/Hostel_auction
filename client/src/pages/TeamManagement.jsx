import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { useAuth } from '../context/AuthContext';
import { formatPurse, formatFullINR } from '../utils/formatCurrency';
import {
  Users,
  UserPlus,
  Key,
  Shield,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Plus
} from 'lucide-react';

export default function TeamManagement() {
  const { teams, refreshData, showToast } = useAuction();
  const { refreshTeams } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('password123');
  const [totalBudget, setTotalBudget] = useState(1000000000); // 100 Cr
  const [color, setColor] = useState('#3B82F6');

  const openCreateModal = () => {
    setEditingTeam(null);
    setName('');
    setOwner('');
    setLoginId(`team${String(teams.length + 1).padStart(2, '0')}`);
    setPassword('password123');
    setTotalBudget(1000000000);
    const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#06B6D4', '#EF4444', '#F97316'];
    setColor(colors[teams.length % colors.length]);
    setShowModal(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setName(team.name);
    setOwner(team.owner);
    setLoginId(team.loginId);
    setPassword(team.password || 'password123');
    setTotalBudget(team.totalBudget || 1000000000);
    setColor(team.color || '#3B82F6');
    setShowModal(true);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    if (!name.trim() || !owner.trim() || !loginId.trim() || !password.trim()) {
      showToast('All fields (Team Name, Owner, Login ID, Password) are required', 'danger');
      return;
    }

    setLoading(true);
    try {
      const url = editingTeam
        ? `http://localhost:5000/api/teams/${editingTeam.id}`
        : 'http://localhost:5000/api/teams';
      const method = editingTeam ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          owner: owner.trim(),
          loginId: loginId.trim(),
          password: password.trim(),
          color,
          totalBudget: Number(totalBudget)
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingTeam ? `Team "${name}" updated successfully` : `Team "${name}" registered successfully!`, 'success');
        setShowModal(false);
        refreshData();
        refreshTeams();
      } else {
        showToast(data.message || 'Failed to save team', 'danger');
      }
    } catch (err) {
      showToast('Server connection error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id, teamName, playerCount = 0) => {
    if (playerCount > 0) {
      showToast(`This team cannot be deleted because it already has ${playerCount} purchased player(s).`, 'danger');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete team "${teamName}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/teams/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Team "${teamName}" deleted successfully`, 'success');
        refreshData();
        refreshTeams();
      } else {
        showToast(data.message || 'This team cannot be deleted because it already has players.', 'danger');
      }
    } catch (err) {
      showToast('Server connection error', 'danger');
    }
  };

  const handleLoadSampleTeams = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/teams/sample/load', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Demo data loaded successfully!', 'success');
        refreshData();
        refreshTeams();
      } else {
        showToast(data.message || 'Failed to load demo data', 'danger');
      }
    } catch (err) {
      showToast('Server connection error', 'danger');
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>TEAM MANAGEMENT</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Dynamically create tournament franchises, configure login credentials for team owners, and set purse budgets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {teams.length === 0 && (
            <button onClick={handleLoadSampleTeams} className="btn btn-secondary">
              <Sparkles size={16} color="#FBBF24" /> Load Demo Data
            </button>
          )}

          <button onClick={openCreateModal} className="btn btn-gold btn-lg">
            <Plus size={18} /> + Create New Team
          </button>
        </div>
      </div>

      {/* Rules Notice */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.88rem',
        color: '#93C5FD'
      }}>
        <Shield size={20} />
        <div>
          <strong>Tournament Squad Rule:</strong> Minimum <strong>8 players</strong> required per team to qualify. Maximum limit is <strong>10 players</strong>. Teams with 10 players will be blocked from further bidding.
        </div>
      </div>

      {/* Teams Grid / Empty State */}
      {teams.length === 0 ? (
        <div className="card" style={{ padding: '4rem 1.5rem', textAlign: 'center', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Users size={36} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            No teams created yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 1.75rem', lineHeight: 1.5 }}>
            Create teams before starting the auction. Each team leader will receive login credentials to participate in online bidding.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={openCreateModal} className="btn btn-gold btn-lg">
              <Plus size={20} /> + CREATE FIRST TEAM
            </button>
            <button onClick={handleLoadSampleTeams} className="btn btn-secondary btn-lg">
              <Sparkles size={18} /> Load Demo Data
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              REGISTERED TEAMS ({teams.length})
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {teams.length < 2 ? '⚠️ At least 2 teams required to start auction' : '✓ Tournament ready'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {teams.map(team => {
              const count = team.players ? team.players.length : 0;
              const slotsRemaining = Math.max(0, 10 - count);
              const isMinMet = count >= 8;
              const isFull = count >= 10;
              const showPass = showPasswords[team.id];
              const remainingPurse = (team.totalBudget || 1000000000) - (team.totalSpent || 0);

              return (
                <div key={team.id} className="card" style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: team.color || 'var(--gold-primary)',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                  }} />

                  {/* Title & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{team.name}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Owner: <strong style={{ color: '#fff' }}>{team.owner}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => openEditModal(team)} className="btn btn-outline" style={{ padding: '0.35rem' }} title="Edit Team">
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id, team.name, count)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem', color: count > 0 ? 'var(--text-dim)' : '#EF4444' }}
                        title={count > 0 ? 'Cannot delete team with players' : 'Delete Team'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Squad & Slots Info */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.4rem',
                    margin: '1rem 0',
                    background: 'rgba(7, 11, 25, 0.5)',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SQUAD</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isFull ? '#EF4444' : '#fff' }}>
                        {count} / 10
                      </div>
                      <div style={{ fontSize: '0.68rem', color: isMinMet ? '#10B981' : '#F59E0B' }}>
                        {isMinMet ? '✓ Qualified' : `${8 - count} more`}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>PURSE LEFT</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-bright)' }}>
                        {formatPurse(remainingPurse)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                        of {formatPurse(team.totalBudget || 1000000000)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SPENT</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#94A3B8' }}>
                        {formatPurse(team.totalSpent || 0)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {slotsRemaining} slots left
                      </div>
                    </div>
                  </div>

                  {/* Credentials Box */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Login ID:</span>
                      <code style={{ color: 'var(--gold-bright)', fontWeight: 700 }}>{team.loginId}</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Password:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <code>{showPass ? (team.password || 'password123') : '••••••••'}</code>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(team.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                        >
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>{editingTeam ? 'Edit Team Details' : 'Create New Team'}</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-outline" style={{ padding: '0.3rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTeam}>
              <div className="form-group">
                <label className="form-label">Team Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Team A"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team Leader / Owner Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Team Owner"
                  value={owner}
                  onChange={e => setOwner(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team Login ID *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. team01"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team Password *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Password for team leader login"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team Purse Budget (₹)</label>
                <input
                  type="number"
                  step="10000000"
                  className="form-input"
                  value={totalBudget}
                  onChange={e => setTotalBudget(Number(e.target.value))}
                  required
                />
                <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  {formatPurse(totalBudget)} ({formatFullINR(totalBudget)})
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Team Color Accent</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    style={{ width: '45px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{color}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-gold" style={{ flex: 1 }}>
                  {loading ? 'Saving...' : editingTeam ? 'Save Changes' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
