import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navigation from './Navigation';
import AddressPage from './AddressPage';
import BlockExplorerPage from './BlockExplorerPage';
import ContractVerificationPage from './ContractVerificationPage';
import TokenTrackerPage from './TokenTrackerPage';
import TransactionExplorerPage from './TransactionExplorerPage';
import NetworkStatsPage from './NetworkStatsPage';
import ThemeToggle from './ThemeToggle';
import './theme.css';

const App: React.FC = () => {
  useEffect(() => {
    // Apply the initial theme when the app mounts
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      document.documentElement.classList.add(`theme-${storedTheme}`);
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <ThemeToggle />
        <Navigation />
        <Switch>
          <Route path="/address/:address" component={AddressPage} />
          <Route path="/blocks" component={BlockExplorerPage} />
          <Route path="/contracts" component={ContractVerificationPage} />
          <Route path="/tokens" component={TokenTrackerPage} />
          <Route path="/transactions" component={TransactionExplorerPage} />
          <Route path="/network-stats" component={NetworkStatsPage} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;