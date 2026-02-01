import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navigation">
      <div className="navigation-container">
        <div className="logo">
          <Link to="/">ClawChain</Link>
        </div>
        <nav className={`navigation-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/block-explorer">Block Explorer</Link></li>
            <li><Link to="/wallet">Wallet</Link></li>
            <li><Link to="/playground">Playground</Link></li>
          </ul>
        </nav>
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
      </div>
    </header>
  );
};

export default Navigation;