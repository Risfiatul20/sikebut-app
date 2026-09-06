"use client"

import { useSession } from "next-auth/react"
import { hasAction, canCreateRole, getCreatableRoles, type ActionKey } from "@/lib/permissions"

export function usePermission() {
  const { data: session } = useSession()
  const role = session?.user?.role || ""

  const can = (action: ActionKey) => hasAction(role, action)
  const canCreate = (targetRole: string) => canCreateRole(role, targetRole)
  const creatableRoles = () => getCreatableRoles(role)

  return { role, can, canCreate, creatableRoles }
}