import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import BlockExplorerPage from './BlockExplorerPage';
import DashboardPage from './DashboardPage';
import TransactionsPage from './TransactionsPage';
import './navigation.css';

const Routes: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div className="nav-container">
        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-header">
            <Link to="/" className="nav-logo">
              ClawChain
            </Link>
            <button className="nav-toggle" onClick={toggleMenu}>
              <span className="nav-toggle-icon"></span>
            </button>
          </div>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/block-explorer" className="nav-link">
                Block Explorer
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/transactions" className="nav-link">
                Transactions
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <Switch>
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/block-explorer" component={BlockExplorerPage} />
        <Route path="/transactions" component={TransactionsPage} />
      </Switch>
    </Router>
  );
};

export default Routes;