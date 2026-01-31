import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import WalletConnectionModal from './WalletConnectionModal';
import AddressPage from './AddressPage';
import TransactionExplorerPage from './TransactionExplorerPage';
import BlockExplorerPage from './BlockExplorerPage';
import ContractVerificationPage from './ContractVerificationPage';
import { WalletService } from './wallet/index';

const App: React.FC = () => {
  const [connectedAccount, setConnectedAccount] = useState('');

  useEffect(() => {
    const walletService = new WalletService();
    const connectedAccount = walletService.getConnectedAccount();
    setConnectedAccount(connectedAccount);
  }, []);

  return (
    <Router>
      <div className="app">
        <header>
          <nav>
            <ul>
              <li><Link to="/">Address</Link></li>
              <li><Link to="/transactions">Transactions</Link></li>
              <li><Link to="/blocks">Blocks</Link></li>
              <li><Link to="/contracts">Contract Verification</Link></li>
            </ul>
            <WalletConnectionModal />
          </nav>
        </header>

        <main>
          <Switch>
            <Route path="/transactions">
              <TransactionExplorerPage />
            </Route>
            <Route path="/blocks">
              <BlockExplorerPage />
            </Route>
            <Route path="/contracts">
              <ContractVerificationPage />
            </Route>
            <Route path="/">
              <AddressPage connectedAccount={connectedAccount} />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
};

export default App;