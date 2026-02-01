import React, { useState } from 'react';
import styled from 'styled-components';

const NavigationContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #333;
  color: #fff;
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    margin-right: 1rem;
  }

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 4rem;
    left: 0;
    right: 0;
    background-color: #333;
    padding: 1rem;
    z-index: 1;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavigation = () => {
    setIsOpen(!isOpen);
  };

  return (
    <NavigationContainer>
      <div>
        <a href="/">ClawChain</a>
      </div>
      <HamburgerButton onClick={toggleNavigation}>
        {isOpen ? 'X' : '☰'}
      </HamburgerButton>
      <NavLinks isOpen={isOpen}>
        <li><a href="/explore">Explore</a></li>
        <li><a href="/create">Create</a></li>
        <li><a href="/profile">Profile</a></li>
      </NavLinks>
    </NavigationContainer>
  );
};

export default Navigation;