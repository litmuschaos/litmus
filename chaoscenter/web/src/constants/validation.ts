//  ^[a-zA-Z0-9]       # Must start with a letter or digit
//  [a-zA-Z0-9._@+-]   # Allow letters, digits, and the characters . _ - @ + (so emails are valid usernames for Dex SSO correlation)
//  {2,253}$           # Ensure the length of the username is between 3 and 254 characters (1 character is already matched above; 254 is the RFC 5321 max email length)
export const USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._@+-]{2,253}$/;

//  ^(?=.*[a-z])       # At least one lowercase letter
//  (?=.*[A-Z])        # At least one uppercase letter
//  (?=.*\d)           # At least one digit
//  (?=.*[@$!%*?_&#])   # At least one special character @$!%*?_&#
//  [A-Za-z\d@$!%*?_&#] # Allowed characters: letters, digits, special characters @$!%*?_&#
//  {8,16}$            # Length between 8 to 16 characters
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?_&#])[A-Za-z\d@$!%*?_&#]{8,16}$/;

// Image Registry Name validation
// Valid formats: docker.io, gcr.io, quay.io, ghcr.io, registry.k8s.io, my-registry.example.com:5000
// ^[a-z0-9]          # Must start with lowercase letter or digit
// ([a-z0-9.-]*      # Allow lowercase letters, digits, dots, hyphens
// [a-z0-9])?        # Must end with lowercase letter or digit (if more than 1 char)
// (:[0-9]+)?$       # Optional port number
export const IMAGE_REGISTRY_REGEX = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:[0-9]+)?$/;

// Image Repository Name validation
// Valid formats: litmuschaos, my-org/my-repo, library/nginx
// ^[a-z0-9]          # Must start with lowercase letter or digit
// ([a-z0-9._/-]*     # Allow lowercase letters, digits, dots, underscores, slashes, hyphens
// [a-z0-9])?$        # Must end with lowercase letter or digit (if more than 1 char)
export const IMAGE_REPO_REGEX = /^[a-z0-9]([a-z0-9._/-]*[a-z0-9])?$/;

// Kubernetes Secret Name validation (RFC 1123 subdomain)
// Valid formats: my-secret, pull-secret-1, registry.secret
// ^[a-z0-9]          # Must start with lowercase letter or digit
// ([a-z0-9.-]*       # Allow lowercase letters, digits, dots, hyphens
// [a-z0-9])?$        # Must end with lowercase letter or digit (if more than 1 char)
// Max 253 characters (enforced by Yup, not regex)
export const K8S_SECRET_NAME_REGEX = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/;

// Probe run property duration validation (probeTimeout, interval, probePollingInterval, initialDelay, evaluationTimeout)
// The chaos runner parses these fields with Go's time.ParseDuration, so the same formats are accepted here.
// Valid formats: 500ms, 10s, 1m30s, 1.5h, 2h45m (empty is allowed, required fields are checked separately)
// ^$|                            # Empty value
// ^(                             # One or more groups of
//   \d+(\.\d+)?                  # a whole or decimal number
//   (ns|us|µs|μs|ms|s|m|h)       # followed by a unit (µs and μs are the two micro signs Go accepts)
// )+$
export const PROBE_DURATION_REGEX = /^$|^(\d+(\.\d+)?(ns|us|µs|μs|ms|s|m|h))+$/;
