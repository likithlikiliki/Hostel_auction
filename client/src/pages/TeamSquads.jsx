import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { useAuth } from '../context/AuthContext';
import PlayerAvatar from '../components/PlayerAvatar';
import { formatPurse } from '../utils/formatCurrency';
import {
  Trophy,
  Users,
  DollarSign,
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';

export default function TeamSquads({ specificTeamId = null }) {
  const { teams } = useAuction();
  const { user, role } = useAuth();

  const [selectedTeamFilter, setSelectedTeamFilter] = useState(
    specificTeamId || (role === 'TEAM_LEADER' ? user?.teamId : 'All')
  );

  const filteredTeams = selectedTeamFilter === 'All'
    ? teams
    : teams.filter(t => t.id === selectedTeamFilter);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {specificTeamId ? 'My Team Squad' : 'Franchise Squad Rosters'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Complete team squads, player acquisitions, and squad budget expenditures.
          </p>
        </div>

        {/* Team Selector Filter */}
        {!specificTeamId && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedTeamFilter('All')}
              className="btn btn-sm"
              style={{
                background: selectedTeamFilter === 'All' ? 'var(--gold-primary)' : 'rgba(255,255,255,0.08)',
                color: selectedTeamFilter === 'All' ? '#000' : '#fff'
              }}
            >
              All Teams ({teams.length})
            </button>
            {teams.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTeamFilter(t.id)}
                className="btn btn-sm"
                style={{
                  background: selectedTeamFilter === t.id ? (t.color || 'var(--blue-accent)') : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontWeight: selectedTeamFilter === t.id ? 700 : 500
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Squad Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {filteredTeams.map(team => {
          const count = team.players ? team.players.length : 0;
          const slotsLeft = Math.max(0, 10 - count);
          const isMinMet = count >= 8;
          const isFull = count >= 10;

          // Category distribution
          const catCount = {
            'Batsman': 0,
            'Bowler': 0,
            'All-Rounder': 0,
            'Wicket Keeper': 0
          };
          (team.players || []).forEach(p => {
            if (catCount[p.category] !== undefined) catCount[p.category]++;
          });

          return (
            <div key={team.id} className="card" style={{ position: 'relative', padding: '1.75rem' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: team.color || 'var(--gold-primary)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }} />

              {/* Team Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1.25rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{team.name}</h3>
                    {isMinMet ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34D399',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        <CheckCircle2 size={13} /> {isFull ? 'SQUAD FULL (10/10)' : 'MIN SQUAD MET'}
                      </span>
                    ) : (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#FBBF24',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        <AlertTriangle size={13} /> INCOMPLETE ({count}/8 MIN)
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
                    Franchise Owner: <strong style={{ color: '#fff' }}>{team.owner}</strong> • Login: <code>{team.loginId}</code>
                  </div>
                </div>

                {/* Team Financials Summary */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>ROSTER CAPACITY</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{count} / 10</div>
                  </div>
                  <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>REMAINING PURSE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38BDF8' }}>
                      {formatPurse(team.remainingPurse ?? ((team.totalBudget || 1000000000) - (team.totalSpent || 0)))}
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOTAL SPENT</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-bright)' }}>
                      {formatPurse(team.totalSpent || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown Bar */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span className="badge-category cat-batsman">
                  Batsmen: {catCount['Batsman']}
                </span>
                <span className="badge-category cat-bowler">
                  Bowlers: {catCount['Bowler']}
                </span>
                <span className="badge-category cat-allrounder">
                  All-Rounders: {catCount['All-Rounder']}
                </span>
                <span className="badge-category cat-wk">
                  WKs: {catCount['Wicket Keeper']}
                </span>
              </div>

              {/* Player Cards Grid */}
              {count === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(7, 11, 25, 0.4)', borderRadius: '12px', color: 'var(--text-dim)' }}>
                  No players acquired yet by this franchise.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                  {team.players.map((p, idx) => (
                    <div key={p.id || idx} style={{
                      background: 'rgba(7, 11, 25, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem'
                    }}>
                      <PlayerAvatar photoUrl={p.photoUrl} name={p.name} size="md" category={p.category} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        <div style={{ margin: '3px 0' }}>
                          <span className={`badge-category cat-${(p.category || 'Batsman').toLowerCase().replace(/[^a-z]/g, '')}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                            {p.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-bright)' }}>
                          Sold: {formatPurse(p.soldPrice || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
