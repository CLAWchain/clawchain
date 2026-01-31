import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ContractVerificationPage from './ContractVerificationPage';
import AppPage from './AppPage';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppPage />} />
        <Route path="/contract-verification" element={<ContractVerificationPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;