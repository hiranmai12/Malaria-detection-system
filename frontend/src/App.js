

// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import { AuthProvider } from "./components/AuthContext";// <-- NEW IMPORT
import Header from "./components/Header"; // <-- NEW IMPORT
import ProtectedRoute from "./components/ProtectedRoute";
import SettingsPage from "./components/Settings";
import LoginPage from "./components/login";
import SignUpPage from "./components/signup";
import AboutPage from "./components/aboutUs";
import DashboardPage from "./components/dashboard";
import ViewProfilePage from "./components/ViewProfile";
import ResultPage from "./components/ResultPage";
import History from "./components/History";
import Instructions from "./components/InstructionsPage";

const GOOGLE_CLIENT_ID = "772531021069-k88a6pt71qi3vdn4n8o7pa7em9jocepe.apps.googleusercontent.com"; 

// App.js (Updated Routing Structure)
// Assuming all necessary components are imported at the top of the file

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          {/* Header is outside of Routes so it appears on ALL pages */}
          <Header /> 
          
          <Routes>
              
              {/* PUBLIC ROUTES (Accessible to everyone) */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/instructions" element={<Instructions/>}/>
              
              {/* PROTECTED ROUTES (Requires user to be logged in via AuthProvider) */}
              {/* NOTE: These routes enforce the token check using the ProtectedRoute component. */}
              
              <Route 
                  path="/history" 
                  element={
                      <ProtectedRoute>
                          <History />
                      </ProtectedRoute>
                  }
              />
              
              <Route 
                  path="/profile" 
                  element={
                      <ProtectedRoute>
                          <ViewProfilePage /> 
                      </ProtectedRoute>
                  } 
              />
              
              <Route 
                  path="/profile/settings" 
                  element={
                      <ProtectedRoute>
                          <SettingsPage /> 
                      </ProtectedRoute>
                  } 
              />
              
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}