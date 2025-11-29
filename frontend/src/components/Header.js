// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import ProfileDropdown from './ProfileDropdown';

const Header = () => {
    const { isAuthenticated } = useAuth();
    
    return (
        <nav className="navbar top-navbar">
            {/* Logo/Title element is often here */}
            <div className="logo-placeholder"></div>
            
            <ul className="nav-links">
                <li><Link to="/" className="active">Home</Link></li>
                

                {isAuthenticated ? (
                    // Show Profile Dropdown if authenticated
                    <ProfileDropdown />
                ) : (
                    // Show Login/Signup buttons if NOT authenticated
                    <>
                        <li>
                            <Link to="/login">
                                <button className="btn-outline">Log in</button>
                            </Link>
                        </li>
                        <li>
                            <Link to="/signup">
                                <button className="btn-primary">Sign up</button>
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Header;