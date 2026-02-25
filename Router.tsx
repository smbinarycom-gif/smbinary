import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './LandingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import useAuth from './auth/useAuth';

const LandingWrapper: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  return <LandingPage />;
};

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingWrapper />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/trade" element={<App />} />
        {/* Admin view is controlled inside App via /st */}
        <Route path="/st" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
