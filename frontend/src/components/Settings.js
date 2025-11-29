// src/components/Settings.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import "./Settings.css";

export default function SettingsPage() {
    const { user, login, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const userId = user?.user_id;
    const globalUserName = user?.userName || "User";

    // --- Component State ---
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({ type: null, message: "" });

    // --- Data State (from backend) ---
    const [userProfile, setUserProfile] = useState({
        id: null,
        name: globalUserName,
        email: "",
        created_at: "",
    });

    // --- Form State (editable inputs) ---
    const [currentName, setCurrentName] = useState(globalUserName);
    const [currentEmail, setCurrentEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const API_USER_URL = userId
        ? `http://localhost:5000/user/${userId}`
        : null;

    // ------------------------------------------------------------------
    // A. FETCH PROFILE DETAILS ON MOUNT
    // ------------------------------------------------------------------
    useEffect(() => {
        const fetchDetails = async () => {
            if (!isAuthenticated || !userId || !API_USER_URL) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(API_USER_URL, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) throw new Error("Failed to load profile data.");

                const data = await response.json();

                setCurrentName(data.name || globalUserName);
                setCurrentEmail(data.email || "");

                setUserProfile({
                    id: data.user_id,
                    name: data.name || globalUserName,
                    email: data.email || "",
                    created_at: data.created_at || "",
                });
            } catch (error) {
                console.error("Profile load error:", error);
                setFeedback({ type: "error", message: error.message });
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [API_USER_URL, isAuthenticated, userId, globalUserName]);

    // ------------------------------------------------------------------
    // B. Handler: Update Name and Email
    // ------------------------------------------------------------------
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setFeedback({ type: null, message: "" });

        if (!API_USER_URL) {
            setFeedback({ type: "error", message: "User not found in session." });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(API_USER_URL, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: currentName,
                    email: currentEmail,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Profile update failed.");
            }

            // Update local profile state
            setUserProfile((prev) => ({
                ...prev,
                name: currentName,
                email: currentEmail,
            }));

            // Also update AuthContext & localStorage (reuse same token + id)
            login(user.token, currentName, userId);

            setFeedback({
                type: "success",
                message: "Profile details updated successfully!",
            });
        } catch (error) {
            setFeedback({ type: "error", message: error.message });
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------
    // C. Handler: Password Update (NOW CALLS BACKEND)
    // ------------------------------------------------------------------
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setFeedback({ type: null, message: "" });

        if (!userId) {
            setFeedback({ type: "error", message: "User not found in session." });
            return;
        }

        if (!oldPassword || !newPassword) {
            setFeedback({
                type: "error",
                message: "Please fill both old and new password.",
            });
            return;
        }

        if (newPassword.length < 6) {
            setFeedback({
                type: "error",
                message: "New password must be at least 6 characters.",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `http://localhost:5000/user/${userId}/password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        oldPassword,
                        newPassword,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message ||
                        "Password update failed. Please check your current password."
                );
            }

            setFeedback({
                type: "success",
                message: "Password changed successfully!",
            });
            setOldPassword("");
            setNewPassword("");
        } catch (error) {
            setFeedback({ type: "error", message: error.message });
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------
    // D. Handler: Delete Account (NOW CALLS BACKEND)
    // ------------------------------------------------------------------
    const handleDeleteAccount = async () => {
        if (!userId) {
            alert("User not found in session.");
            return;
        }

        const confirmDelete = window.confirm(
            "WARNING: This will permanently delete your account and all test records. This cannot be undone. Continue?"
        );
        if (!confirmDelete) return;

        setLoading(true);

        try {
            const response = await fetch(
                `http://localhost:5000/user/${userId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || "Account deletion failed on server."
                );
            }

            // Clear auth & redirect
            logout();
            navigate("/signup");
            alert("Your account and all related data have been deleted.");
        } catch (error) {
            setFeedback({ type: "error", message: error.message });
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------
    // E. Helper Renders
    // ------------------------------------------------------------------
    const renderFeedback = () => {
        if (!feedback.message) return null;
        const className =
            feedback.type === "success"
                ? "feedback-success"
                : "feedback-error";
        return <p className={className}>{feedback.message}</p>;
    };

    if (loading) {
        return (
            <div className="profile-container loading">Loading Settings...</div>
        );
    }

    if (!isAuthenticated || !userId) {
        return (
            <div className="profile-container loading">
                You need to log in to view settings.
            </div>
        );
    }

    // ------------------------------------------------------------------
    // F. RENDER
    // ------------------------------------------------------------------
    return (
        <div className="settings-container">
            <header className="profile-header">
                <div className="profile-avatar-large">
                    {userProfile.name
                        ? userProfile.name[0].toUpperCase()
                        : "U"}
                </div>
                <h1>{userProfile.name}'s Account Settings</h1>
                {userProfile.created_at && (
                    <p className="member-since">
                        Member since:{" "}
                        {new Date(userProfile.created_at).toLocaleDateString()}
                    </p>
                )}
            </header>

            <div className="settings-forms-grid">
                {/* 1. Profile Details & Email Update */}
                <div className="settings-card profile-update-card">
                    <h2>Update Profile</h2>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={currentName}
                                onChange={(e) =>
                                    setCurrentName(e.target.value)
                                }
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={currentEmail}
                                onChange={(e) =>
                                    setCurrentEmail(e.target.value)
                                }
                                required
                                disabled={loading}
                            />
                        </div>
                        {renderFeedback()}
                        <button
                            type="submit"
                            className="settings-btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Profile Changes"}
                        </button>
                    </form>
                </div>

                {/* 2. Password Reset */}
                <div className="settings-card password-card">
                    <h2>Change Password</h2>
                    <form onSubmit={handlePasswordUpdate}>
                        <div className="form-group">
                            <label>Old Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) =>
                                    setOldPassword(e.target.value)
                                }
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                                disabled={loading}
                                required
                            />
                        </div>
                        {renderFeedback()}
                        <button
                            type="submit"
                            className="settings-btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Set New Password"}
                        </button>
                    </form>
                    <p className="note-small">
                        Make sure your new password is at least 6 characters
                        long.
                    </p>
                </div>

                {/* 3. Delete Account */}
                <div className="settings-card delete-card">
                    <h2>Danger Zone</h2>
                    <p>
                        Permanently delete your account and all associated data.
                        This action <strong>cannot</strong> be undone.
                    </p>
                    <button
                        className="settings-btn-danger"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
