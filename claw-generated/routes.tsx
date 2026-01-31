import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AddressPage from './AddressPage';

const Routes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/address/:address" component={AddressPage} />
      </Switch>
    </Router>
  );
};

export default Routes;