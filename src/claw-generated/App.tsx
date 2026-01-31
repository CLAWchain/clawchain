import React from 'react';
import ContractVerification from './ContractVerification';

const App: React.FC = () => {
  return (
    <div>
      <header>
        <h1>ClawChain</h1>
      </header>
      <main>
        <ContractVerification />
      </main>
    </div>
  );
};

export default App;