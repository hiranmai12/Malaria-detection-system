import React from "react";
import { Link } from "react-router-dom";
import "./Instructions.css";

function Instructions() {
    return (
        <div className="app-container">
            <aside className="sidebar">
                <ul>
                    <li><Link to="/">Dashboard</Link></li>
                    <li><a href="/about">About Malaria</a></li>
                    <li><a href="/history">History</a></li>
                    <li className="sidebar-active"><Link to="/instructions">Instructions</Link></li>
                </ul>
            </aside>

            <div className="dashboard-main-content">
                <h1 className="dashboard-title">How to Use Malaria Detection System</h1>
               <div className="steps-with-images">

    {/* STEP 1 */}
 <div className="step-block">
    <h3 className="step-heading">Step 1 — Select Blood Smear Image</h3>
    <p>Choose a clear microscopic blood smear image from your device.</p>
    <p>Supports .jpg, .png</p>
 <img 
            src="blood.png" 
            alt="Upload area on the dashboard" 
            className="step-image"
        />
</div>


    {/* STEP 2 */}
    <div className="step-block">
        <h3 className="step-heading">Step 2 — Upload on Dashboard</h3>
        <p>Click the upload box or drag & drop your image into the Dashboard.</p>

    <div className="image-wrapper">
        <img 
            src="step-1.png" 
            alt="Upload area on the dashboard" 
            className="step-image"
        />

        <div className="pointing-text">
            ➤ Click on the upload box
        </div>
    </div>
    </div>

    {/* STEP 3 */}
    <div className="step-block">
        <h3 className="step-heading">Step 3 — System Analyzes the Image</h3>
        <p>The AI model processes the uploaded image and generates results.</p>

       
    </div>

    {/* STEP 4 */}
    <div className="step-block">
        <h3 className="step-heading">Step 4 — View Detection Report</h3>
        <p>Check the results in the History Page.</p>

        <img 
            src="body.png" 
            alt="Result screen" 
            className="step-image"
        />
    </div>

</div>


                <div className="disclaimer">
                     Disclaimer: “For educational use only – not medical advice.”
                </div>
            </div>
        </div>
    );
}

export default Instructions;
