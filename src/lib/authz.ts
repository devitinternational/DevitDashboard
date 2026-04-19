export type DashboardRole = "ADMIN" | "CREATOR" | "LEARNER";

const creatorAllowedPrefixes = ["/dashboard", "/domains"] as const;

export function isAdminRole(role?: string | null): role is "ADMIN" {
  return role === "ADMIN";
}

export function isCreatorRole(role?: string | null): role is "CREATOR" {
  return role === "CREATOR";
}

export function canAccessDashboardPath(
  role: string | null | undefined,
  pathname: string,
) {
  if (isAdminRole(role)) return true;
  if (!isCreatorRole(role)) return false;

  return creatorAllowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function canManageDomains(role: string | null | undefined) {
  return isAdminRole(role) || isCreatorRole(role);
}
