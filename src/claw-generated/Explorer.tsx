import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import AddressPage from '../explorer/AddressPage';
import TransactionPage from './TransactionPage';

const Explorer: React.FC = () => {
  return (
    <Router>
      <div>
        <h1>ClawChain Explorer</h1>
        <nav>
          <ul>
            <li>
              <Link to="/address/0x1234567890abcdef">Address</Link>
            </li>
            <li>
              <Link to="/transaction/abc123">Transaction</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/address/:address">
            <AddressPage />
          </Route>
          <Route path="/transaction/:transactionId">
            <TransactionPage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default Explorer;