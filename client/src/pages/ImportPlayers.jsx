import React, { useState, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';
import { API_BASE } from '../config/api';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';

export default function ImportPlayers({ setActiveTab }) {
  const { refreshData, showToast } = useAuction();

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setImportResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setImportResult(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a CSV or Excel file', 'danger');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/players/import-file`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setImportResult(data);
        showToast(data.message, 'success');
        refreshData();
      } else {
        showToast(data.message || 'Import failed', 'danger');
      }
    } catch (err) {
      showToast('Server error during import', 'danger');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvRows = [
      ['Player ID', 'Player Name', 'Category', 'Base Price', 'Photo'],
      ['P101', 'Rahul Kumar', 'Batsman', '500', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
      ['P102', 'Akash Patel', 'Bowler', '300', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
      ['P103', 'Manoj Sharma', 'All-Rounder', '700', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'],
      ['P104', 'Suresh Raina', 'Wicket Keeper', '400', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400'],
      ['P105', 'Vinay Kumar', 'Batsman', '500', '']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'cricket_players_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Import Players (Bulk Upload)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Upload CSV or Excel spreadsheets containing multiple cricket players at once.
          </p>
        </div>

        <button onClick={downloadSampleCSV} className="btn btn-secondary">
          <Download size={16} /> Download Sample CSV Template
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Upload Box */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Upload Spreadsheet</h3>

          <form onSubmit={handleUploadSubmit}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed ' + (dragOver ? 'var(--gold-primary)' : 'var(--border-bright)'),
                borderRadius: '16px',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'rgba(245, 158, 11, 0.05)' : 'rgba(7, 11, 25, 0.4)',
                transition: 'all 0.2s',
                marginBottom: '1.25rem'
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                style={{ display: 'none' }}
              />

              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--gold-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <UploadCloud size={30} />
              </div>

              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                {file ? file.name : 'Choose a file or drag & drop here'}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Supports <code>.CSV</code> and <code>.XLSX / .XLS</code> formats
              </p>
            </div>

            {file && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileSpreadsheet size={20} color="#10B981" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{file.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="btn btn-outline btn-sm"
                  style={{ color: '#EF4444' }}
                >
                  Remove
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="btn btn-gold"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              {uploading ? 'Processing File...' : 'Import Player List'} <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Expected Format Documentation */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Expected Column Headers</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Ensure your spreadsheet columns match the following headers (order does not matter):
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(7, 11, 25, 0.5)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--gold-bright)' }}>Player ID</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Optional (Auto-generated if empty)</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>e.g. <code>P001</code>, <code>P002</code></div>
            </div>

            <div style={{ background: 'rgba(7, 11, 25, 0.5)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem' }}>
                <span style={{ color: '#fff' }}>Player Name</span>
                <span style={{ color: '#EF4444', fontSize: '0.75rem' }}>Required</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Full name of student/cricketer</div>
            </div>

            <div style={{ background: 'rgba(7, 11, 25, 0.5)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem' }}>
                <span style={{ color: '#fff' }}>Category</span>
                <span style={{ color: '#EF4444', fontSize: '0.75rem' }}>Required</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                <code>Batsman</code>, <code>Bowler</code>, <code>All-Rounder</code>, or <code>Wicket Keeper</code>
              </div>
            </div>

            <div style={{ background: 'rgba(7, 11, 25, 0.5)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem' }}>
                <span style={{ color: '#fff' }}>Base Price</span>
                <span style={{ color: '#EF4444', fontSize: '0.75rem' }}>Required</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Integer value in INR (e.g. <code>500</code>)</div>
            </div>

            <div style={{ background: 'rgba(7, 11, 25, 0.5)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem' }}>
                <span style={{ color: '#38BDF8' }}>Photo / PhotoUrl</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Optional</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Direct web link to image. You can also upload photos manually in Player Management.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Result Feedback */}
      {importResult && (
        <div className="card" style={{ borderColor: '#10B981', background: 'rgba(16, 185, 129, 0.06)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 color="#10B981" size={24} />
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34D399' }}>Import Completed Successfully!</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  {importResult.importedCount} players were added to the tournament pool.
                </p>
              </div>
            </div>

            <button onClick={() => setActiveTab('players')} className="btn btn-gold">
              View Player Roster <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'rgba(7, 11, 25, 0.6)', borderRadius: '10px', padding: '0.75rem' }}>
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Base Price</th>
                </tr>
              </thead>
              <tbody>
                {importResult.players.map(p => (
                  <tr key={p.id}>
                    <td><code>{p.id}</code></td>
                    <td style={{ fontWeight: 700 }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td>₹{p.basePrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
