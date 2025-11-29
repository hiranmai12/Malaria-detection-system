import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AboutPage.css";

// Helper component for the symptom cards
const SymptomCard = ({ imageSrc, altText, label }) => {
    return (
        <div className="symptom-card">
            <img src={imageSrc} alt={altText} />
            <p>{label}</p>
        </div>
    );
};

export default function AboutPage() {
    const [activeSection, setActiveSection] = useState("Malaria"); 

    const handleScrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(sectionId);
        }
    };
    
    const sections = [
        { id: "malaria-details", label: "Malaria" },
        { id: "malaria-symptoms", label: "Symptoms" },
        { id: "malaria-prevention", label: "Prevention & Safety Measures" }
    ];

    return (
        <div className="about-container">
            {/* !!! NAVBAR REMOVED !!!
            The navigation bar is now exclusively rendered by the global Header component. 
            */}

            <div className="main-section">

<aside className="sidebar">
    <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li className="sidebar-active"><Link to="/about">About Malaria</Link></li>
        <li ><Link to="/history">History</Link></li>
        <li><Link to="/instructions">Instructions</Link></li>
    </ul>
</aside>


                {/* Main Content: This section is now long and scrollable */}
                <main className="content" id="about-malaria-section">
                    <h1>About Malaria</h1>

                    {/* Tabs (Now functioning as anchor links) */}
                    <div className="tabs">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                className={activeSection === section.id ? "tab active" : "tab"}
                                onClick={() => handleScrollToSection(section.id)}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>

                    {/* --- Content Sections (All rendered permanently) --- */}
                    <div className="tab-content">

                        {/* 1. Malaria Details Section */}
                        <div id="malaria-details" className="section-block">
                            <h3>What is Malaria?</h3>
                            <p>
                                Malaria is a serious disease that spreads when a person is bitten by a female **Anopheles mosquito** carrying the **Plasmodium parasite**.
                            </p>
                            <ul>
                                <li>The parasite enters the blood and attacks red blood cells.</li>
                                <li>If not treated, it can make people very sick and may even become life-threatening.</li>
                                <li>Malaria is common in tropical and subtropical regions.</li>
                            </ul>

                            <h3>How Does It Spread?</h3>
                            <ul>
                                <li>**Bite of an infected Anopheles mosquito**</li>
                                <li>Blood transfusion (from infected donors/unsure)</li>
                                <li>Sharing infected needles/syringes (rare)</li>
                                <li>From mother to baby during pregnancy (congenital malaria)</li>
                            </ul>

                            <img
                                src="flow-chart.png" 
                                alt="Malaria lifecycle diagram"
                                className="diagram"
                            />
                        </div>
                        
                        {/* 2. Symptoms Section */}
                        <div id="malaria-symptoms" className="section-block">
                            <h3>Symptoms?</h3>
                            <div className="symptoms-grid">
                                <SymptomCard imageSrc="fever.png" altText="Person with high fever" label="High Fever" />
                                <SymptomCard imageSrc="sweating.jpg" altText="Person with chills and sweating" label="Chills & Sweating" />
                                <SymptomCard imageSrc="headache.jpg" altText="Person with headache and fatigue" label="Headache & Fatigue" />
                                <SymptomCard imageSrc="nausea.jpg" altText="Person feeling nauseous and vomiting" label="Nausea & Vomiting" />
                                <SymptomCard imageSrc="muscle-pain.jpg" altText="Person with muscle pain" label="Muscle Pain" />
                            </div>
                        </div>

                        {/* 3. Prevention & Safety Measures Section */}
                        <div id="malaria-prevention" className="section-block">
                            <h3>Prevention & Safety Measures</h3>
                            <ul>
                                <li>Use **mosquito nets** while sleeping 🛏️</li>
                                <li>Apply **insect repellent** (DEET-based) 🦟</li>
                                <li>Wear long sleeves and clothes to **cover skin** 👚</li>
                                <li>Eliminate **stagnant water** near homes 🗑️</li>
                                <li>Indoor spraying with **insecticides** 🧪</li>
                                <li>Take **preventive antimalarial medicines** in high-risk areas 💊</li>
                            </ul>

                            <div className="important-note">
                                <h4>Important Note</h4>
                                <p>
                                    **Early diagnosis and treatment are crucial.**
                                    <br />
                                    <span className="disclaimer-text">This tool is for educational purposes only, not a replacement for professional medical advice.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="footer">
                Disclaimer: "For educational use only – not medical advice."
            </footer>
        </div>
    );
}