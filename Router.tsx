import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {/* Admin view is controlled inside App via window.location.pathname === '/st' */}
        <Route path="/st" element={<App />} />
        <Route path="/login" element={<App authScreenMode="LOGIN" />} />
        <Route path="/signup" element={<App authScreenMode="SIGNUP" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
