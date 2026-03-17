//  ^[a-zA-Z]          # Must start with a letter
//  [a-zA-Z0-9_-]      # Allow letters, digits, underscores, and hyphens
//  {2,15}$            # Ensure the length of the username is between 3 and 16 characters (1 character is already matched above)
export const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]{2,15}$/;

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
