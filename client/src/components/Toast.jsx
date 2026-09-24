import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useAuction();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle color="#10B981" size={20} />,
    warning: <AlertTriangle color="#F59E0B" size={20} />,
    danger: <XCircle color="#EF4444" size={20} />,
    info: <Info color="#38BDF8" size={20} />
  };

  const borders = {
    success: 'rgba(16, 185, 129, 0.4)',
    warning: 'rgba(245, 158, 11, 0.4)',
    danger: 'rgba(239, 68, 68, 0.4)',
    info: 'rgba(56, 189, 248, 0.4)'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 1000,
      background: 'rgba(13, 21, 39, 0.95)',
      backdropFilter: 'blur(16px)',
      border: `1px solid ${borders[toast.type] || borders.info}`,
      borderRadius: '12px',
      padding: '0.85rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      color: '#fff',
      fontSize: '0.9rem',
      maxWidth: '420px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {icons[toast.type] || icons.info}
      <span style={{ fontWeight: 500 }}>{toast.message}</span>
    </div>
  );
}
