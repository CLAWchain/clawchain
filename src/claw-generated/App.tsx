import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import NetworkStatsBoard from './NetworkStatsBoard';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <header>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/network-stats">Network Stats</Link></li>
              {/* Add more navigation links as needed */}
            </ul>
          </nav>
        </header>

        <main>
          <Switch>
            <Route path="/network-stats">
              <NetworkStatsBoard />
            </Route>
            <Route path="/">
              {/* Add other pages as needed */}
            </Route>
          </Switch>
        </main>

        <footer>
          {/* Add footer content as needed */}
        </footer>
      </div>
    </Router>
  );
};

export default App;