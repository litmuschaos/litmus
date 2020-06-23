import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReduxRoot } from "./ReduxRoot";

const rootEl = document.getElementById("root");
ReactDOM.render(<ReduxRoot />, rootEl);

// comment in for PWA with service worker in production mode
// registerServiceWorker();
