export default {
  environment: process.env.NODE_ENV,
  analytics: {
    url:
      process.env.ANALYTICS_API || 'https://hub.litmuschaos.io/api/community',
  },
  auth: {
    url: process.env.AUTH_API || 'http://3.136.2.227:31374',
  },
  cookies: {
    token: 'token',
  },
  grahqlEndpoint:
    process.env.REACT_APP_API_HOST || 'http://localhost:8080/query',
};
