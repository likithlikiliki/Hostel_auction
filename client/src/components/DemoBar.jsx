import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, ExternalLink, RefreshCw } from 'lucide-react';

export default function DemoBar() {
  const { user, role, availableTeams, quickSwitch } = useAuth();

  return (
    <div style={{
      background: 'linear-gradient(90deg, #0A1128 0%, #16203D 50%, #0A1128 100%)',
      borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
      padding: '0.45rem 1rem',
      fontSize: '0.82rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.5rem',
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ 
          background: 'rgba(245, 158, 11, 0.2)', 
          color: '#FBBF24', 
          padding: '0.15rem 0.5rem', 
          borderRadius: '4px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          fontSize: '0.72rem'
        }}>
          QUICK SWITCHER
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Active as: <strong style={{ color: '#fff' }}>{role === 'HOST' ? 'Host (Controller)' : user?.name || 'Guest'}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => quickSwitch('HOST')}
          className="btn btn-sm"
          style={{
            padding: '0.25rem 0.6rem',
            fontSize: '0.76rem',
            background: role === 'HOST' ? 'var(--gold-primary)' : 'rgba(255,255,255,0.08)',
            color: role === 'HOST' ? '#000' : '#fff',
            border: '1px solid ' + (role === 'HOST' ? 'var(--gold-primary)' : 'rgba(255,255,255,0.15)')
          }}
        >
          <Shield size={12} /> Host Control
        </button>

        {availableTeams.map(t => {
          const isActive = role === 'TEAM_LEADER' && user?.teamId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => quickSwitch('TEAM_LEADER', t.id)}
              className="btn btn-sm"
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.76rem',
                background: isActive ? (t.color || 'var(--blue-accent)') : 'rgba(255,255,255,0.06)',
                color: '#fff',
                border: '1px solid ' + (isActive ? '#fff' : 'rgba(255,255,255,0.1)'),
                fontWeight: isActive ? 700 : 500
              }}
            >
              <Users size={12} /> {t.name}
            </button>
          );
        })}

        <button
          onClick={() => window.open(window.location.href, '_blank')}
          title="Open in new window to simulate multiple bidders"
          className="btn btn-outline"
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            marginLeft: '0.25rem'
          }}
        >
          <ExternalLink size={12} /> New Tab
        </button>
      </div>
    </div>
  );
}
