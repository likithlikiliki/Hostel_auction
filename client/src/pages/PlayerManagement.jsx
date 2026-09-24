import React, { useState, useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';
import PlayerAvatar from '../components/PlayerAvatar';
import { formatPurse } from '../utils/formatCurrency';
import {
  UserPlus,
  Search,
  Filter,
  Upload,
  Image as ImageIcon,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

export default function PlayerManagement() {
  const { refreshData, showToast } = useAuction();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  // Form State
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Batsman');
  const [basePrice, setBasePrice] = useState(500);
  const [status, setStatus] = useState('Available');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');

  const fileInputRef = useRef(null);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/players?`;
      if (selectedCategory !== 'All') url += `category=${selectedCategory}&`;
      if (selectedStatus !== 'All') url += `status=${selectedStatus}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPlayers(data.players);
      }
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [search, selectedCategory, selectedStatus]);

  const openCreateModal = () => {
    setEditingPlayer(null);
    setId(`P${String(Date.now()).slice(-4)}`);
    setName('');
    setCategory('Batsman');
    setBasePrice(500);
    setStatus('Available');
    setPhotoUrl('');
    setPhotoPreview('');
    setShowModal(true);
  };

  const openEditModal = (player) => {
    setEditingPlayer(player);
    setId(player.id);
    setName(player.name);
    setCategory(player.category);
    setBasePrice(player.basePrice);
    setStatus(player.status);
    setPhotoUrl(player.photoUrl || '');
    setPhotoPreview(player.photoUrl || '');
    setShowModal(true);
  };

  // Handle Photo File Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a JPG, JPEG, PNG, or WEBP image file', 'danger');
      return;
    }

    // Local Preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // Upload to server
    setPhotoUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch('http://localhost:5000/api/players/upload-photo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPhotoUrl(data.photoUrl);
        showToast('Photo uploaded successfully', 'success');
      } else {
        showToast(data.message || 'Photo upload failed', 'danger');
      }
    } catch (err) {
      showToast('Server upload error', 'danger');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Player Name is required', 'danger');
      return;
    }

    try {
      const url = editingPlayer
        ? `http://localhost:5000/api/players/${editingPlayer.id}`
        : 'http://localhost:5000/api/players';
      const method = editingPlayer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name,
          category,
          basePrice: Number(basePrice),
          status,
          photoUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingPlayer ? 'Player updated' : 'Player added to roster', 'success');
        setShowModal(false);
        fetchPlayers();
        refreshData();
      } else {
        showToast(data.message || 'Failed to save player', 'danger');
      }
    } catch (err) {
      showToast('Server error', 'danger');
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Delete player "${playerName}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/players/${playerId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Player ${playerName} deleted`, 'success');
        fetchPlayers();
        refreshData();
      } else {
        showToast(data.message || 'Failed to delete player', 'danger');
      }
    } catch (err) {
      showToast('Server error', 'danger');
    }
  };

  const categories = ['All', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper'];
  const statuses = ['All', 'Available', 'In Auction', 'Sold', 'Unsold'];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Player Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Register cricket players, upload player photos, set base prices, and manage auction status.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-gold">
          <UserPlus size={18} /> Add New Player
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by player name, ID, or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', padding: '0.2rem 0' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="btn btn-sm"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  background: selectedCategory === cat ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: selectedCategory === cat ? '#000' : 'var(--text-muted)',
                  border: '1px solid ' + (selectedCategory === cat ? 'var(--gold-primary)' : 'var(--border-subtle)')
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', fontSize: '0.85rem' }}
            >
              {statuses.map(st => (
                <option key={st} value={st}>Status: {st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Player ID</th>
                <th>Player Name</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Status</th>
                <th>Sold To</th>
                <th>Sold Price</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                    No players found matching current filters.
                  </td>
                </tr>
              ) : (
                players.map(p => (
                  <tr key={p.id}>
                    <td style={{ width: '60px' }}>
                      <PlayerAvatar photoUrl={p.photoUrl} name={p.name} size="sm" category={p.category} />
                    </td>
                    <td>
                      <code style={{ color: 'var(--gold-bright)', fontWeight: 700 }}>{p.id}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{p.name}</div>
                    </td>
                    <td>
                      <span className={`badge-category cat-${p.category.toLowerCase().replace(/[^a-z]/g, '')}`}>
                        {p.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {formatPurse(p.basePrice || 0)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill status-${p.status.toLowerCase().replace(' ', '-')}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.soldTeamName ? (
                        <strong style={{ color: '#38BDF8' }}>{p.soldTeamName}</strong>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {p.soldPrice ? (
                        <strong style={{ color: '#34D399' }}>{formatPurse(p.soldPrice)}</strong>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="Edit Player"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(p.id, p.name)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.55rem', color: '#EF4444' }}
                          title="Delete Player"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>
                {editingPlayer ? 'Edit Player' : 'Add New Player'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-outline" style={{ padding: '0.3rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePlayer}>
              {/* Photo Upload Section with Live Preview */}
              <div style={{
                background: 'rgba(7, 11, 25, 0.6)',
                border: '1px dashed var(--border-bright)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <PlayerAvatar photoUrl={photoPreview || photoUrl} name={name || 'Player'} size="lg" category={category} />

                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Player Photo</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                      Accepts JPG, JPEG, PNG, WEBP (Max 5MB)
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      style={{ display: 'none' }}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={photoUploading}
                        className="btn btn-secondary btn-sm"
                      >
                        <Upload size={14} /> {photoUploading ? 'Uploading...' : 'Upload Photo'}
                      </button>

                      {(photoUrl || photoPreview) && (
                        <button
                          type="button"
                          onClick={() => { setPhotoUrl(''); setPhotoPreview(''); }}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#EF4444' }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Image URL input option */}
                <div style={{ marginTop: '1rem', textAlign: 'left' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Or paste direct Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    placeholder="https://example.com/player-photo.jpg"
                    value={photoUrl}
                    onChange={e => {
                      setPhotoUrl(e.target.value);
                      setPhotoPreview(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Player ID *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={id}
                    onChange={e => setId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Player Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Virat Kohli"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket Keeper">Wicket Keeper</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    className="form-input"
                    value={basePrice}
                    onChange={e => setBasePrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Player Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="In Auction">In Auction</option>
                  <option value="Sold">Sold</option>
                  <option value="Unsold">Unsold</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>
                  {editingPlayer ? 'Update Player' : 'Save Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
