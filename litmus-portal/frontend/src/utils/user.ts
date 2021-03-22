function userInitials(name: string): string {
  /**
   * Funtion to return the initials of a users name
   * @param {string} name - The string from which initials need to be extracted
   * @return {string} instance - The concatenated initials of the @param name
   */

  try {
    // Trim to ensure no trailing whitespaces, and,
    // Split the name based on white spaces in between
    const nameArray = name.trim().split(' ');
    // if no last name is entered, return the first name's initial letter
    if (nameArray.length < 2) {
      return nameArray[0][0].toUpperCase();
    }
    // concatenate first and last word's first letter to ensure
    // middle name, aliases, etc. don't get counted
    return (
      nameArray[0][0].toUpperCase() +
      nameArray[nameArray.length - 1][0].toUpperCase()
    );
  } catch (error) {
    console.error(
      'Error in extracting the user name: ',
      error,
      "returning '' for now..."
    );
    return '';
  }
}

export { userInitials };
