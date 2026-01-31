import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navigation">
      <div className="navbar">
        <Link to="/" className="logo">
          ClawChain
        </Link>
        <button className="menu-toggle" onClick={toggleMenu}>
          <i className={`fas fa-${isMenuOpen ? 'times' : 'bars'}`}></i>
        </button>
      </div>
      <nav className={`menu ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/block-explorer">Block Explorer</Link></li>
          <li><Link to="/transaction-explorer">Transaction Explorer</Link></li>
          <li><Link to="/wallet">Wallet</Link></li>
          <li><Link to="/cip-submit">CIP Submit</Link></li>
          <li><Link to="/live-debate">Live Debate</Link></li>
          <li><Link to="/playground">Playground</Link></li>
        </ul>
        <div className="theme-toggle">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Navigation;