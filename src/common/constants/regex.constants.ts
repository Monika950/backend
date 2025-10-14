export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const PASSWORD_MESSAGE =
  'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.';
