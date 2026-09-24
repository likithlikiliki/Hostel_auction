import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Pause, Zap } from 'lucide-react';

export default function CountdownTimer({ auction, size = 'lg' }) {
  const maxDuration = auction?.timerDurationSeconds || 10;
  const [timeLeft, setTimeLeft] = useState(maxDuration);
  const [msRemaining, setMsRemaining] = useState(maxDuration * 1000);
  const [animatingSec, setAnimatingSec] = useState(maxDuration);

  // Store the authoritative local target deadline
  const targetDeadlineRef = useRef(null);

  // Whenever biddingEndsAt or auction status updates, recalculate local target deadline
  useEffect(() => {
    if (auction?.status === 'BIDDING' && auction?.biddingEndsAt) {
      const serverNow = auction.serverTime || Date.now();
      const remainingMs = Math.max(0, auction.biddingEndsAt - serverNow);
      targetDeadlineRef.current = Date.now() + remainingMs;
    } else {
      targetDeadlineRef.current = null;
    }
  }, [auction?.biddingEndsAt, auction?.serverTime, auction?.status]);

  // High-frequency 50ms ticker for continuous 10, 9, 8, 7... countdown
  useEffect(() => {
    const tick = () => {
      if (!auction) return;

      if (auction.status === 'PAUSED') {
        const remainingMs = Math.max(0, auction.pausedRemainingMs ?? 0);
        const sec = Math.max(0, Math.ceil(remainingMs / 1000));
        setTimeLeft(sec);
        setMsRemaining(remainingMs);
        return;
      }

      if (auction.status === 'TIME_ENDED') {
        setTimeLeft(0);
        setMsRemaining(0);
        return;
      }

      if (auction.status !== 'BIDDING') {
        setTimeLeft(maxDuration);
        setMsRemaining(maxDuration * 1000);
        return;
      }

      if (targetDeadlineRef.current) {
        const diff = Math.max(0, targetDeadlineRef.current - Date.now());
        const sec = Math.max(0, Math.ceil(diff / 1000));
        setTimeLeft(sec);
        setMsRemaining(diff);
        setAnimatingSec(prev => {
          if (prev !== sec) return sec;
          return prev;
        });
      } else {
        setTimeLeft(maxDuration);
        setMsRemaining(maxDuration * 1000);
      }
    };

    tick();
    const interval = setInterval(tick, 50); // 50ms tick ensures smooth 10 9 8 animation
    return () => clearInterval(interval);
  }, [auction?.status, auction?.pausedRemainingMs, maxDuration]);

  const isBidding = auction?.status === 'BIDDING';
  const isPaused = auction?.status === 'PAUSED';
  const isTimeEnded = auction?.status === 'TIME_ENDED';
  const isWaiting = auction?.status === 'WAITING' || auction?.status === 'PLAYER_SELECTED';

  // Determine Visual State & Colors
  let colorTheme = '#10B981'; // Green (10-6s)
  let glowColor = 'rgba(16, 185, 129, 0.5)';
  let bgGradient = 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(7, 11, 25, 0.8) 70%)';

  if (isPaused) {
    colorTheme = '#F59E0B'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.4)';
    bgGradient = 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(7, 11, 25, 0.8) 70%)';
  } else if (isTimeEnded || (isBidding && timeLeft === 0)) {
    colorTheme = auction?.highestBidderTeamId ? '#38BDF8' : '#EF4444';
    glowColor = auction?.highestBidderTeamId ? 'rgba(56, 189, 248, 0.6)' : 'rgba(239, 68, 68, 0.6)';
    bgGradient = auction?.highestBidderTeamId 
      ? 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(7, 11, 25, 0.8) 70%)'
      : 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(7, 11, 25, 0.8) 70%)';
  } else if (timeLeft <= 2) {
    colorTheme = '#EF4444'; // Urgent Red (2-1s)
    glowColor = 'rgba(239, 68, 68, 0.85)';
    bgGradient = 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(7, 11, 25, 0.85) 70%)';
  } else if (timeLeft <= 5) {
    colorTheme = '#F59E0B'; // Warning Amber (5-3s)
    glowColor = 'rgba(245, 158, 11, 0.65)';
    bgGradient = 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(7, 11, 25, 0.8) 70%)';
  }

  // Circular SVG ring dimensions
  const isSm = size === 'sm';
  const radius = isSm ? 42 : 68;
  const strokeWidth = isSm ? 7 : 10;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, Math.max(0, msRemaining / (maxDuration * 1000)));
  const strokeDashoffset = circumference - progressRatio * circumference;
  const dimension = (radius + strokeWidth) * 2;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0.5rem auto 1rem',
        userSelect: 'none',
        width: '100%',
        maxWidth: '360px'
      }}
    >
      {/* High-Impact Visual Circular Countdown */}
      <div
        key={animatingSec}
        className={isBidding ? (timeLeft <= 2 ? 'countdown-pulse-urgent' : 'countdown-tick-pop') : ''}
        style={{
          position: 'relative',
          width: `${dimension}px`,
          height: `${dimension}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: bgGradient,
          boxShadow: isBidding || isPaused ? `0 0 35px ${glowColor}` : '0 0 15px rgba(0,0,0,0.5)',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
        }}
      >
        <svg
          width={dimension}
          height={dimension}
          style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}
        >
          {/* Outer glow ring track */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Smooth animated active progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={colorTheme}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: isBidding ? 'stroke-dashoffset 0.06s linear, stroke 0.25s ease' : 'none',
              filter: `drop-shadow(0 0 6px ${colorTheme})`
            }}
          />
        </svg>

        {/* Center Giant Countdown Digits (10, 9, 8...) */}
        <div style={{ textAlign: 'center', zIndex: 2, padding: '0.5rem' }}>
          {isPaused ? (
            <div>
              <div style={{
                fontSize: isSm ? '2rem' : '3.6rem',
                fontWeight: 950,
                color: colorTheme,
                lineHeight: 1,
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                {String(timeLeft).padStart(2, '0')}
              </div>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#FBBF24',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginTop: '4px'
              }}>
                PAUSED
              </div>
            </div>
          ) : isTimeEnded || (isBidding && timeLeft === 0) ? (
            <div>
              <div style={{
                fontSize: isSm ? '1.5rem' : '2.4rem',
                fontWeight: 950,
                color: colorTheme,
                lineHeight: 1
              }}>
                00
              </div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: colorTheme,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: '4px'
              }}>
                TIME UP
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                fontSize: isSm ? '2.4rem' : '4.2rem',
                fontWeight: 950,
                color: colorTheme,
                lineHeight: 1,
                fontFamily: 'monospace, system-ui, sans-serif',
                textShadow: `0 0 25px ${glowColor}`
              }}>
                {String(timeLeft).padStart(2, '0')}
              </div>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginTop: '2px'
              }}>
                SECONDS
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Progress Bar for extra visibility */}
      <div style={{
        width: '100%',
        maxWidth: '280px',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '9999px',
        overflow: 'hidden',
        marginTop: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{
          height: '100%',
          width: `${progressRatio * 100}%`,
          background: colorTheme,
          boxShadow: `0 0 10px ${colorTheme}`,
          borderRadius: '9999px',
          transition: isBidding ? 'width 0.06s linear, background 0.2s ease' : 'none'
        }} />
      </div>

      {/* Dynamic Status Callout Badge */}
      <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
        {isBidding ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            background: timeLeft <= 2 
              ? 'rgba(239, 68, 68, 0.25)' 
              : timeLeft <= 5 
              ? 'rgba(245, 158, 11, 0.2)' 
              : 'rgba(16, 185, 129, 0.2)',
            border: `1px solid ${colorTheme}`,
            fontSize: '0.88rem',
            fontWeight: 800,
            color: colorTheme
          }}>
            <span className="live-dot" style={{ backgroundColor: colorTheme, width: '9px', height: '9px' }} />
            {timeLeft <= 2 ? (
              <span className="countdown-blink" style={{ color: '#EF4444' }}>
                🚨 FINAL CALL: {timeLeft}s REMAINING!
              </span>
            ) : timeLeft <= 5 ? (
              <span style={{ color: '#FBBF24' }}>
                ⚠️ TICKING: {timeLeft}s LEFT
              </span>
            ) : (
              <span>⚡ LIVE BIDDING: {timeLeft}s LEFT</span>
            )}
          </div>
        ) : isPaused ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#FBBF24',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '0.3rem 0.85rem',
            borderRadius: '9999px'
          }}>
            <Pause size={14} /> Auction Paused ({timeLeft}s frozen)
          </div>
        ) : isTimeEnded ? (
          <div style={{
            fontSize: '0.88rem',
            fontWeight: 800,
            color: '#38BDF8',
            background: 'rgba(56, 189, 248, 0.18)',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            border: '1px solid rgba(56, 189, 248, 0.4)'
          }}>
            🏁 Bidding Closed (00s) — Awaiting Host Sale
          </div>
        ) : isWaiting ? (
          <div style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontWeight: 700,
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)'
          }}>
            ⏱️ Timer: {maxDuration}s per accepted bid
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes countdownTickPop {
          0% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        .countdown-tick-pop {
          animation: countdownTickPop 0.18s ease-out;
        }
        @keyframes countdownPulseUrgent {
          0% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.06); filter: brightness(1.3); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        .countdown-pulse-urgent {
          animation: countdownPulseUrgent 0.5s infinite ease-in-out;
        }
        @keyframes countdownBlink {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        .countdown-blink {
          animation: countdownBlink 0.4s infinite alternate;
        }
      `}</style>
    </div>
  );
}
