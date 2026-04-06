# Litmus Frontend Base Path Configuration

This document explains how to configure Litmus frontend to work from a non-root path (e.g., `/litmus` instead of `/`).

## Overview

The Litmus frontend now supports serving from custom base paths, allowing you to deploy it behind path-based routing (e.g., Traefik, nginx-ingress) in scenarios where you need to host multiple applications under a single domain.

## Configuration

### Environment Variable

The base path is configured using the `PUBLIC_URL` environment variable:

- **Default**: `/` (serves from root)
- **Custom**: `/litmus`, `/chaos`, or any custom path

### Examples

#### Root Path (Default)
```yaml
env:
  - name: PUBLIC_URL
    value: "/"
```
Access: `https://example.com/`

#### Subpath
```yaml
env:
  - name: PUBLIC_URL
    value: "/litmus"
```
Access: `https://example.com/litmus`

## Deployment Methods

### 1. Kubernetes Deployment

Update your deployment manifest to include the `PUBLIC_URL` environment variable:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litmusportal-frontend
spec:
  template:
    spec:
      containers:
        - name: litmusportal-frontend
          image: litmuschaos/litmusportal-frontend:latest
          env:
            - name: PUBLIC_URL
              value: "/litmus"  # Your custom base path
```

### 2. Docker Run

```bash
docker run -e PUBLIC_URL=/litmus -p 8185:8185 litmuschaos/litmusportal-frontend:latest
```

### 3. Docker Compose

```yaml
version: '3'
services:
  frontend:
    image: litmuschaos/litmusportal-frontend:latest
    environment:
      - PUBLIC_URL=/litmus
    ports:
      - "8185:8185"
```

## Ingress Configuration

### Traefik

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: litmus-ingress
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /litmus
            pathType: Prefix
            backend:
              service:
                name: litmusportal-frontend-service
                port:
                  number: 9091
```

### Nginx Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: litmus-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /litmus(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: litmusportal-frontend-service
                port:
                  number: 9091
```

## Building with Custom Base Path

### Development

```bash
cd chaoscenter/web
PUBLIC_URL=/litmus yarn dev
```

### Production Build

```bash
cd chaoscenter/web
PUBLIC_URL=/litmus yarn build
```

### Docker Build

```bash
cd chaoscenter/web
docker build --build-arg PUBLIC_URL=/litmus -t litmusportal-frontend:custom .
```

## How It Works

1. **Webpack Configuration**: The `PUBLIC_URL` environment variable is used to set the `publicPath` in webpack, ensuring all assets (JS, CSS, images) are loaded from the correct path.

2. **HTML Base Tag**: The `index.html` template includes a `<base>` tag that's dynamically set to the `PUBLIC_URL`, making all relative URLs resolve correctly.

3. **React Router**: The `BrowserRouter` component is configured with a `basename` prop set to the `PUBLIC_URL`, ensuring all client-side routing works correctly.

4. **Nginx Configuration**: The entrypoint script dynamically generates the nginx configuration based on the `PUBLIC_URL`, setting up the correct location blocks for serving static files and proxying API requests.

## Troubleshooting

### Assets Not Loading

**Problem**: JavaScript, CSS, or images return 404 errors.

**Solution**: Ensure the `PUBLIC_URL` environment variable is set correctly in your deployment and matches your ingress path.

### Routing Issues

**Problem**: Page refresh on nested routes returns 404.

**Solution**: Verify your ingress configuration includes proper rewrite rules and the nginx configuration is correctly generated.

### API Calls Failing

**Problem**: API requests return 404 or CORS errors.

**Solution**: Check that the nginx proxy configuration is correctly routing `/auth/` and `/api/` requests to the backend services.

### Trailing Slash Issues

**Problem**: Routes work with trailing slash but not without (or vice versa).

**Solution**: The configuration handles both cases automatically. If issues persist, check your ingress annotations.

## Testing

### Local Testing

1. Build with custom base path:
   ```bash
   PUBLIC_URL=/litmus yarn build
   ```

2. Serve locally:
   ```bash
   cd dist
   python3 -m http.server 8080
   ```

3. Access at: `http://localhost:8080/litmus`

### Kubernetes Testing

1. Deploy with custom base path
2. Port-forward to the service:
   ```bash
   kubectl port-forward svc/litmusportal-frontend-service 9091:9091
   ```
3. Access at: `http://localhost:9091/litmus`

## Migration Guide

### From Root Path to Subpath

1. Update your deployment manifest to include `PUBLIC_URL` environment variable
2. Update your ingress configuration to route to the new path
3. Rebuild and redeploy the frontend container
4. Update any bookmarks or links to use the new path

### From Subpath to Root Path

1. Set `PUBLIC_URL` to `/` (or remove the environment variable)
2. Update your ingress configuration
3. Rebuild and redeploy the frontend container

## Backward Compatibility

The default behavior (serving from root path `/`) is maintained when `PUBLIC_URL` is not set, ensuring existing deployments continue to work without any changes.

## Support

For issues or questions:
- GitHub Issues: https://github.com/litmuschaos/litmus/issues
- Slack: https://slack.litmuschaos.io/

---

Signed-off-by: NETIZEN-11 <kumarnitesh121411@gmail.com>
