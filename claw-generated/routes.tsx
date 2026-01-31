import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import BlockExplorerPage from './BlockExplorerPage';

const Routes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/block-explorer" component={BlockExplorerPage} />
        {/* Add other routes here */}
      </Switch>
    </Router>
  );
};

export default Routes;