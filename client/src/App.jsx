import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuctionProvider } from './context/AuctionContext';
import Navbar from './components/Navbar';
import DemoBar from './components/DemoBar';
import Toast from './components/Toast';

import Login from './pages/Login';
import HostDashboard from './pages/HostDashboard';
import TeamManagement from './pages/TeamManagement';
import PlayerManagement from './pages/PlayerManagement';
import ImportPlayers from './pages/ImportPlayers';
import LiveAuctionHost from './pages/LiveAuctionHost';
import LiveAuctionTeam from './pages/LiveAuctionTeam';
import TeamSquads from './pages/TeamSquads';
import AuctionHistory from './pages/AuctionHistory';
import Settings from './pages/Settings';

function AppContent() {
  const { isAuthenticated, role, user } = useAuth();
  const [activeTab, setActiveTab] = useState(role === 'HOST' ? 'dashboard' : 'live-auction');

  if (!isAuthenticated) {
    return <Login />;
  }

  const isHost = role === 'HOST';

  return (
    <div className="app-container">
      {/* Quick Switcher for seamless test interaction */}
      <DemoBar />

      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Arena */}
      <main className="main-content">
        {isHost ? (
          <>
            {activeTab === 'dashboard' && <HostDashboard setActiveTab={setActiveTab} />}
            {activeTab === 'teams' && <TeamManagement />}
            {activeTab === 'players' && <PlayerManagement />}
            {activeTab === 'import' && <ImportPlayers setActiveTab={setActiveTab} />}
            {activeTab === 'live-auction' && <LiveAuctionHost setActiveTab={setActiveTab} />}
            {activeTab === 'squads' && <TeamSquads />}
            {activeTab === 'history' && <AuctionHistory />}
            {activeTab === 'settings' && <Settings />}
          </>
        ) : (
          <>
            {activeTab === 'live-auction' && <LiveAuctionTeam setActiveTab={setActiveTab} />}
            {activeTab === 'my-team' && <TeamSquads specificTeamId={user?.teamId} />}
            {activeTab === 'squads' && <TeamSquads />}
            {activeTab === 'history' && <AuctionHistory />}
          </>
        )}
      </main>

      {/* Global Real-Time Toast Alerts */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuctionProvider>
        <AppContent />
      </AuctionProvider>
    </AuthProvider>
  );
}
