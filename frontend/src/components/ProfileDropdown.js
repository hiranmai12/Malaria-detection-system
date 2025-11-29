// src/components/ProfileDropdown.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext'; 
import './ProfileDropdown.css';

const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();   // <-- UPDATED
    const navigate = useNavigate();

    // ALWAYS SAFE – prevents crash when user is null / undefined
    const userName = user?.userName || "User";
    const firstLetter = userName?.[0]?.toUpperCase() || "?";

    const handleLogout = () => {
        setIsOpen(false);
        logout();
        navigate('/');
    };

    return (
        <div 
            className="profile-dropdown-container" 
            onClick={() => setIsOpen(!isOpen)}
        >
            {/* User Icon/Name Display */}
            <div className="profile-trigger">
                <div className="profile-avatar">{firstLetter}</div>
                <span className="profile-name">{userName}</span>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        Logged in as: <strong>{userName}</strong>
                    </div>

                    <Link 
                        to="/profile/settings" 
                        className="dropdown-item"
                        onClick={() => setIsOpen(false)}
                    >
                        ⚙️ Settings
                    </Link>

                    <Link 
                        to="/profile" 
                        className="dropdown-item"
                        onClick={() => setIsOpen(false)}
                    >
                        👤 View Profile
                    </Link>

                    <div className="dropdown-divider"></div>

                    <div 
                        className="dropdown-item logout-btn" 
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
