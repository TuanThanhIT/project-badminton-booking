import { generateAccessToken } from "../../src/utils/jwt.js";

export const tokenFor = (user, roleName, branchIds = []) =>
  generateAccessToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: roleName,
    branchIds,
  });

export const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});
