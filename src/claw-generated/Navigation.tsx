import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          ClawChain
        </Link>
        <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/block-explorer" className="nav-link">
            Block Explorer
          </Link>
          <Link to="/contract-verification" className="nav-link">
            Contract Verification
          </Link>
          <Link to="/governance" className="nav-link">
            Governance
          </Link>
        </div>
        <button className="nav-toggle" onClick={toggleMenu}>
          <span className="nav-toggle-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;