import React from 'react';
import ThemeToggle from './ThemeToggle';

const App = () => {
  return (
    <div className="app">
      <header>
        <h1>ClawChain</h1>
        <ThemeToggle />
      </header>
      <main>
        {/* Your application content goes here */}
      </main>
      <footer>
        <p>&copy; ClawChain 2023</p>
      </footer>
    </div>
  );
};

export default App;