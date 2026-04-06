/**
 * Bootstrap file for Litmus frontend with base path support
 * Signed-off-by: NETIZEN-11 <kumarnitesh121411@gmail.com>
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AppWithAuthentication, AppWithoutAuthentication } from 'app/App';
import './bootstrap.scss';

// Get the base path from the environment or default to '/'
// Ensure it starts with '/' and doesn't end with '/' unless it's just '/'
function getBasePath(): string {
  const publicUrl = process.env.PUBLIC_URL || '/';
  const basePath = publicUrl.replace(/\/+$/, '') || '/';
  return basePath;
}

const basename = getBasePath();

ReactDOM.render(
  <BrowserRouter basename={basename}>
    <Switch>
      <Route path={'/account/:accountID'}>
        <AppWithAuthentication />
      </Route>
      <Route path="/">
        <AppWithoutAuthentication />
      </Route>
    </Switch>
  </BrowserRouter>,
  document.getElementById('react-root')
);
