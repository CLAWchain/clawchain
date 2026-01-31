import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navigation from './Navigation';
import NetworkStatsPage from './NetworkStatsPage';
import TransactionExplorerPage from './TransactionExplorerPage';
import ContractVerificationPage from './ContractVerificationPage';
import GovernancePage from './GovernancePage';
import ThemeToggle from './ThemeToggle';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <ThemeToggle />
        <Switch>
          <Route path="/network-stats" component={NetworkStatsPage} />
          <Route path="/transactions" component={TransactionExplorerPage} />
          <Route path="/contract-verification" component={ContractVerificationPage} />
          <Route path="/governance" component={GovernancePage} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;