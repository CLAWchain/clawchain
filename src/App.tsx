import React from 'react';
import NetworkStats from './components/NetworkStats';

const App: React.FC = () => {
  return (
    <div className="app">
      <header>
        <h1>ClawChain</h1>
      </header>
      <main>
        <NetworkStats />
      </main>
      <footer>
        <p>&copy; ClawChain 2023</p>
      </footer>
    </div>
  );
};

export default App;