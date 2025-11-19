// context/userContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext();

// Custom hook for using user context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

// User Provider Component
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cachedData = localStorage.getItem('UserData');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (parsed && parsed.name) {
            setUserData(parsed);
          }
        } catch (parseError) {
          console.warn('Invalid cached user data, removing from localStorage');
          localStorage.removeItem('UserData');
        }
      }

      const response = await axios.get(`${apiUrl}/api/auth/getData`, {
        withCredentials: true,
        timeout: 10000,
      });

      const newUserData = response.data?.userData;
      if (newUserData) {
        setUserData(newUserData);
        localStorage.setItem('UserData', JSON.stringify(newUserData));
      } else {
        throw new Error('No user data received from API');
      }

    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError(err);
      
      // Don't use userData from closure - check localStorage directly
      const fallbackData = localStorage.getItem('UserData');
      if (fallbackData) {
        try {
          const parsed = JSON.parse(fallbackData);
          if (parsed && parsed.name) {
            setUserData(parsed);
          }
        } catch (parseError) {
          console.error('Cached data is also invalid');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]); // ✅ Only depends on apiUrl, not userData

  // Function to update user data
  const updateUserData = useCallback((newData) => {
    try {
      localStorage.setItem('UserData', JSON.stringify(newData));
      setUserData(newData);
    } catch (err) {
      console.error('Failed to save user data:', err);
    }
  }, []); // ✅ No dependencies needed

  // Function to clear user data (for logout)
  const clearUserData = useCallback(() => {
    setUserData(null);
    localStorage.removeItem('UserData');
    setError(null);
  }, []); // ✅ No dependencies needed

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // ✅ Now includes fetchUserData

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'UserData') {
        if (event.newValue) {
          try {
            setUserData(JSON.parse(event.newValue));
          } catch (error) {
            console.error('Invalid user data from storage change:', error);
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
    refetchUserData: fetchUserData, // Alias for backward compatibility
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;