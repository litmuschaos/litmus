import type { APIConfig } from '@api/LitmusAPIProvider';

let auth: string;
let chaosManager: string;
let ngPlatform: string;
let ngLogging: string;
let sockURL: string;

if (__DEV__) {
  auth = `/auth`;
  chaosManager = `/chaos/manager/api`;
  sockURL = `ws://${window.location.hostname}:8080`;
  ngPlatform = `/ng/api`;
  ngLogging = `/log-service`;
} else {
  auth = `${window.location.origin}/auth`;
  chaosManager = `${window.location.origin}/gateway/chaos/manager/api`;
  ngPlatform = `${window.location.origin}/gateway/ng/api`;
  ngLogging = `${window.location.origin}/gateway/log-service`;
  sockURL = `wss://${window.location.host}/chaos/ws`;
}

const APIEndpoints: APIConfig = {
  gqlEndpoints: {
    chaosManagerUri: `${chaosManager}/query`,
    sockURL: process.env.GQL_WS_API || `${sockURL}/query`
  },
  restEndpoints: {
    authUri: auth,
    ngPlatformUri: ngPlatform,
    ngLoggingUri: ngLogging,
    chaosManagerUri: chaosManager
  }
};

export default APIEndpoints;
