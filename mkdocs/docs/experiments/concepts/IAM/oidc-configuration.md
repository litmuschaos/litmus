# Generic OIDC Configuration

Litmus Chaos Center supports OpenID Connect (OIDC) for authentication. This guide explains how to configure a generic OIDC provider, using **Dex** as an example.

## Prerequisites

- Litigation Chaos Center installed (version 3.0.0 or later recommended).
- An OIDC provider (e.g., Dex, Keycloak, Okta, Google, etc.).

## Enable OIDC Authentication

To enable OIDC authentication in Litmus Chaos Center, you need to configure the `limus-portal-server` (chaos-center) deployment with specific environment variables.

### Environment Variables

The following environment variables are required to enable and configure OIDC:

| Variable | Description | Example |
|----------|-------------|---------|
| `OIDC_ENABLED` | Set to `true` to enable OIDC authentication. | `true` |
| `OAUTH_CALLBACK_URL` | The callback URL where the OIDC provider will redirect after authentication. | `http://<chaos-center-domain>/auth/dex/callback` |
| `OAUTH_CLIENT_ID` | The Client ID registered with your OIDC provider. | `LitmusPortalAuthBackend` |
| `DEX_OAUTH_CLIENT_SECRET` | The Client Secret registered with your OIDC provider. | `ZXhhbXBsZS1hcHAtc2VjcmV0` |
| `OIDC_ISSUER` | The issuer URL of your OIDC provider. | `http://dex-server:5556/dex` |
| `OAUTH_SECRET` | A secret used to sign the internal JWTs. | `my-secret-key` |

### Configuration Steps

1. **Edit the Deployment**:
   Locate the deployment for the authentication server (usually part of `litmus-portal-server` or `litmus-auth-server`) and update the environment variables.

   ```yaml
   env:
     - name: OIDC_ENABLED
       value: "true"
     - name: OAUTH_CALLBACK_URL
       value: "http://<your-litmus-domain>/auth/dex/callback"
     - name: OAUTH_CLIENT_ID
       value: "LitmusPortalAuthBackend"
     - name: DEX_OAUTH_CLIENT_SECRET
       value: "your-client-secret"
     - name: OIDC_ISSUER
       value: "http://<your-oidc-provider-url>"
   ```

2. **Apply Changes**:
   Apply the updated deployment manifest to your cluster.

   ```bash
   kubectl apply -f <your-deployment-file>.yaml -n litmus
   ```

## Example: Configuring with Dex

[Dex](https://dexidp.io/) is an identity service that uses OpenID Connect to drive authentication for other apps. Here is a conceptual example of how to set up Dex to work with Litmus.

### 1. Dex Configuration (`config.yaml`)

Configure Dex with a static client that matches your Litmus configuration.

```yaml
issuer: http://dex-service:5556/dex

storage:
  type: kubernetes
  config:
    inCluster: true

web:
  http: 0.0.0.0:5556

staticClients:
  - id: LitmusPortalAuthBackend
    redirectURIs:
      - 'http://<your-litmus-domain>/auth/dex/callback'
    name: 'LitmusPortalAuthBackend'
    secret: your-client-secret

connectors:
  - type: mockCallback
    id: mock
    name: Mock
```

### 2. Deploy Dex

Deploy Dex to your cluster. Ensure the `issuer` URL in the Dex config is accessible from the Litmus Chaos Center services.

### 3. Configure Litmus

Update your Litmus installation to point to the Dex service:

- `OIDC_ISSUER`: `http://dex-service:5556/dex`
- `OAUTH_CLIENT_ID`: `LitmusPortalAuthBackend`
- `DEX_OAUTH_CLIENT_SECRET`: `your-client-secret`

Once configured, the "Login with OIDC" (or similar) option should appear on the Litmus login page.
