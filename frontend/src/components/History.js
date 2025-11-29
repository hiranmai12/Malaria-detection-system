import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import "./History.css";

const EmptyHistoryMessage = () => (
    <div className="empty-history-message">
        <img
            src="history-ill.png"
            alt="No records found illustration"
            className="empty-history-image"
        />
        <p>You haven't uploaded any test records yet.</p>
        <p>
            Go to the <Link to="/">Dashboard</Link> to start analyzing images!
        </p>
    </div>
);

export default function History() {
    const { user, isAuthenticated } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = async (userId) => {
        setLoading(true);
        setError(null);

        const API_HISTORY_URL = `http://localhost:5000/history/${userId}`;

        try {
            const response = await fetch(API_HISTORY_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch test history from the server.");
            }

            const data = await response.json();
            setHistory(data);
        } catch (err) {
            setError(err.message);
            const localHistory = JSON.parse(
                localStorage.getItem("md_test_history") || "[]"
            );
            setHistory(localHistory);
            console.error(
                "Backend fetch failed. Displaying local history as fallback.",
                err
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userId = user?.user_id;

        // If not logged in or no userId, show empty state (ProtectedRoute should already guard access)
        if (!isAuthenticated || !userId) {
            setHistory([]);
            setLoading(false);
            return;
        }

        fetchHistory(userId);
    }, [user, isAuthenticated]);

    let content;

    if (loading) {
        content = <p className="history-loading">Loading test records...</p>;
    } else if (history.length === 0) {
        content = <EmptyHistoryMessage />;
    } else {
        content = (
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Test ID</th>
                        <th>Date</th>
                        <th>File</th>
                        <th>Result</th>
                        <th>Parasitized (%)</th>
                        <th>Uninfected (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((t, index) => {
                        const testCode =
                            t.test_code ||
                            `TEST-${String(
                                t.upload_id || t.id || index + 1
                            ).padStart(5, "0")}`;

                        return (
                            <tr key={t.upload_id || t.id || index}>
                                <td>{testCode}</td>
                                <td>
                                    {t.created_at
                                        ? new Date(
                                              t.created_at
                                          ).toLocaleString()
                                        : "N/A"}
                                </td>
                                <td>{t.filename || "Dashboard Upload"}</td>
                                <td
                                    className={
                                        t.result_label === "Parasitized" ||
                                        t.isPositive
                                            ? "pos"
                                            : "neg"
                                    }
                                >
                                    {t.result_label ||
                                        (t.isPositive
                                            ? "Parasitized"
                                            : "Uninfected")}
                                </td>
                                <td>{t.parasitized ?? "—"}</td>
                                <td>{t.uninfected ?? "—"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    return (
        <div className="page-root">
     

<aside className="sidebar">
    <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/about">About Malaria</Link></li>
        <li className="sidebar-active"><Link to="/history">History</Link></li>
        <li><Link to="/instructions">Instructions</Link></li>
    </ul>
</aside>

            <main className="main-content">
                <h2 style={{ marginTop: 0, textAlign: "center" }}>
                    Test History
                </h2>
                {content}
                {!loading && error && history.length > 0 && (
                    <p className="history-fetch-error">
                        Note: Could not connect to backend; displaying local
                        data only.
                    </p>
                )}
            </main>
        </div>
    );
}
