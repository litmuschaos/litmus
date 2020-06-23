export default {
  environment: process.env.NODE_ENV,
  api: {
    url: process.env.REACT_APP_API_HOST || 'http://localhost:8080/api/v1',
  },
  cookies: {
    token: 'token',
  },
  grahqlEndpoint: process.env.REACT_APP_API_HOST || 'http://localhost:8080/query',
};
