import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      console.log("Token from localStorage:", token);

      if (token) {
        try {
          const response = await axios.get('https://magnetbackend.onrender.com/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("User data from server:", response.data);
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } else {
        console.log("No token found in localStorage");
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://magnetbackend.onrender.com/api/auth/login', { email, password });
      const { token, user } = response.data;

      console.log("Login successful, received token:", token);
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('https://magnetbackend.onrender.com/api/auth/register', {
        name,  // Include name in the registration payload
        email,
        password
      });
      const { token, user } = response.data;

      console.log("Registration successful, received token:", token);
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;