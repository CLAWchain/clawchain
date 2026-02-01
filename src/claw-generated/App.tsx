import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import BlockExplorer from './BlockExplorer';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Block Explorer</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/">
            <BlockExplorer />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;