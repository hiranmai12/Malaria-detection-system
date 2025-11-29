import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth(); 
    const userId = user?.user_id;

    // Dashboard stats from backend
    const [stats, setStats] = useState({
        totalTests: 0,
        positiveTests: 0,
        negativeTests: 0,
        accuracy: 94.0,
    });

    // Graph values: % of tests that are parasitized vs uninfected
    const [currentResult, setCurrentResult] = useState({
        parasitized: 0,
        uninfected: 0,
    });

    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState(null);

    // ---------------- FETCH DASHBOARD STATS ----------------
    const fetchStats = useCallback(async () => {
        if (!userId) return null;

        try {
            const response = await fetch(`http://localhost:5000/stats/${userId}`);
            if (!response.ok) throw new Error("Failed to load stats");
            const data = await response.json();
            setStats(data);
            return data;
        } catch (err) {
            console.error("Failed to load stats:", err);
            return null;
        }
    }, [userId]);

    // On mount / when user changes: load stats
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // ---------------- DERIVE GRAPH FROM STATS ----------------
    useEffect(() => {
        if (stats.totalTests > 0) {
            const parasitizedPct = Math.round(
                (stats.positiveTests / stats.totalTests) * 100
            );
            const uninfectedPct = 100 - parasitizedPct;

            setCurrentResult({
                parasitized: parasitizedPct,
                uninfected: uninfectedPct,
            });
        } else {
            setCurrentResult({ parasitized: 0, uninfected: 0 });
        }
    }, [stats]);

    const getBarHeight = (value) => {
        if (!value || value <= 0) return "8px"; // tiny base bar
        const clamped = Math.min(value, 100);
        const min = 8;    // minimum visible height
        const max = 150;  // maximum bar height in px
        return `${min + (clamped / 100) * (max - min)}px`;
    };

    // ---------------- UPLOAD IMAGE ----------------
    const handleFileChange = useCallback(
        async (file) => {
            if (!file) return;
            if (!userId) {
                alert("Please log in first.");
                return;
            }

            setFileName(file.name);
            setIsUploading(true);

            try {
                const formData = new FormData();
                formData.append("image", file);
                formData.append("user_id", userId);

                const response = await fetch("http://localhost:5000/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || "Upload failed");
                }

                const detectionResult = await response.json();

                // Refresh stats (which will also update graph via useEffect)
                const updatedStats = (await fetchStats()) || stats;

                // Go to Result page with correct latest stats
                navigate("/result", {
                    state: {
                        result: detectionResult,
                        fileName: file.name,
                        latestStats: updatedStats,
                    },
                });
            } catch (error) {
                console.error("Detection failed:", error);
                alert(error.message);
            } finally {
                setIsUploading(false);
            }
        },
        [navigate, userId, fetchStats, stats]
    );

    // Drag & drop handlers
    const handleDragOver = (event) => event.preventDefault();

    const handleDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) handleFileChange(files[0]);
    };

    const handleFileInput = (event) => {
        const files = event.target.files;
        if (files.length > 0) handleFileChange(files[0]);
    };

    return (
        <div className="app-container">
    

<aside className="sidebar">
    <ul>
        <li  className="sidebar-active"><Link to="/">Dashboard</Link></li>
        <li><Link to="/about">About Malaria</Link></li>
        <li><Link to="/history">History</Link></li>
        <li><Link to="/instructions">Instructions</Link></li>
    </ul>
</aside>


            <div className="dashboard-main-content">
                <h1 className="dashboard-title">Malaria Detection System</h1>

                {/* ---------------- STATS CARDS ---------------- */}
                <div className="stats-section">
                    <div className="card stat-blue">
                        <h2>{stats.totalTests}</h2>
                        <p>Total Tests</p>
                    </div>
                    <div className="card stat-green">
                        <h2>{stats.negativeTests}</h2>
                        <p>Uninfected</p>
                    </div>
                    <div className="card stat-red">
                        <h2>{stats.positiveTests}</h2>
                        <p>Parasitized</p>
                    </div>
                    <div className="card stat-yellow">
                        <h2>{stats.accuracy}%</h2>
                        <p>Model Accuracy</p>
                    </div>
                </div>

                {/* ---------------- UPLOAD + GRAPH SECTION ---------------- */}
                <div className="upload-graph-container">
                    <div
                        className="upload-box"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() =>
                            document.getElementById("file-input").click()
                        }
                    >
                        <input
                            type="file"
                            id="file-input"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileInput}
                        />

                        {isUploading ? (
                            <div className="upload-progress">
                                <p>Processing file: {fileName}...</p>
                                <div className="loader"></div>
                            </div>
                        ) : fileName ? (
                            <>
                                <span className="upload-icon uploaded-icon">
                                    ✓
                                </span>
                                <p className="upload-title">Result Ready!</p>
                                <p className="file-name">{fileName}</p>
                                <p className="upload-cta">
                                    Click to upload new image
                                </p>
                            </>
                        ) : (
                            <>
                                <span className="upload-icon">+</span>
                                <p className="upload-title">
                                    Upload Image To Identify Parasite
                                </p>
                                <p className="upload-cta">
                                    Drag and drop or click to browse
                                </p>
                            </>
                        )}
                    </div>

                    <div className="graph-box">
                        <h3 className="graph-title">
                            Overall Detection Breakdown
                        </h3>
                        <div className="bar-chart-area">
                            <div className="bar-chart">
                                <div
                                    className="bar parasitized"
                                    style={{
                                        height: getBarHeight(
                                            currentResult.parasitized
                                        ),
                                    }}
                                >
                                    <span>{currentResult.parasitized}%</span>
                                </div>
                                <div
                                    className="bar uninfected"
                                    style={{
                                        height: getBarHeight(
                                            currentResult.uninfected
                                        ),
                                    }}
                                >
                                    <span>{currentResult.uninfected}%</span>
                                </div>
                            </div>

                            <div className="bar-labels">
                                <span>Parasitized</span>
                                <span>Uninfected</span>
                            </div>

                            <p
                                className={`latest-status ${
                                    currentResult.parasitized >
                                    currentResult.uninfected
                                        ? "status-positive"
                                        : "status-negative"
                                }`}
                            >
                                Status:{" "}
                                {stats.totalTests === 0
                                    ? "Awaiting Test"
                                    : currentResult.parasitized >
                                      currentResult.uninfected
                                    ? "Parasitized (Infected)"
                                    : "Uninfected"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ---------------- EXTRA CONTENT ---------------- */}
                <div className="extra-content-section">
                    <div className="tips-box">
                        <h3>Prevention Tips</h3>
                        <div className="tip-grid">
                            <div className="tip">🧴 Apply repellents</div>
                            <div className="tip">💧 Remove stagnant water</div>
                            <div className="tip">🛏 Use mosquito nets</div>
                            <div className="tip">🧥 Wear protective clothing</div>
                        </div>
                    </div>

                    <div className="info-box">
                        <strong>Did you know?</strong>
                        <p>
                            Malaria cases are highest during monsoon season in
                            many regions. Stay safe!!
                        </p>
                    </div>
                </div>

                <div className="disclaimer">
                    Disclaimer: “For educational use only – not medical
                    advice.”
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
