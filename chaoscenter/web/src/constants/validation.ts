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
