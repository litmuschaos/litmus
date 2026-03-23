// Username validation - accepts email addresses or plain usernames
// (?=.{3,256}$)      # Length between 3 and 256 characters
// ^(?:               # Start of alternatives
//   [a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9] # Plain username: letters/digits/_/- only, alphanumeric start/end
//   |                # OR
//   [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,} # Email address
// )$                 # End of alternatives
export const USERNAME_REGEX =
  /^(?=.{3,256}$)(?:[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,})$/;

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
