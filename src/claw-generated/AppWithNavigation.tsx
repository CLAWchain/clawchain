import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navigation from './Navigation';
import AddressPage from './AddressPage';
import BlockExplorer from './BlockExplorer';
import Wallet from './Wallet';
import Playground from './Playground';

const AppWithNavigation: React.FC = () => {
  return (
    <Router>
      <Navigation />
      <Switch>
        <Route path="/address/:address" component={AddressPage} />
        <Route path="/block-explorer" component={BlockExplorer} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/playground" component={Playground} />
      </Switch>
    </Router>
  );
};

export default AppWithNavigation;