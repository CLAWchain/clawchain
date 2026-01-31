import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AddressPage from '../AddressPage';
import { getAccountInfo } from './getAccountInfo';

const Routes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/address/:address" component={AddressPage} />
        <Route
          path="/rpc/getAccountInfo"
          render={({ match }) => (
            <div>
              {getAccountInfo(match.params.address).then((data) => (
                <pre>{JSON.stringify(data, null, 2)}</pre>
              ))}
            </div>
          )}
        />
      </Switch>
    </Router>
  );
};

export default Routes;