// src/components/ProtectedRoute.js (Create this file)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        // If not logged in, redirect them to the login page
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;