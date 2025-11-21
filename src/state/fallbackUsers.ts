/**
 * Emergency Fallback Users
 *
 * This file contains hardcoded user data as a last resort for devices
 * that cannot connect to Firebase. Only used when Firebase is completely
 * unreachable.
 */

export const FALLBACK_USERS = [
  {
    id: "user_debs_default",
    name: "Deborah Walker",
    nickname: "Debs",
    email: "debs@7more.net",
    role: "admin" as const,
    roles: ["admin" as const],
    password: "dwalker",
    invitedAt: "2025-11-17T21:55:14.054Z",
    invitedBy: "system",
    requiresPasswordChange: false,
  },
  {
    id: "admin_default",
    name: "Kendall",
    email: "kendall@7more.net",
    role: "admin" as const,
    roles: ["admin" as const],
    password: "7moreHouston!",
    invitedAt: "2025-11-21T21:48:41.615Z",
    invitedBy: "system",
    requiresPasswordChange: false,
  },
];
