import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, type = 'gold' }) {
  if (!isOpen) return null;

  const btnClass = type === 'danger' ? 'btn-danger' : 'btn-gold';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', textAlign: 'center' }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: type === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          color: type === 'danger' ? '#EF4444' : '#F59E0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <AlertTriangle size={28} />
        </div>

        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button onClick={onCancel} className="btn btn-secondary" style={{ flex: 1 }}>
            <X size={16} /> {cancelText}
          </button>
          <button onClick={onConfirm} className={`btn ${btnClass}`} style={{ flex: 1 }}>
            <Check size={16} /> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
