import React from 'react';
import WalletProvider from './WalletProvider';
import WalletModal from './WalletModal';

const App = () => {
  return (
    <WalletProvider>
      <div className="app">
        <header>
          <h1>ClawChain</h1>
        </header>
        <main>
          <WalletModal />
          {/* Other app content goes here */}
        </main>
      </div>
    </WalletProvider>
  );
};

export default App;