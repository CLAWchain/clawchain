import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ContractVerificationPage from './ContractVerificationPage';
import AppPage from './AppPage';
import BlockExplorerPage from './BlockExplorerPage';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppPage />} />
        <Route path="/contract-verification" element={<ContractVerificationPage />} />
        <Route path="/block-explorer" element={<BlockExplorerPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;