// src/componnets/ResultPage.js
import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom'; // <-- ADDED useNavigate
import './ResultPage.css'; // New CSS file for this page

export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate(); // <-- Initialize navigate hook
    const { result, fileName, latestStats } = location.state || {};

    // Handles the back button click
    const handleGoBack = () => {
        // Navigates one step back, ensuring the Dashboard component remounts
        // and loads the updated history from localStorage.
        navigate('/'); 
    };

    if (!result || !latestStats) {
        return (
            <div className="result-page-container error-state">
                <h1>Analysis Error</h1>
                <p>No result data found. Please return to the dashboard and re-upload the image.</p>
                <Link to="/" className="result-btn-primary">Go to Dashboard</Link>
            </div>
        );
    }
    
    // Ensure result.confidence is treated as a percentage for display
    const confidencePercentage = (parseFloat(result.confidence) * 100).toFixed(1); 
    const isInfected = result.parasitized > result.uninfected;
    const finalStatus = isInfected ? 'Parasitized (Infected)' : 'Uninfected';
    const statusClass = isInfected ? 'status-positive' : 'status-negative';

    return (
        <div className="result-page-container">
            
            {/* --- Back Button and Header --- */}
            <div className="result-actions">
                <button 
                    onClick={handleGoBack} 
                    className="result-btn-back"
                >
                    ← Back to Dashboard
                </button>
            </div>
            <h1 className="result-title">Analysis Complete: {fileName}</h1>

            <div className="result-summary">
                <div className={`summary-status ${statusClass}`}>
                    <h2>{finalStatus}</h2>
                    <p>Confidence: {confidencePercentage}%</p>
                </div>
                <p className="analysis-note">
                    The image analysis indicates that **{result.parasitized}%** of the sample features align with parasitized cells.
                </p>
            </div>

            <div className="result-grid">
                
                {/* A. Latest Stats Card (Data from dashboard context) */}
                <div className="result-card stat-card">
                    <h3>Your Testing Summary</h3>
                    <p>Total Tests Completed: <strong>{latestStats.totalTests}</strong></p>
                    <p>Positive Results: <strong>{latestStats.positiveTests}</strong></p>
                    <p>Model Accuracy: <strong>{latestStats.accuracy}%</strong></p>
                    <Link to="/profile" className="result-link">View Full History</Link>
                </div>
                
                {/* B. Percentage Breakdown (Graph Data) */}
                <div className="result-card graph-card">
                    <h3>Percentage Breakdown</h3>
                    <div className="result-graph-area">
                        <div className="result-bar-item">
                            <div className="result-bar result-parasitized" style={{ height: `${result.parasitized}%` }}></div>
                            <span className="result-label">Parasitized ({result.parasitized}%)</span>
                        </div>
                        <div className="result-bar-item">
                            <div className="result-bar result-uninfected" style={{ height: `${result.uninfected}%` }}></div>
                            <span className="result-label">Uninfected ({result.uninfected}%)</span>
                        </div>
                    </div>
                </div>

                {/* C. Next Steps */}
                <div className="result-card next-steps-card">
                    <h3>Next Steps & Advice</h3>
                    <p>Based on this {finalStatus} result, here is general advice:</p>
                    <ul>
                        {isInfected ? (
                            <>
                                <li>**Consult a specialist immediately.** This result indicates a high probability of infection.</li>
                                <li>Review your recent travel history and symptoms with a doctor.</li>
                            </>
                        ) : (
                            <>
                                <li>Maintain preventative measures (nets, repellents).</li>
                                <li>If symptoms develop, test again or seek medical attention.</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}