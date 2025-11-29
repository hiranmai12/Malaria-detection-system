import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../components/AuthContext';

import bgImage from "../images/bg.jpg";
import mosquito from "../images/mosquito-right.png";
import virus from "../images/germ.png";
import syringe from "../images/syringe.png";
import "./LoginPage.css"; 

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const API_SIGNUP_URL = "http://localhost:5000/signup";

    // ------------------------------------------------------------------
    // 1. Email/Password Sign Up
    // ------------------------------------------------------------------
    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_SIGNUP_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const res = await response.json().catch(() => ({}));
                throw new Error(res.message || "Signup failed.");
            }

            const data = await response.json();

            // Log user in automatically
            login(data.token, data.user.name, data.user.user_id);

            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="login-container"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="login-wrapper">
                <form className="login-box" onSubmit={handleSignUp}>
                    <h1 className="login-title">Sign Up</h1>

                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            placeholder="john@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            placeholder="6+ characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error">{error}</p>}

                    <button className="btn-gradient" type="submit" disabled={loading}>
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>
            </div>

            {/* Illustrations */}
            <img src={virus} alt="virus" className="virus" />
            <img src={mosquito} alt="mosquito" className="mosquito" />
            <img src={mosquito} alt="mosquito" className="mosquito-2" />
            <img src={syringe} alt="syringe" className="syringe" />
            <img src={syringe} alt="syringe" className="syringe-2" />
        </div>
    );
}
