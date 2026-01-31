import React from 'react';
import WalletManager from './WalletManager';

const App: React.FC = () => {
  return (
    <div className="app">
      <header>
        <h1>ClawChain</h1>
      </header>
      <main>
        <WalletManager />
        {/* Other app components */}
      </main>
    </div>
  );
};

export default App;