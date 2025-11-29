// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    // Restore auth from localStorage when app loads
    useEffect(() => {
        const saved = localStorage.getItem("authUser");
        if (saved) {
            setUser(JSON.parse(saved));
        }
    }, []);

    // ---------------- LOGIN ----------------
    // Accepts: token, userName, userId
    const login = (token, name, userId) => {
        const userData = {
            token: token,
            userName: name,
            user_id: userId
        };

        setUser(userData);
        localStorage.setItem("authUser", JSON.stringify(userData));
    };

    // ---------------- LOGOUT ----------------
    const logout = () => {
        setUser(null);
        localStorage.removeItem("authUser");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
