import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auction_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('auction_role') || null;
    } catch {
      return null;
    }
  });

  const [availableTeams, setAvailableTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailableTeams = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/teams-list`);
      const data = await res.json();
      if (data.success) {
        setAvailableTeams(data.teams);
      }
    } catch (err) {
      console.error('Failed to fetch teams list:', err);
    }
  };

  useEffect(() => {
    fetchAvailableTeams();
  }, []);

  const loginAsHost = async (password = 'password123') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/host/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: 'admin', password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setRole('HOST');
        localStorage.setItem('auction_user', JSON.stringify(data.user));
        localStorage.setItem('auction_role', 'HOST');
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server connection error' };
    } finally {
      setLoading(false);
    }
  };

  const loginAsTeam = async (loginId, password = 'password123') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/team/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setRole('TEAM_LEADER');
        localStorage.setItem('auction_user', JSON.stringify(data.user));
        localStorage.setItem('auction_role', 'TEAM_LEADER');
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server connection error' };
    } finally {
      setLoading(false);
    }
  };

  const quickSwitch = async (targetRole, teamIdOrLoginId) => {
    if (targetRole === 'HOST') {
      return loginAsHost('password123');
    } else {
      const team = availableTeams.find(t => t.id === teamIdOrLoginId || t.loginId === teamIdOrLoginId);
      if (team) {
        return loginAsTeam(team.loginId, 'password123');
      }
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('auction_user');
    localStorage.removeItem('auction_role');
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated: !!user,
      availableTeams,
      loading,
      loginAsHost,
      loginAsTeam,
      quickSwitch,
      logout,
      refreshTeams: fetchAvailableTeams
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
