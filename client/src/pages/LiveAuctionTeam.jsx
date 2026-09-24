import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import PlayerAvatar from '../components/PlayerAvatar';
import CountdownTimer from '../components/CountdownTimer';
import AuctionLogFeed from '../components/AuctionLogFeed';
import { formatPurse, formatFullINR } from '../utils/formatCurrency';
import {
  Trophy,
  DollarSign,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Wallet
} from 'lucide-react';

export default function LiveAuctionTeam({ setActiveTab }) {
  const { user } = useAuth();
  const { auction, teams, submitBid } = useAuction();

  const [submitting, setSubmitting] = useState(false);

  const myTeam = teams.find(t => t.id === user?.teamId) || {
    name: user?.name || 'My Team',
    owner: user?.owner || 'Leader',
    players: [],
    totalBudget: 1000000000,
    totalSpent: 0
  };

  const currentPlayer = auction.currentPlayer;
  const isBidding = auction.status === 'BIDDING';
  const isPaused = auction.status === 'PAUSED';
  const isSold = auction.status === 'SOLD';
  const isUnsold = auction.status === 'UNSOLD';
  const isWaiting = auction.status === 'WAITING' || auction.status === 'PLAYER_SELECTED';
  const isTimeEnded = auction.status === 'TIME_ENDED';

  const squadCount = myTeam.players ? myTeam.players.length : 0;
  const isSquadFull = squadCount >= 10;
  const slotsRemaining = Math.max(0, 10 - squadCount);

  // Purse calculation
  const totalBudget = myTeam.totalBudget || 1000000000;
  const remainingPurse = totalBudget - (myTeam.totalSpent || 0);

  // Calculate Next Minimum Bid
  const increment = auction.bidIncrement || 100;
  let nextBidAmount = (auction.currentBid || 0) + increment;
  if (!auction.highestBidderTeamId && currentPlayer) {
    nextBidAmount = currentPlayer.basePrice;
  }

  const hasEnoughPurse = remainingPurse >= nextBidAmount;

  // The server remains authoritative; the button is only an ergonomic hint.
  const isHighestBidder = auction.highestBidderTeamId === user?.teamId;

  const handleSubmitBid = async () => {
    if (!isBidding || isSquadFull || !hasEnoughPurse) return;
    setSubmitting(true);
    await submitBid(nextBidAmount);
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Team Status Card (Mobile-First Top Bar) */}
      <div className="card" style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(19, 30, 56, 0.95), rgba(7, 11, 25, 0.95))',
        border: '1px solid ' + (user?.color ? `${user.color}60` : 'var(--border-bright)')
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              FRANCHISE ARENA
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: user?.color || 'var(--gold-primary)' }}>
              {myTeam.name}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Owner: <strong style={{ color: '#fff' }}>{myTeam.owner}</strong> • Total Purse: <strong>{formatPurse(totalBudget)}</strong>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '0.4rem 0.85rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.68rem', color: '#FBBF24', textTransform: 'uppercase', fontWeight: 700 }}>REMAINING PURSE</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--gold-bright)' }}>
                {formatPurse(remainingPurse)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SQUAD</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: isSquadFull ? '#EF4444' : '#fff' }}>
                {squadCount} / 10
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SPENT</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#94A3B8' }}>
                {formatPurse(myTeam.totalSpent || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Squad Limit Warning */}
        {isSquadFull && (
          <div style={{
            marginTop: '1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#F87171',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700
          }}>
            <AlertTriangle size={18} /> Squad Full (10/10 Players). You cannot place any further bids.
          </div>
        )}

        {/* Insufficient Purse Warning */}
        {!hasEnoughPurse && !isSquadFull && (
          <div style={{
            marginTop: '1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#F87171',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700
          }}>
            <AlertTriangle size={18} /> Insufficient purse balance ({formatPurse(remainingPurse)} left) for the next bid of {formatPurse(nextBidAmount)}.
          </div>
        )}
      </div>

      {/* Main Auction Stage Card */}
      <div className="card card-gold" style={{ padding: '2rem 1.5rem', textAlign: 'center', position: 'relative', marginBottom: '1.5rem' }}>
        
        {/* State Banner */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span className={`status-pill status-${auction.status.toLowerCase().replace('_', '-')}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.95rem' }}>
            {auction.status === 'BIDDING' && <span className="live-dot" style={{ width: '7px', height: '7px' }} />}
            STATUS: {auction.status.replace('_', ' ')}
          </span>
        </div>

        {currentPlayer ? (
          <div>
            {/* Player Photo */}
            <div style={{ display: 'inline-block', margin: '0 auto 1rem', position: 'relative' }}>
              <PlayerAvatar
                photoUrl={currentPlayer.photoUrl}
                name={currentPlayer.name}
                size="lg"
                category={currentPlayer.category}
              />
              <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)' }}>
                <span className={`badge-category cat-${currentPlayer.category.toLowerCase().replace(/[^a-z]/g, '')}`}>
                  {currentPlayer.category}
                </span>
              </div>
            </div>

            {/* Name & Base Price */}
            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0 0.2rem' }}>
              {currentPlayer.name}
            </h3>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Base Price: <strong style={{ color: '#fff' }}>{formatPurse(currentPlayer.basePrice)}</strong>
            </div>

            {/* Current Bid Display */}
            <div style={{
              background: 'rgba(7, 11, 25, 0.7)',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CURRENT OFFICIAL BID
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--gold-bright)', textShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}>
                {formatPurse(auction.currentBid || currentPlayer.basePrice)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.35rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Highest Bidder:</span>
                {auction.highestBidderTeamName ? (
                  <strong style={{ color: isHighestBidder ? '#34D399' : '#38BDF8', fontSize: '0.95rem' }}>
                    {auction.highestBidderTeamName} {isHighestBidder && '(Your Team!)'}
                  </strong>
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No bids yet</span>
                )}
              </div>

              {/* 10-SECOND AUTHORITATIVE LIVE COUNTDOWN TIMER */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <CountdownTimer auction={auction} size="lg" />
              </div>
            </div>

            {/* Big Bidding Controls Box */}
            <div style={{ background: 'rgba(13, 21, 39, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              
              {/* Next Bid Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Next Valid Bid:</span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--gold-bright)' }}>
                  {formatPurse(nextBidAmount)} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>({formatFullINR(nextBidAmount)})</span>
                </span>
              </div>

              {/* Massive 1-Tap BID Button */}
              <button
                onClick={handleSubmitBid}
                disabled={!isBidding || isTimeEnded || isSquadFull || !hasEnoughPurse || submitting}
                className="btn btn-gold btn-xl"
                style={{
                  width: '100%',
                  boxShadow: isBidding && !isTimeEnded && !isSquadFull && hasEnoughPurse
                    ? '0 0 30px rgba(245, 158, 11, 0.5)'
                    : 'none',
                  opacity: (!isBidding || isTimeEnded || isSquadFull || !hasEnoughPurse) ? 0.6 : 1,
                  cursor: (!isBidding || isTimeEnded || isSquadFull || !hasEnoughPurse) ? 'not-allowed' : 'pointer'
                }}
              >
                <ArrowUpRight size={24} />
                BID {formatPurse(nextBidAmount)}
              </button>

              {/* Dynamic Status Feedback Box */}
              <div style={{ marginTop: '1.25rem', fontSize: '0.9rem', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isHighestBidder ? (
                  <div style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <CheckCircle2 size={18} />
                    You are leading. Bid again to raise the current bid.
                  </div>
                ) : !hasEnoughPurse ? (
                  <div style={{ color: '#F87171', fontWeight: 600 }}>
                    Insufficient purse balance ({formatPurse(remainingPurse)} left).
                  </div>
                ) : isSquadFull ? (
                  <div style={{ color: '#F87171', fontWeight: 600 }}>
                    Squad limit reached (10/10). Bidding locked.
                  </div>
                ) : isTimeEnded ? (
                  <div style={{ color: '#38BDF8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⏱️ Bidding Time Ended! Highest Bidder: {auction.highestBidderTeamName}. Waiting for Host sale confirmation.
                  </div>
                ) : isBidding ? (
                  <div style={{ color: 'var(--text-muted)' }}>
                    🟢 Bidding is live! Tap button above to submit your bid.
                  </div>
                ) : isPaused ? (
                  <div style={{ color: '#FBBF24' }}>
                    ⏸️ Auction is currently PAUSED by Host.
                  </div>
                ) : isSold ? (
                  <div style={{ color: '#34D399', fontWeight: 700 }}>
                    🏏 Player SOLD to {currentPlayer.soldTeamName} for {formatPurse(currentPlayer.soldPrice)}!
                  </div>
                ) : isUnsold ? (
                  <div style={{ color: '#F87171', fontWeight: 700 }}>
                    Player passed UNSOLD.
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-dim)' }}>
                    Waiting for Host to start bidding...
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '3.5rem 1rem' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--text-dim)'
            }}>
              <Clock size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.4rem' }}>Waiting for Next Player</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              The Host is preparing the next cricketer for the auction podium. Stay tuned!
            </p>
          </div>
        )}
      </div>

      {/* Quick My Squad Snippet */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Purchased Players ({squadCount}/10)</h4>
          <button onClick={() => setActiveTab('my-team')} className="btn btn-outline btn-sm">
            View Full Squad
          </button>
        </div>

        {squadCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Your team has not bought any players yet. Bid when a player is on stage!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {myTeam.players.map(p => (
              <div key={p.id} style={{
                background: 'rgba(7, 11, 25, 0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}>
                <PlayerAvatar photoUrl={p.photoUrl} name={p.name} size="sm" category={p.category} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gold-bright)' }}>
                    ₹{p.soldPrice?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REAL-TIME AUCTION ACTIVITY AUDIT FEED (Requirement 19) */}
      <div style={{ marginTop: '1.5rem' }}>
        <AuctionLogFeed logs={auction.logs || []} maxHeight="200px" />
      </div>
    </div>
  );
}
