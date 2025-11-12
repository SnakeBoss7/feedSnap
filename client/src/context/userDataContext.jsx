// context/userContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, try to load from localStorage for immediate UI feedback
      const cachedData = localStorage.getItem('UserData');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (parsed && parsed.name) { // Basic validation
            setUserData(parsed);
          }
        } catch (parseError) {
          console.warn('Invalid cached user data, removing from localStorage');
          localStorage.removeItem('UserData');
        }
      }

      // Then fetch fresh data from API
      const response = await axios.get(`${apiUrl}/api/auth/getData`, {
        withCredentials: true,
        timeout: 10000, // 10 second timeout
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
      
      // If API fails but we have cached data, keep using cached data
      if (!userData) {
        const fallbackData = localStorage.getItem('UserData');
        if (fallbackData) {
          try {
            setUserData(JSON.parse(fallbackData));
          } catch (parseError) {
            console.error('Cached data is also invalid');
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update user data
  const updateUserData = (newData) => {
    localStorage.setItem('UserData', JSON.stringify(newData));
    setUserData(newData);
  };

  // Function to clear user data (for logout)
  const clearUserData = () => {
    setUserData(null);
    localStorage.removeItem('UserData');
    setError(null);
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [apiUrl]);

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