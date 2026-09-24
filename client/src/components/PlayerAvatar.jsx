import React, { useState } from 'react';
import { User } from 'lucide-react';

export default function PlayerAvatar({ photoUrl, name = '', size = 'md', category = 'Batsman' }) {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: { width: '40px', height: '40px', fontSize: '1rem', radius: '8px' },
    md: { width: '64px', height: '64px', fontSize: '1.4rem', radius: '12px' },
    lg: { width: '120px', height: '120px', fontSize: '2.5rem', radius: '16px' },
    xl: { width: '220px', height: '220px', fontSize: '4rem', radius: '20px' }
  };

  const dim = sizeMap[size] || sizeMap.md;

  // Resolve photoUrl (if relative path, prefix with localhost:5000)
  let src = photoUrl;
  if (photoUrl && photoUrl.startsWith('/uploads')) {
    src = `http://localhost:5000${photoUrl}`;
  }

  const categoryBg = {
    'Batsman': 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
    'Bowler': 'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)',
    'All-Rounder': 'linear-gradient(135deg, #A855F7 0%, #6B21A8 100%)',
    'Wicket Keeper': 'linear-gradient(135deg, #10B981 0%, #047857 100%)'
  };

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'CR';

  if (!src || imgError) {
    return (
      <div
        style={{
          width: dim.width,
          height: dim.height,
          borderRadius: dim.radius,
          background: categoryBg[category] || categoryBg['Batsman'],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontFamily: 'var(--font-display)',
          fontSize: dim.fontSize,
          border: '2px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          flexShrink: 0
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      style={{
        width: dim.width,
        height: dim.height,
        borderRadius: dim.radius,
        objectFit: 'cover',
        objectPosition: 'top center',
        border: '2px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
        flexShrink: 0
      }}
    />
  );
}
