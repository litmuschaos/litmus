import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AppWithAuthentication, AppWithoutAuthentication } from 'app/App';
import './bootstrap.scss';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path={'/project/:projectID'}>
        <AppWithAuthentication />
      </Route>
      <Route path="/">
        <AppWithoutAuthentication />
      </Route>
    </Switch>
  </BrowserRouter>,
  document.getElementById('react-root')
);
