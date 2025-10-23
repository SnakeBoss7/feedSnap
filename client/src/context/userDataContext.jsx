// context/userDataContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Load from localStorage immediately
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('UserData');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.name || parsed.username)) {
          setUserData(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to load from storage:', err);
      localStorage.removeItem('UserData');
    }
    return null;
  };

  // Save to localStorage
  const saveToStorage = (data) => {
    try {
      if (data && (data.name || data.username)) {
        localStorage.setItem('UserData', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Failed to save to storage:', err);
    }
  };

  // Fetch from API
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${apiUrl}/api/auth/getData`, {
        withCredentials: true,
        timeout: 10000,
      });

      const newUserData = response.data?.userData;
      
      if (newUserData && (newUserData.name || newUserData.username)) {
        setUserData(newUserData);
        saveToStorage(newUserData);
        return newUserData;
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError(err.message);
      
      // If API fails, keep using cached data if available
      const cached = loadFromStorage();
      if (!cached) {
        setUserData(null);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUserData = (newData) => {
    const updated = { ...userData, ...newData };
    setUserData(updated);
    saveToStorage(updated);
  };

  // Clear user data
  const clearUserData = () => {
    setUserData(null);
    setError(null);
    localStorage.removeItem('UserData');
  };

  // Force refresh user data (for after login)
  const refreshUserData = () => {
    return fetchUserData();
  };

  // Initial load
  useEffect(() => {
    // Load from storage first for immediate UI
    const cached = loadFromStorage();
    
    // Then fetch from API
    fetchUserData().catch(() => {
      // If fetch fails and no cached data, we're already handling it above
    });
  }, []);

  // Listen for storage changes (other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'UserData') {
        if (e.newValue) {
          try {
            const newData = JSON.parse(e.newValue);
            if (newData && (newData.name || newData.username)) {
              setUserData(newData);
            }
          } catch (err) {
            console.warn('Invalid storage data:', err);
          }
        } else {
          setUserData(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    userData,
    isLoading,
    error,
    fetchUserData,
    updateUserData,
    clearUserData,
    refreshUserData, // Use this after login/signup
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;