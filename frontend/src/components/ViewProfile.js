// src/components/ViewProfilePage.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import { Link } from "react-router-dom";
import "./ViewProfile.css";

export default function ViewProfilePage() {
    const { user, isAuthenticated } = useAuth();

    const userId = user?.user_id;
    const userName = user?.userName || "User";

    const [profileDetails, setProfileDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const USER_URL = userId
        ? `http://localhost:5000/user/${userId}`
        : null;
    const STATS_URL = userId
        ? `http://localhost:5000/stats/${userId}`
        : null;
    const HISTORY_URL = userId
        ? `http://localhost:5000/history/${userId}`
        : null;

    // ------------------------------------------------------------------
    // FETCH PROFILE + STATS + HISTORY
    // ------------------------------------------------------------------
    useEffect(() => {
        const fetchDetails = async () => {
            if (!isAuthenticated || !userId) {
                setLoading(false);
                setError("You need to log in to view your profile.");
                return;
            }

            try {
                const [userRes, statsRes, historyRes] = await Promise.all([
                    fetch(USER_URL),
                    fetch(STATS_URL),
                    fetch(HISTORY_URL),
                ]);

                if (!userRes.ok) throw new Error("Failed to load user profile.");
                if (!statsRes.ok) throw new Error("Failed to load stats.");
                if (!historyRes.ok) throw new Error("Failed to load history.");

                const userData = await userRes.json();
                const statsData = await statsRes.json();
                const historyData = await historyRes.json();

                const historyArray = Array.isArray(historyData)
                    ? historyData
                    : [];

                const lastTest = historyArray[0] || null;

                const formattedHistory = historyArray.slice(0, 3).map((item) => {
                    const testCode =
                        item.test_code ||
                        `TEST-${String(
                            item.upload_id || item.id
                        ).padStart(5, "0")}`;

                    return {
                        id: item.upload_id || item.id,
                        testCode,
                        date: item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : "N/A",
                        result: item.result_label || "N/A",
                    };
                });

                setProfileDetails({
                    fullName: userData.name || userName,
                    email: userData.email || "N/A",
                    memberSince: userData.created_at
                        ? new Date(userData.created_at).toLocaleDateString()
                        : "N/A",
                    totalTests: statsData.totalTests || 0,
                    lastActivity: lastTest
                        ? new Date(lastTest.created_at).toLocaleString()
                        : "No recent activity",
                    history: formattedHistory,
                    status: "Active",
                });
            } catch (err) {
                console.error("Profile Fetch Error:", err);
                setError(
                    "Could not load user data or history. Check API status."
                );
                setProfileDetails({
                    fullName: userName,
                    email: "Error",
                    memberSince: "N/A",
                    totalTests: 0,
                    lastActivity: "N/A",
                    history: [],
                    status: "Error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [USER_URL, STATS_URL, HISTORY_URL, isAuthenticated, userId, userName]);

    // ------------------------------------------------------------------
    // RENDER STATES
    // ------------------------------------------------------------------
    if (loading) {
        return (
            <div className="profile-container loading">Loading Profile...</div>
        );
    }

    if (error) {
        return <div className="profile-container error">Error: {error}</div>;
    }

    if (!profileDetails) {
        return (
            <div className="profile-container error">
                Unable to load profile.
            </div>
        );
    }

    // ------------------------------------------------------------------
    // MAIN RENDER
    // ------------------------------------------------------------------
    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="profile-avatar-large">
                    {profileDetails.fullName
                        ? profileDetails.fullName[0].toUpperCase()
                        : "U"}
                </div>
                <h1>{profileDetails.fullName}'s Profile</h1>
                <p>Member since: {profileDetails.memberSince}</p>
            </header>

            <div className="profile-actions">
                <Link
                    to="/profile/settings"
                    className="profile-btn-outline"
                >
                    Edit Profile / Settings
                </Link>
                <Link to="/" className="profile-btn-primary">
                    Go to Dashboard
                </Link>
            </div>

            <div className="profile-grid">
                {/* 1. Account Info Card */}
                <div className="profile-card info-card">
                    <h2>Account Information</h2>
                    <p>
                        <strong>Email:</strong> {profileDetails.email}
                    </p>
                    <p>
                        <strong>Status:</strong> {profileDetails.status}
                    </p>
                </div>

                {/* 2. Testing Summary Card */}
                <div className="profile-card summary-card">
                    <h2>Testing Summary</h2>
                    <p>
                        <strong>Total Images Tested:</strong>{" "}
                        {profileDetails.totalTests}
                    </p>
                    <p>
                        <strong>Last Test Date:</strong>{" "}
                        {profileDetails.lastActivity}
                    </p>
                </div>
            </div>

            {/* 3. Recent Activity/History Table */}
            <div className="profile-card history-card">
                <h2>Recent Testing History</h2>
                {profileDetails.history.length === 0 ? (
                    <p className="history-note">
                        No recent test activity found.
                    </p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Test ID</th>
                                <th>Date</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profileDetails.history.map((item) => (
                                <tr
                                    key={item.id}
                                    className={
                                        item.result === "Parasitized"
                                            ? "result-positive"
                                            : "result-negative"
                                    }
                                >
                                    <td>{item.testCode}</td>
                                    <td>{item.date}</td>
                                    <td>{item.result}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <p className="history-note">
                    <Link to="/history">
                        View All {profileDetails.totalTests} Records →
                    </Link>
                </p>
            </div>
        </div>
    );
}
