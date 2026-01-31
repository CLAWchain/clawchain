import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import WalletConnectionFlow from './WalletConnectionFlow';
import NetworkStatsPage from './NetworkStatsPage';
import TransactionExplorerPage from './TransactionExplorerPage';
import ContractVerificationPage from './ContractVerificationPage';
import GovernancePage from './GovernancePage';
import TokenTrackerPage from './TokenTrackerPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <header>
          <WalletConnectionFlow />
        </header>
        <main>
          <Switch>
            <Route path="/network-stats" component={NetworkStatsPage} />
            <Route path="/transactions" component={TransactionExplorerPage} />
            <Route path="/contracts" component={ContractVerificationPage} />
            <Route path="/governance" component={GovernancePage} />
            <Route path="/tokens" component={TokenTrackerPage} />
          </Switch>
        </main>
      </div>
    </Router>
  );
};

export default App;