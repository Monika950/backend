export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export const PASSWORD_MESSAGE =
  'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.';
