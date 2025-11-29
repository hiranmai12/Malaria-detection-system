import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

import mosquito from "../images/mosquito-right.png";
import virus from "../images/germ.png";
import syringe from "../images/syringe.png";
import bgImage from "../images/bg.jpg";
import "./LoginPage.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const API_LOGIN_URL = "http://localhost:5000/login";

    // ------------------------------------------------------------------
    // Email + Password Login
    // ------------------------------------------------------------------
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Invalid email or password.");
            }

            const data = await response.json();

            // Backend returns:
            // token, user: { user_id, name, email }
            const token = data.token;
            const userName = data.user?.name;
            const userId = data.user?.user_id;

            if (!token || !userId) {
                throw new Error("Invalid response from server.");
            }

            // Save globally
            login(token, userName, userId);

            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------
    return (
        <div
            className="login-container"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <h1 className="login-title">Login</h1>

            {/* Background illustrations */}
            <img src={virus} alt="virus" className="virus" />
            <img src={mosquito} alt="mosquito" className="mosquito" />
            <img src={mosquito} alt="mosquito" className="mosquito-2" />
            <img src={syringe} alt="syringe" className="syringe" />
            <img src={syringe} alt="syringe" className="syringe-2" />

            <div className="login-wrapper">
                <form className="login-box" onSubmit={handleLogin}>
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
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error">{error}</p>}

                    <button className="btn-gradient" type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
