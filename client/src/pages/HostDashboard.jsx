import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import { formatPurse, formatFullINR } from '../utils/formatCurrency';
import { API_BASE } from '../config/api';
import {
  Users,
  UserCheck,
  UserX,
  Radio,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Award,
  Wallet
} from 'lucide-react';

export default function HostDashboard({ setActiveTab }) {
  const { stats, teams, auction } = useAuction();
  const [validationData, setValidationData] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/teams/validation/summary`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setValidationData(data.validation);
      })
      .catch(err => console.error(err));
  }, [teams]);

  const totalPurseAllocated = teams.reduce((acc, t) => acc + (t.totalBudget || 1000000000), 0);
  const totalPurseRemaining = teams.reduce((acc, t) => acc + (t.remainingPurse || (t.totalBudget || 1000000000) - (t.totalSpent || 0)), 0);

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Host Command Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Tournament overview • <strong>₹100 Cr</strong> Purse per franchise • Live auction telemetry.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('live-auction')}
          className="btn btn-gold btn-lg"
          style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}
        >
          <Radio size={20} className={auction.status === 'BIDDING' ? 'live-dot' : ''} />
          Go to Live Auction
        </button>
      </div>

      {/* Main Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Total Teams */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL TEAMS</span>
            <Users size={20} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{stats.totalTeams || teams.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Purse: 100 Cr each</div>
        </div>

        {/* Total Tournament Purse */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL PURSE</span>
            <Wallet size={20} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold-bright)' }}>{formatPurse(totalPurseAllocated)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>{formatPurse(totalPurseRemaining)} remaining</div>
        </div>

        {/* Total Players */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL PLAYERS</span>
            <Award size={20} color="#06B6D4" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{stats.totalPlayers}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>In Tournament Pool</div>
        </div>

        {/* Available */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>AVAILABLE</span>
            <Clock size={20} color="#60A5FA" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#60A5FA' }}>{stats.available}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Ready for bidding</div>
        </div>

        {/* Sold */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>SOLD</span>
            <UserCheck size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981' }}>{stats.sold}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Assigned to squads</div>
        </div>

        {/* Unsold */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>UNSOLD</span>
            <UserX size={20} color="#EF4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#EF4444' }}>{stats.unsold}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Passed without bids</div>
        </div>
      </div>

      {/* Live Auction Banner Status */}
      <div className="card card-gold" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)'
            }}>
              <Radio size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>AUCTION STATUS:</h3>
                <span className={`status-pill status-${auction.status.toLowerCase().replace('_', '-')}`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem' }}>
                  {auction.status.replace('_', ' ')}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {auction.currentPlayer 
                  ? `Current player: ${auction.currentPlayer.name} (${auction.currentPlayer.category}) • Current Bid: ₹${(auction.currentBid || 0).toLocaleString('en-IN')}`
                  : 'No player currently on the auction block. Click Next Player to draw.'}
              </p>
            </div>
          </div>

          <button onClick={() => setActiveTab('live-auction')} className="btn btn-gold">
            Open Controller <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Team Standings & Squad Progress Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Franchise Squads & Spending</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Minimum 8 players required per team. Maximum capacity is 10 players.
            </p>
          </div>
          <button onClick={() => setActiveTab('teams')} className="btn btn-outline btn-sm">
            Manage Teams
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <Users size={32} />
            </div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
              No teams have been created yet.
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
              Create teams before starting the auction. Each franchise requires at least 8 players.
            </p>
            <button onClick={() => setActiveTab('teams')} className="btn btn-gold btn-lg">
              + CREATE FIRST TEAM
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
            {teams.map(team => {
              const count = team.players ? team.players.length : 0;
              const slotsLeft = Math.max(0, 10 - count);
              const isMinMet = count >= 8;
              const isFull = count >= 10;
              const pct = Math.min(100, (count / 10) * 100);

              return (
                <div key={team.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                  {/* Team Top Accent Border */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: team.color || 'var(--gold-primary)' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{team.name}</h4>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Owner: <strong style={{ color: '#fff' }}>{team.owner}</strong>
                      </div>
                    </div>

                    {isMinMet ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34D399',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        <CheckCircle2 size={13} /> {isFull ? 'FULL' : 'VALID'}
                      </span>
                    ) : (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#FBBF24',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        <AlertTriangle size={13} /> {count}/8 MIN
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Squad Capacity</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>{count} / 10 Players</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: isFull ? 'var(--rose-danger)' : (team.color || 'var(--gold-primary)'),
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  {/* Financials & Slots Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.5rem',
                    background: 'rgba(7, 11, 25, 0.4)',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>PURSE LEFT</div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--gold-bright)' }}>
                        {formatPurse((team.totalBudget || 1000000000) - (team.totalSpent || 0))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SPENT</div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#94A3B8' }}>
                        {formatPurse(team.totalSpent || 0)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SLOTS</div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: slotsLeft > 0 ? '#38BDF8' : '#EF4444' }}>
                        {slotsLeft} Left
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
