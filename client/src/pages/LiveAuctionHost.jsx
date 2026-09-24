import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import PlayerAvatar from '../components/PlayerAvatar';
import ConfirmModal from '../components/ConfirmModal';
import CountdownTimer from '../components/CountdownTimer';
import AuctionLogFeed from '../components/AuctionLogFeed';
import { formatPurse, formatFullINR } from '../utils/formatCurrency';
import {
  Shuffle,
  Play,
  Pause,
  RotateCcw,
  Gavel,
  Shield,
  Clock,
  UserX,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function LiveAuctionHost({ setActiveTab }) {
  const {
    auction,
    stats,
    teams,
    selectRandomPlayer,
    startBidding,
    pauseBidding,
    resumeBidding,
    sellPlayer,
    markUnsold,
    showToast
  } = useAuction();

  const [confirmSellOpen, setConfirmSellOpen] = useState(false);
  const [confirmUnsoldOpen, setConfirmUnsoldOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const currentPlayer = auction.currentPlayer;
  const isBidding = auction.status === 'BIDDING';
  const isPaused = auction.status === 'PAUSED';
  const isPlayerSelected = auction.status === 'PLAYER_SELECTED';
  const isSold = auction.status === 'SOLD';
  const isUnsold = auction.status === 'UNSOLD';
  const isWaiting = auction.status === 'WAITING';
  const isTimeEnded = auction.status === 'TIME_ENDED';

  // Calculate Next Minimum Bid
  const increment = auction.bidIncrement || 100;
  let nextBidAmount = (auction.currentBid || 0) + increment;
  if (!auction.highestBidderTeamId && currentPlayer) {
    nextBidAmount = currentPlayer.basePrice;
  }

  const handleNextPlayer = async () => {
    if (teams.length < 2) {
      showToast('Cannot start auction. Please create at least 2 teams first.', 'danger');
      return;
    }
    setActionLoading(true);
    await selectRandomPlayer();
    setActionLoading(false);
  };

  const handleStartBidding = async () => {
    if (teams.length < 2) {
      showToast('Cannot start auction. Please create at least 2 teams first.', 'danger');
      return;
    }
    setActionLoading(true);
    await startBidding();
    setActionLoading(false);
  };

  const handlePauseResume = async () => {
    setActionLoading(true);
    if (isBidding) {
      await pauseBidding();
    } else if (isPaused) {
      await resumeBidding();
    }
    setActionLoading(false);
  };

  const handleConfirmSell = async () => {
    setConfirmSellOpen(false);
    setActionLoading(true);
    await sellPlayer();
    setActionLoading(false);
  };

  const handleConfirmUnsold = async () => {
    setConfirmUnsoldOpen(false);
    setActionLoading(true);
    await markUnsold();
    setActionLoading(false);
  };

  const highestBidderTeam = teams.find(t => t.id === auction.highestBidderTeamId);

  return (
    <div>
      {/* Insufficient Teams Validation Alert */}
      {teams.length < 2 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          color: '#F87171'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={26} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                Cannot start auction — Minimum 2 Teams Required
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                You currently have {teams.length} registered franchise(s). Please register at least 2 teams in Team Management.
              </div>
            </div>
          </div>

          <button onClick={() => setActiveTab && setActiveTab('teams')} className="btn btn-gold">
            <Plus size={16} /> Go to Team Management
          </button>
        </div>
      )}

      {/* Top Banner with Telemetry */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem 1.5rem',
        background: 'rgba(13, 21, 39, 0.8)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 800
          }}>
            <Gavel size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>LIVE AUCTION CONTROLLER</h2>
              <span className={`status-pill status-${auction.status.toLowerCase().replace('_', '-')}`} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                {auction.status.replace('_', ' ')}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Host Authority Gateway • {teams.length} Dynamic Franchises Active
            </div>
          </div>
        </div>

        {/* Global Stats Counter */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>PLAYERS SOLD</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>{stats.sold}</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>REMAINING POOL</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60A5FA' }}>{stats.available}</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>INCREMENT</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-bright)' }}>{formatPurse(auction.bidIncrement || 100)}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Player Card & Bidding Stage, Right = Incoming Bids & Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.1fr) minmax(340px, 1fr)', gap: '1.5rem', alignItems: 'start', marginBottom: '2rem' }}>
        
        {/* LEFT COLUMN: Player Podium */}
        <div className="card card-gold" style={{ padding: '2rem', textAlign: 'center', position: 'relative' }}>
          
          {/* Status Overlay for Sold / Unsold */}
          {isSold && (
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
              <div className="stamp-sold">SOLD</div>
            </div>
          )}
          {isUnsold && (
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
              <div className="stamp-unsold">UNSOLD</div>
            </div>
          )}

          {currentPlayer ? (
            <div>
              {/* Player Photo */}
              <div style={{ display: 'inline-block', margin: '0 auto 1.5rem', position: 'relative' }}>
                <PlayerAvatar
                  photoUrl={currentPlayer.photoUrl}
                  name={currentPlayer.name}
                  size="xl"
                  category={currentPlayer.category}
                />
                <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)' }}>
                  <span className={`badge-category cat-${currentPlayer.category.toLowerCase().replace(/[^a-z]/g, '')}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                    {currentPlayer.category}
                  </span>
                </div>
              </div>

              {/* Player Name & Base Price */}
              <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ color: 'var(--gold-bright)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  PLAYER ID: {currentPlayer.id}
                </div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', margin: '0.2rem 0' }}>
                  {currentPlayer.name}
                </h3>
                <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                  Base Price: <strong style={{ color: '#fff' }}>{formatPurse(currentPlayer.basePrice)}</strong>
                </div>
              </div>

              {/* Official Current Bid Board */}
              <div style={{
                background: 'rgba(7, 11, 25, 0.7)',
                border: '2px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '16px',
                padding: '1.5rem',
                margin: '1.5rem 0',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.15)'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  OFFICIAL CURRENT BID
                </div>
                <div style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--gold-bright)', textShadow: '0 0 20px rgba(245, 158, 11, 0.5)', margin: '0.3rem 0' }}>
                  {formatPurse(auction.currentBid || currentPlayer.basePrice)}
                </div>

                {/* Highest Bidder Display */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Highest Bidder:</span>
                  {auction.highestBidderTeamName ? (
                    <span style={{
                      background: highestBidderTeam?.color || 'var(--blue-accent)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      padding: '0.3rem 0.85rem',
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.4)'
                    }}>
                      🏆 {auction.highestBidderTeamName} {highestBidderTeam && `(${formatPurse(highestBidderTeam.remainingPurse)} Purse Left)`}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No bids placed yet</span>
                  )}
                </div>

                {/* 10-SECOND AUTHORITATIVE LIVE COUNTDOWN TIMER */}
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <CountdownTimer auction={auction} size="lg" />
                </div>
              </div>

              {/* Time Ended Banner when a leading team exists */}
              {isTimeEnded && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2))',
                  border: '2px solid var(--gold-primary)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--gold-bright)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    ⏱️ BIDDING TIME ENDED
                  </div>
                  <div style={{ fontSize: '1.15rem', color: '#fff', margin: '0.4rem 0' }}>
                    Highest Bidder: <strong style={{ color: '#38BDF8' }}>{auction.highestBidderTeamName}</strong> at <strong style={{ color: 'var(--gold-bright)' }}>{formatPurse(auction.currentBid)}</strong>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    Click <strong>"Sell Player"</strong> to finalize and transfer cricketer to franchise roster.
                  </div>
                  <button
                    onClick={() => setConfirmSellOpen(true)}
                    className="btn btn-emerald btn-lg"
                    style={{ fontWeight: 800, padding: '0.75rem 2rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }}
                  >
                    <Gavel size={20} /> SELL PLAYER TO {auction.highestBidderTeamName}
                  </button>
                </div>
              )}

              {/* Sold Confirmation Details */}
              {isSold && currentPlayer.soldTeamName && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '1rem',
                  borderRadius: '12px',
                  color: '#34D399',
                  fontSize: '1rem',
                  fontWeight: 700
                }}>
                  🎉 Sold to <strong>{currentPlayer.soldTeamName}</strong> for <strong>{formatPurse(currentPlayer.soldPrice)}</strong>!
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '4rem 1rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'var(--text-dim)'
              }}>
                <Shuffle size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>No Active Player On Stage</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '340px', margin: '0 auto 1.5rem' }}>
                {teams.length < 2 
                  ? 'Please create at least 2 teams before drawing a player.'
                  : 'Click "Next Player" to randomly select an available player from the tournament roster.'}
              </p>
              <button
                onClick={handleNextPlayer}
                disabled={actionLoading || stats.available === 0 || teams.length < 2}
                className="btn btn-gold btn-lg"
              >
                <Shuffle size={20} /> Draw Next Player
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Incoming Bids Queue & Host Controls Pad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* HOST CONTROL PAD */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--gold-primary)" /> Host Auction Controls
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {/* Next Player */}
              <button
                onClick={handleNextPlayer}
                disabled={actionLoading || isBidding || stats.available === 0 || teams.length < 2}
                className="btn btn-secondary"
                style={{ padding: '0.85rem' }}
                title="Randomly draw next available player"
              >
                <Shuffle size={18} /> Next Player
              </button>

              {/* Start Bidding / Resume */}
              {isWaiting || isPlayerSelected || isSold || isUnsold || isTimeEnded ? (
                <button
                  onClick={handleStartBidding}
                  disabled={actionLoading || !currentPlayer || isSold || isUnsold || isTimeEnded || teams.length < 2}
                  className="btn btn-gold"
                  style={{ padding: '0.85rem' }}
                >
                  <Play size={18} /> Start Bidding
                </button>
              ) : isPaused ? (
                <button
                  onClick={handlePauseResume}
                  disabled={actionLoading}
                  className="btn btn-gold"
                  style={{ padding: '0.85rem' }}
                >
                  <Play size={18} /> Resume Bidding
                </button>
              ) : (
                <button
                  onClick={handlePauseResume}
                  disabled={actionLoading}
                  className="btn btn-secondary"
                  style={{ padding: '0.85rem' }}
                >
                  <Pause size={18} /> Pause Bidding
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {/* Mark Unsold */}
              <button
                onClick={() => setConfirmUnsoldOpen(true)}
                disabled={actionLoading || !currentPlayer || isSold || isUnsold}
                className="btn btn-outline"
                style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.85rem' }}
              >
                <UserX size={18} /> Mark Unsold
              </button>

              {/* Sell Player */}
              <button
                onClick={() => setConfirmSellOpen(true)}
                disabled={actionLoading || !currentPlayer || !auction.highestBidderTeamId || isSold || isUnsold}
                className="btn btn-emerald"
                style={{
                  padding: '0.85rem',
                  boxShadow: isTimeEnded ? '0 0 25px rgba(16, 185, 129, 0.5)' : 'none',
                  fontWeight: isTimeEnded ? 800 : 700
                }}
              >
                <Gavel size={18} /> Sell Player
              </button>
            </div>
          </div>

          {/* LIVE BID FEED */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Official Live Bids</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Valid bids become official immediately and reset the timer.
                </div>
              </div>
              <span className="status-pill status-bidding" style={{ fontSize: '0.75rem' }}>
                {auction.biddingHistory.length} Bids
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
              {auction.biddingHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)', background: 'rgba(7, 11, 25, 0.4)', borderRadius: '12px' }}>
                  <Clock size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <div>No bids submitted yet for this player.</div>
                  {isBidding && <small style={{ color: '#FBBF24' }}>Connected teams can submit bids now!</small>}
                </div>
              ) : (
                auction.biddingHistory.map(bid => {
                  const isCurrentLeader = bid.teamId === auction.highestBidderTeamId && bid.amount === auction.currentBid;
                  return (
                    <div
                      key={bid.id}
                      style={{
                        background: isCurrentLeader
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid ' + (isCurrentLeader ? '#10B981' : 'var(--border-subtle)'),
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{bid.teamName}</strong>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: isCurrentLeader ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)',
                            color: isCurrentLeader ? '#34D399' : 'var(--text-dim)',
                            fontWeight: 700
                          }}>
                            {isCurrentLeader ? 'LEADING' : 'VALID'}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: isCurrentLeader ? '#34D399' : 'var(--gold-bright)' }}>
                          {formatPurse(bid.amount)} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-dim)' }}>({formatFullINR(bid.amount)})</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: isCurrentLeader ? '#34D399' : 'var(--text-dim)' }}>
                        {isCurrentLeader ? 'Current Leader' : 'Official bid'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* REAL-TIME AUCTION ACTIVITY AUDIT FEED (Requirement 19) */}
          <AuctionLogFeed logs={auction.logs || []} maxHeight="220px" />
        </div>
      </div>

      {/* DYNAMIC REGISTERED TEAMS BIDDING ROSTER STATUS (Item 11 Requirement) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              TEAM BIDDING & SQUAD STATUS ({teams.length} Franchises)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Real-time squad sizes, purse balances, and bidding qualification status.
            </p>
          </div>
          <button onClick={() => setActiveTab && setActiveTab('teams')} className="btn btn-outline btn-sm">
            <Users size={14} /> Manage Teams
          </button>
        </div>

        {teams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)', background: 'rgba(7, 11, 25, 0.4)', borderRadius: '12px' }}>
            No franchises registered yet. Click <strong>Manage Teams</strong> to add tournament teams.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {teams.map(t => {
              const count = t.players ? t.players.length : 0;
              const isFull = count >= 10;
              const isLeader = auction.highestBidderTeamId === t.id;
              const remainingPurse = (t.totalBudget || 1000000000) - (t.totalSpent || 0);
              const hasPurse = remainingPurse >= nextBidAmount;

              return (
                <div key={t.id} style={{
                  background: isLeader ? 'rgba(245, 158, 11, 0.12)' : 'rgba(7, 11, 25, 0.6)',
                  border: '1px solid ' + (isLeader ? 'var(--gold-primary)' : 'var(--border-subtle)'),
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{t.name}</strong>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isFull ? '#EF4444' : '#34D399'
                      }}>
                        Squad: {count}/10
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Owner: {t.owner} • Purse: <strong style={{ color: 'var(--gold-bright)' }}>{formatPurse(remainingPurse)}</strong>
                    </div>
                  </div>

                  <div>
                    {isLeader ? (
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: '#FBBF24',
                        padding: '0.45rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 800
                      }}>
                        🏆 HIGHEST BIDDER ({formatPurse(auction.currentBid)})
                      </div>
                    ) : isFull ? (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#F87171',
                        padding: '0.45rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 800
                      }}>
                        🚫 SQUAD FULL (10/10)
                      </div>
                    ) : !hasPurse ? (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#F87171',
                        padding: '0.45rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}>
                        ⚠️ Insufficient Purse
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#34D399',
                        padding: '0.45rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}>
                        ✓ Ready to Bid ({formatPurse(nextBidAmount)})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sell Player Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmSellOpen}
        title="Confirm Player Sale"
        message={`Sell "${currentPlayer?.name}" to "${auction.highestBidderTeamName}" for the winning bid of ${formatPurse(auction.currentBid)}? This will add the player to the franchise roster.`}
        confirmText="Confirm Sell"
        cancelText="Cancel"
        onConfirm={handleConfirmSell}
        onCancel={() => setConfirmSellOpen(false)}
        type="gold"
      />

      {/* Mark Unsold Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmUnsoldOpen}
        title="Mark Player Unsold"
        message={`Mark "${currentPlayer?.name}" as Unsold? The player will not be assigned to any franchise.`}
        confirmText="Mark Unsold"
        cancelText="Cancel"
        onConfirm={handleConfirmUnsold}
        onCancel={() => setConfirmUnsoldOpen(false)}
        type="danger"
      />
    </div>
  );
}
