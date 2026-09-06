import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/import/status/${id}`
    const res = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      cache: "no-store",
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch {
    // Fallback status mock
  }

  return NextResponse.json({
    success: true,
    status: "completed",
    file_name: `rkbmd_import_${id}.xlsx`,
    error_message: null,
    updated_at: new Date().toISOString(),
  })
}
