import React from 'react';
import {
  List,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Gavel,
  Shuffle,
  ArrowUpRight
} from 'lucide-react';

export default function AuctionLogFeed({ logs = [], maxHeight = '220px' }) {
  const getLogIcon = (type) => {
    switch (type) {
      case 'start':
        return <Play size={13} color="#10B981" />;
      case 'bid_submit':
        return <CheckCircle2 size={13} color="#10B981" />;
      case 'timer_reset':
        return <RotateCcw size={13} color="#38BDF8" />;
      case 'bid_submit':
        return <ArrowUpRight size={13} color="#FBBF24" />;
      case 'pause':
        return <Pause size={13} color="#F59E0B" />;
      case 'resume':
        return <Play size={13} color="#10B981" />;
      case 'sold':
        return <Gavel size={13} color="#10B981" />;
      case 'unsold':
        return <XCircle size={13} color="#EF4444" />;
      case 'time_ended':
        return <Clock size={13} color="#F59E0B" />;
      case 'select':
      default:
        return <Shuffle size={13} color="#94A3B8" />;
    }
  };

  return (
    <div className="card" style={{ padding: '1rem', background: 'rgba(7, 11, 25, 0.65)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.88rem', color: '#fff' }}>
          <List size={15} color="var(--gold-primary)" /> Live Auction Activity Feed
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          {logs.length} events logged
        </span>
      </div>

      <div style={{
        maxHeight,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        paddingRight: '4px'
      }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
            No auction activity yet. Select a player and start bidding!
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                fontSize: '0.8rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                background: log.type === 'bid_submit'
                  ? 'rgba(16, 185, 129, 0.08)'
                  : log.type === 'timer_reset'
                  ? 'rgba(56, 189, 248, 0.08)'
                  : log.type === 'sold'
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'rgba(255, 255, 255, 0.02)',
                borderLeft: log.type === 'bid_submit'
                  ? '2px solid #10B981'
                  : log.type === 'timer_reset'
                  ? '2px solid #38BDF8'
                  : log.type === 'sold'
                  ? '2px solid var(--gold-primary)'
                  : '2px solid transparent'
              }}
            >
              <span style={{ marginTop: '2px', flexShrink: 0 }}>
                {getLogIcon(log.type)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap', marginTop: '1px' }}>
                {log.timeStr || (log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '')}
              </span>
              <span style={{ color: '#fff', wordBreak: 'break-word', flex: 1 }}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
