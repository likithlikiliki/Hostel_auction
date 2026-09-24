import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import PlayerAvatar from '../components/PlayerAvatar';
import { formatPurse } from '../utils/formatCurrency';
import {
  History,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function AuctionHistory() {
  const { history } = useAuction();
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  const filteredHistory = history.filter(item => {
    const matchesStatus = filterStatus === 'All' || item.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = !search.trim() || 
      item.playerName.toLowerCase().includes(search.toLowerCase()) ||
      (item.teamName && item.teamName.toLowerCase().includes(search.toLowerCase())) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    window.open('http://localhost:5000/api/auction/history/export', '_blank');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Auction History & Log</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Complete chronological audit log of all auctioned cricketers, final prices, and franchise acquisitions.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-secondary">
          <Download size={16} /> Export History (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by player, category, or franchise..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Sold', 'Unsold'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className="btn btn-sm"
                style={{
                  background: filterStatus === st ? 'var(--gold-primary)' : 'rgba(255,255,255,0.06)',
                  color: filterStatus === st ? '#000' : 'var(--text-muted)',
                  border: '1px solid ' + (filterStatus === st ? 'var(--gold-primary)' : 'var(--border-subtle)')
                }}
              >
                {st} ({st === 'All' ? history.length : history.filter(h => h.status.toLowerCase() === st.toLowerCase()).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Player Name</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Final Price</th>
                <th>Winning Franchise</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-dim)' }}>
                    <History size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <div>No auction records found. Start bidding in Live Auction!</div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map(item => {
                  const isSold = item.status === 'Sold';
                  return (
                    <tr key={item.id}>
                      <td style={{ width: '60px' }}>
                        <PlayerAvatar photoUrl={item.photoUrl} name={item.playerName} size="sm" category={item.category} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#fff' }}>{item.playerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {item.playerId}</div>
                      </td>
                      <td>
                        <span className={`badge-category cat-${(item.category || 'Batsman').toLowerCase().replace(/[^a-z]/g, '')}`}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                          {formatPurse(item.basePrice || 0)}
                        </div>
                      </td>
                      <td>
                        {isSold ? (
                          <div style={{ fontWeight: 800, color: 'var(--gold-bright)', fontSize: '1.05rem' }}>
                            {formatPurse(item.finalPrice || 0)}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {isSold && item.teamName ? (
                          <strong style={{ color: '#38BDF8', fontSize: '0.95rem' }}>
                            🏆 {item.teamName}
                          </strong>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill status-${item.status.toLowerCase()}`}>
                          {item.status === 'Sold' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
