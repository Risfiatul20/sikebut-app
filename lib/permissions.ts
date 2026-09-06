export type Role = "Admin" | "Kepala OPD" | "Kepala Sub Unit" | "PPK" | "Verifikator"

export type ActionKey =
  | "paket:view"
  | "paket:create"
  | "paket:edit"
  | "paket:delete"
  | "paket:ajukan"
  | "paket:review"
  | "user:manage"
  | "user:create"
  | "user:delete"
  | "laporan:view"
  | "setting:view"

export const ROLE_ACTIONS: Partial<Record<Role, ActionKey[]>> = {
  Verifikator: ["paket:view", "paket:review", "laporan:view", "setting:view"],
  "Kepala OPD": ["paket:view", "laporan:view", "user:manage", "user:create", "setting:view"],
  "Kepala Sub Unit": ["paket:view", "user:manage", "user:create", "setting:view"],
  PPK: ["paket:view", "paket:create", "paket:edit", "paket:delete", "paket:ajukan", "setting:view"],
}

// Hierarki pembuatan akun (poin 1-3 docs/alur.md)
export const CREATABLE_ROLES: Partial<Record<Role, Role[]>> = {
  Admin: ["Admin", "Kepala OPD", "Kepala Sub Unit", "PPK", "Verifikator"],
  "Kepala OPD": ["Kepala Sub Unit"],
  "Kepala Sub Unit": ["PPK"],
}

export function hasAction(role: string | undefined, action: ActionKey): boolean {
  const r = (role ?? "").toLowerCase().trim()
  if (r === "admin") return true
  return (ROLE_ACTIONS[role as Role] ?? []).includes(action)
}

export function canCreateRole(actorRole: string, targetRole: string): boolean {
  const r = actorRole.toLowerCase().trim()
  if (r === "admin") return true
  return (CREATABLE_ROLES[actorRole as Role] ?? []).includes(targetRole as Role)
}

export function getCreatableRoles(actorRole: string): Role[] {
  const r = actorRole.toLowerCase().trim()
  if (r === "admin") return ["Admin", "Kepala OPD", "Kepala Sub Unit", "PPK", "Verifikator"]
  return CREATABLE_ROLES[actorRole as Role] ?? []
}
