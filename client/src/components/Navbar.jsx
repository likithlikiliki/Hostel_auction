import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UploadCloud,
  Radio,
  History,
  ShieldAlert,
  Settings,
  Volume2,
  VolumeX,
  LogOut,
  Trophy,
  Shield
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, role, logout } = useAuth();
  const { connected, auction, soundEnabled, setSoundEnabled } = useAuction();

  const isHost = role === 'HOST';

  const hostNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'players', label: 'Players', icon: UserPlus },
    { id: 'import', label: 'Import Players', icon: UploadCloud },
    { id: 'live-auction', label: 'Live Auction', icon: Radio, highlight: true },
    { id: 'squads', label: 'Team Squads', icon: Trophy },
    { id: 'history', label: 'Auction History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const teamNavItems = [
    { id: 'live-auction', label: 'Live Auction', icon: Radio, highlight: true },
    { id: 'my-team', label: 'My Squad', icon: Trophy },
    { id: 'squads', label: 'All Squads', icon: Users },
    { id: 'history', label: 'Auction History', icon: History },
  ];

  const navItems = isHost ? hostNavItems : teamNavItems;

  return (
    <header style={{
      background: 'rgba(13, 21, 39, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0.65rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab(isHost ? 'dashboard' : 'live-auction')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.65rem', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
          }}>
            <span style={{ fontSize: '1.25rem' }}>🏏</span>
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1, color: '#fff' }}>
              HOSTEL CRICKET <span style={{ color: 'var(--gold-primary)' }}>AUCTION</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
              <span className={`live-dot ${connected ? '' : 'disconnected'}`} style={{ backgroundColor: connected ? '#10B981' : '#EF4444', width: '7px', height: '7px' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {connected ? 'LIVE NETWORK' : 'CONNECTING...'}
              </span>
              {auction.status === 'BIDDING' && (
                <span style={{
                  fontSize: '0.68rem',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#F87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  BIDDING ACTIVE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', padding: '0.2rem 0' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="btn btn-sm"
                style={{
                  background: isActive 
                    ? (item.highlight ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'rgba(255, 255, 255, 0.12)')
                    : 'transparent',
                  color: isActive 
                    ? (item.highlight ? '#000' : '#fff') 
                    : (item.highlight ? '#FBBF24' : 'var(--text-muted)'),
                  border: isActive 
                    ? (item.highlight ? '1px solid var(--gold-primary)' : '1px solid var(--border-bright)') 
                    : '1px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: '8px'
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-outline"
            style={{ padding: '0.4rem', borderRadius: '8px', color: soundEnabled ? 'var(--gold-primary)' : 'var(--text-dim)' }}
            title={soundEnabled ? 'Mute auction sounds' : 'Enable auction sounds'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* User Role Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            padding: '0.35rem 0.75rem',
            borderRadius: '10px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: isHost ? 'var(--gold-primary)' : (user?.color || 'var(--blue-accent)'),
              color: isHost ? '#000' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem'
            }}>
              {isHost ? <Shield size={16} /> : (user?.name?.[0] || 'T')}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                {isHost ? 'Host Controller' : user?.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {isHost ? 'Administrator' : `Owner: ${user?.owner || 'Leader'}`}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', color: '#F87171' }}
            title="Logout"
          >
            <LogOut size={16} />
            <span style={{ display: 'none', sm: 'inline' }}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
