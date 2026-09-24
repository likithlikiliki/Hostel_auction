import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Key, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';

export default function Login() {
  const { loginAsHost, loginAsTeam, availableTeams, loading, refreshTeams } = useAuth();
  const [activeTab, setActiveTab] = useState('host'); // 'host' or 'team'
  
  // Host Form State
  const [hostPass, setHostPass] = useState('password123');
  
  // Team Form State
  const [selectedTeamLoginId, setSelectedTeamLoginId] = useState('');
  const [teamPass, setTeamPass] = useState('password123');
  const [customLoginId, setCustomLoginId] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);
  
  const [error, setError] = useState('');

  useEffect(() => {
    refreshTeams();
  }, []);

  useEffect(() => {
    if (availableTeams.length > 0 && !selectedTeamLoginId) {
      setSelectedTeamLoginId(availableTeams[0].loginId);
    }
  }, [availableTeams]);

  const handleHostSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await loginAsHost(hostPass);
    if (!res.success) setError(res.message);
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const loginIdToUse = isManualInput ? customLoginId : selectedTeamLoginId;
    if (!loginIdToUse) {
      setError('Please select or enter your Team Login ID');
      return;
    }
    const res = await loginAsTeam(loginIdToUse, teamPass);
    if (!res.success) setError(res.message);
  };

  const quickDemoLogin = async (type, id = '') => {
    setError('');
    if (type === 'host') {
      await loginAsHost('password123');
    } else {
      await loginAsTeam(id, 'password123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at center, #131E38 0%, #070B19 100%)'
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1rem',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)'
          }}>
            🏏
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.3rem' }}>
            Hostel Cricket <span style={{ color: 'var(--gold-primary)' }}>Auction</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-Time Host-Controlled Tournament Auction Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '2rem', position: 'relative' }}>
          {/* Role Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'rgba(7, 11, 25, 0.6)',
            padding: '0.35rem',
            borderRadius: '12px',
            marginBottom: '1.75rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTab('host'); setError(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.85rem',
                background: activeTab === 'host' ? 'var(--gold-primary)' : 'transparent',
                color: activeTab === 'host' ? '#000' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              <Shield size={16} /> Host Controller
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('team'); setError(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.85rem',
                background: activeTab === 'team' ? 'var(--gold-primary)' : 'transparent',
                color: activeTab === 'team' ? '#000' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              <Users size={16} /> Team Leader
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#F87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {activeTab === 'host' ? (
            <form onSubmit={handleHostSubmit}>
              <div className="form-group">
                <label className="form-label">Host Login ID</label>
                <input
                  type="text"
                  className="form-input"
                  value="admin"
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Master Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    value={hostPass}
                    onChange={(e) => setHostPass(e.target.value)}
                    placeholder="Enter host password"
                    required
                  />
                  <Key size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
                <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '4px' }}>
                  Default password: <code>password123</code>
                </small>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-gold"
                style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
              >
                {loading ? 'Authenticating...' : 'Enter Host Dashboard'} <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <div>
              {availableTeams.length === 0 ? (
                /* Empty state when Host hasn't created teams yet */
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px dashed rgba(245, 158, 11, 0.4)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <AlertCircle size={28} color="#FBBF24" style={{ margin: '0 auto 0.75rem' }} />
                  <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.35rem' }}>
                    No Teams Created Yet
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    The Host must first register tournament teams in <strong>Team Management</strong> before Team Leaders can log in.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('host'); }}
                    className="btn btn-gold btn-sm"
                    style={{ margin: '0 auto' }}
                  >
                    <Shield size={14} /> Login as Host to Create Teams
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTeamSubmit}>
                  {!isManualInput ? (
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className="form-label" style={{ margin: 0 }}>Select Your Team</label>
                        <button
                          type="button"
                          onClick={() => setIsManualInput(true)}
                          style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Type Login ID manually
                        </button>
                      </div>
                      <select
                        className="form-select"
                        value={selectedTeamLoginId}
                        onChange={(e) => setSelectedTeamLoginId(e.target.value)}
                      >
                        {availableTeams.map(t => (
                          <option key={t.id} value={t.loginId}>
                            {t.name} (Owner: {t.owner}) [{t.loginId}]
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className="form-label" style={{ margin: 0 }}>Team Login ID</label>
                        <button
                          type="button"
                          onClick={() => setIsManualInput(false)}
                          style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Choose from list
                        </button>
                      </div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. team01"
                        value={customLoginId}
                        onChange={(e) => setCustomLoginId(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Team Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        className="form-input"
                        value={teamPass}
                        onChange={(e) => setTeamPass(e.target.value)}
                        placeholder="Enter team password"
                        required
                      />
                      <Key size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-gold"
                    style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
                  >
                    {loading ? 'Logging In...' : 'Join Auction Room'} <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick 1-Click Fast Login / Demo Section */}
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', textAlign: 'center' }}>
              ⚡ Fast 1-Click Access
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => quickDemoLogin('host')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.45rem' }}
              >
                👑 Host (Admin)
              </button>
              {availableTeams.slice(0, 4).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => quickDemoLogin('team', t.loginId)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.45rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  title={`${t.name} (Owner: ${t.owner})`}
                >
                  🛡️ {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
