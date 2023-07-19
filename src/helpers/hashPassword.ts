import { hashSync, genSaltSync, compareSync } from "bcryptjs";

export const hashUsersPassword = (password: string): string => {
  const salt = genSaltSync(7);
  return hashSync(password, salt);
};

export const checkPasswords = (
  currentPassword: string,
  usersHashPassword: string
): boolean => {
  return compareSync(currentPassword, usersHashPassword);
};
