import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from './App';
import BlockExplorerPage from './BlockExplorerPage';
import TransactionExplorerPage from './TransactionExplorerPage';
import ContractVerificationPage from './ContractVerificationPage';
import GovernancePage from './GovernancePage';
import NetworkStatsPage from './NetworkStatsPage';
import TokenTrackerPage from './TokenTrackerPage';

const Routes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/block-explorer" component={BlockExplorerPage} />
        <Route path="/transaction-explorer" component={TransactionExplorerPage} />
        <Route path="/contract-verification" component={ContractVerificationPage} />
        <Route path="/governance" component={GovernancePage} />
        <Route path="/network-stats" component={NetworkStatsPage} />
        <Route path="/token-tracker" component={TokenTrackerPage} />
      </Switch>
    </Router>
  );
};

export default Routes;