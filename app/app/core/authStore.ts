"use client";

export type UserRole =
  | "Owner"
  | "Manager"
  | "Engineer"
  | "Client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  clientId?: string;
  active: boolean;
};

const STORAGE_KEY = "mason-arc-auth-user";

const users: AuthUser[] = [
  {
    id: "USR-001",
    name: "Mason & Arc Owner",
    email: "Masonandarc@gmail.com",
    role: "Owner",
    active: true,
  },

  {
    id: "USR-002",
    name: "Omar Mohamed",
    email: "omar@masonandarc.com",
    role: "Engineer",
    employeeId: "OM-001",
    active: true,
  },

  {
    id: "USR-003",
    name: "Ahmed Shabaan",
    email: "ahmed@masonandarc.com",
    role: "Engineer",
    employeeId: "AS-001",
    active: true,
  },
];

export function getUsers(): AuthUser[] {
  return users;
}

export function getUserByEmail(
  email: string
): AuthUser | null {
  return (
    users.find(
      (user) =>
        user.email.toLowerCase() ===
        email.trim().toLowerCase() &&
        user.active
    ) ?? null
  );
}

export function login(
  email: string
): AuthUser | null {
  const user = getUserByEmail(email);

  if (!user || typeof window === "undefined") {
    return null;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(user)
  );

  return user;
}

export function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored =
    localStorage.getItem(STORAGE_KEY);

  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export const isDatabaseAuth = process.env.NEXT_PUBLIC_AUTH_MODE === "database";

export async function databaseLogin(email: string, password: string): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(data?.error || "Login failed."));
  return (data?.user as AuthUser) || null;
}

export async function databaseLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function getDatabaseCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json().catch(() => ({}));
  return (data?.user as AuthUser) || null;
}

export function hasRole(
  role: UserRole | UserRole[]
): boolean {
  const user = getCurrentUser();

  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

export function getRolePermissions(role: UserRole): Permission[] {
  return [...permissions[role]];
}

export function getAllRolePermissions(): Record<UserRole, Permission[]> {
  return {
    Owner: getRolePermissions("Owner"),
    Manager: getRolePermissions("Manager"),
    Engineer: getRolePermissions("Engineer"),
    Client: getRolePermissions("Client"),
  };
}

export function canAccess(
  permission: Permission
): boolean {
  const user = getCurrentUser();

  if (!user) return false;

  return permissions[user.role].includes(permission);
}

export const ALL_PERMISSIONS: Permission[] = [
  "projects.view", "projects.manage", "team.view", "team.manage",
  "tasks.view", "tasks.manage", "files.view", "files.manage",
  "approvals.view", "approvals.manage", "finance.view", "finance.manage",
  "site.view", "site.manage", "clients.view", "clients.manage",
];

export type Permission =
  | "projects.view"
  | "projects.manage"
  | "team.view"
  | "team.manage"
  | "tasks.view"
  | "tasks.manage"
  | "files.view"
  | "files.manage"
  | "approvals.view"
  | "approvals.manage"
  | "finance.view"
  | "finance.manage"
  | "site.view"
  | "site.manage"
  | "clients.view"
  | "clients.manage";

const permissions: Record<
  UserRole,
  Permission[]
> = {
  Owner: [
    "projects.view",
    "projects.manage",
    "team.view",
    "team.manage",
    "tasks.view",
    "tasks.manage",
    "files.view",
    "files.manage",
    "approvals.view",
    "approvals.manage",
    "finance.view",
    "finance.manage",
    "site.view",
    "site.manage",
    "clients.view",
    "clients.manage",
  ],

  Manager: [
    "projects.view",
    "projects.manage",
    "team.view",
    "team.manage",
    "tasks.view",
    "tasks.manage",
    "files.view",
    "files.manage",
    "approvals.view",
    "approvals.manage",
    "finance.view",
    "site.view",
    "site.manage",
    "clients.view",
    "clients.manage",
  ],

  Engineer: [
    "projects.view",
    "tasks.view",
    "tasks.manage",
    "files.view",
    "files.manage",
    "site.view",
    "site.manage",
  ],

  Client: [
    "projects.view",
    "files.view",
    "approvals.view",
  ],
};
