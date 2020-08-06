export default {
  environment: process.env.NODE_ENV,
  analytics: {
    url:
      process.env.ANALYTICS_API || 'https://hub.litmuschaos.io/api/community',
  },
  auth: {
    url: process.env.AUTH_API || '/auth',
  },
  cookies: {
    token: 'token',
  },
  grahqlEndpoint: process.env.GQL_API || 'localhost:8080/query',
};
