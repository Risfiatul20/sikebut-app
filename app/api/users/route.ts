import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { INITIAL_USERS, MOCK_SKPD, MOCK_SUB_KEGIATAN } from "@/lib/mock-users"
import { User, UserRole, UserListResponse } from "@/types/user"

// In-memory state for dev fallback if backend is not reachable
let usersStore: User[] = [...INITIAL_USERS]

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || searchParams.get("q") || ""
  const role = searchParams.get("role") || ""
  const kode_skpd = searchParams.get("kode_skpd") || ""
  const sort_by = searchParams.get("sort_by") || searchParams.get("sort")?.split(":")[0] || "nama"
  const sort_direction = searchParams.get("sort_direction") || searchParams.get("sort")?.split(":")[1] || "asc"
  const per_page = parseInt(searchParams.get("per_page") || searchParams.get("limit") || "10", 10)
  const page = parseInt(searchParams.get("page") || "1", 10)

  // Mencoba fetch langsung ke backend Laravel jika aktif
  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/users?${searchParams.toString()}`
    const backendRes = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      cache: "no-store",
    })

    if (backendRes.ok) {
      const data: UserListResponse = await backendRes.json()
      return NextResponse.json(data)
    }
  } catch {
    // Backend offline / mode dev lokal: gunakan fallback in-memory store
  }

  // Fallback In-memory data matching docs/users.md format
  const filtered = usersStore.filter((user) => {
    if (search) {
      const q = search.toLowerCase().trim()
      const matchNama = user.nama.toLowerCase().includes(q)
      const matchUsername = user.username.toLowerCase().includes(q)
      const matchNip = user.info?.nip?.toLowerCase().includes(q) || false
      const matchSkpd = user.skpd?.nama_skpd?.toLowerCase().includes(q) || user.kode_skpd?.toLowerCase().includes(q) || false
      const matchJabatan = user.info?.jabatan?.toLowerCase().includes(q) || false
      const matchSub = user.sub_kegiatan?.some(s => s.nama_sub_kegiatan.toLowerCase().includes(q) || s.kode_sub_kegiatan.toLowerCase().includes(q)) || false
      if (!matchNama && !matchUsername && !matchNip && !matchSkpd && !matchJabatan && !matchSub) {
        return false
      }
    }

    if (role && role !== "ALL" && user.role !== role) {
      return false
    }

    if (kode_skpd && kode_skpd !== "ALL" && user.kode_skpd !== kode_skpd) {
      return false
    }

    return true
  })

  // Sorting
  filtered.sort((a, b) => {
    let aVal = ""
    let bVal = ""

    if (sort_by === "nip") {
      aVal = a.info?.nip ?? ""
      bVal = b.info?.nip ?? ""
    } else if (sort_by === "jabatan") {
      aVal = a.info?.jabatan ?? ""
      bVal = b.info?.jabatan ?? ""
    } else if (sort_by === "nama") {
      aVal = a.nama
      bVal = b.nama
    } else if (sort_by === "username") {
      aVal = a.username
      bVal = b.username
    } else if (sort_by === "role") {
      aVal = a.role
      bVal = b.role
    } else if (sort_by === "kode_skpd" || sort_by === "skpd") {
      aVal = a.skpd?.nama_skpd ?? a.kode_skpd ?? ""
      bVal = b.skpd?.nama_skpd ?? b.kode_skpd ?? ""
    } else if (sort_by === "created_at") {
      aVal = a.created_at
      bVal = b.created_at
    }

    if (aVal < bVal) return sort_direction === "asc" ? -1 : 1
    if (aVal > bVal) return sort_direction === "asc" ? 1 : -1
    return 0
  })

  // Pagination
  const total = filtered.length
  const last_page = Math.max(1, Math.ceil(total / per_page))
  const from = total > 0 ? (page - 1) * per_page + 1 : 0
  const to = Math.min(page * per_page, total)
  const paginatedData = filtered.slice((page - 1) * per_page, page * per_page)

  const responsePayload: UserListResponse = {
    data: paginatedData,
    links: {
      first: `http://localhost:8000/api/v1/users?page=1`,
      last: `http://localhost:8000/api/v1/users?page=${last_page}`,
      prev: page > 1 ? `http://localhost:8000/api/v1/users?page=${page - 1}` : null,
      next: page < last_page ? `http://localhost:8000/api/v1/users?page=${page + 1}` : null,
    },
    meta: {
      current_page: page,
      from,
      last_page,
      per_page,
      to,
      total,
    },
  }

  return NextResponse.json(responsePayload)
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Mencoba kirim langsung ke backend Laravel
    try {
      const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/users`
      const backendRes = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        body: JSON.stringify(body),
      })

      if (backendRes.ok) {
        const json = await backendRes.json()
        return NextResponse.json(json, { status: 201 })
      }
    } catch {
      // Fallback lokal
    }

    const role: UserRole = body.role || "PPK"
    const isPpk = role === "PPK"

    const skpdObj = MOCK_SKPD.find((s) => s.kode_skpd === body.kode_skpd) || null
    const subKegiatanList = isPpk && Array.isArray(body.sub_kegiatan_ids)
      ? body.sub_kegiatan_ids.map((id: string) => {
          const found = MOCK_SUB_KEGIATAN.find((s) => s.kode_sub_kegiatan === id)
          return found || {
            kode_sub_kegiatan: id,
            kode_kegiatan: id.substring(0, id.lastIndexOf(".")),
            nama_sub_kegiatan: `Sub Kegiatan ${id}`,
          }
        })
      : []

    const newUser: User = {
      id: usersStore.length > 0 ? Math.max(...usersStore.map((u) => u.id)) + 1 : 1,
      nama: body.nama,
      username: body.username,
      role,
      kode_skpd: body.kode_skpd || null,
      nama_skpd: skpdObj?.nama_skpd || null,
      skpd: skpdObj ? {
        kode_skpd: skpdObj.kode_skpd,
        nama_skpd: skpdObj.nama_skpd,
        parent_kode_skpd: null,
      } : null,
      sub_kegiatan: subKegiatanList,
      info: {
        nip: body.info?.nip || body.nip || "",
        pangkat: body.info?.pangkat || body.pangkat || "",
        golongan: body.info?.golongan || body.golongan || "",
        jabatan: body.info?.jabatan || body.jabatan || "",
        no_hp: body.info?.no_hp || body.no_hp || "",
        email_dinas: body.info?.email_dinas || body.email_dinas || "",
      },
      created_at: new Date().toISOString(),
    }

    usersStore.unshift(newUser)

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan data pengguna" },
      { status: 400 }
    )
  }
}

export async function PUT(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: "ID pengguna diperlukan" }, { status: 400 })
    }

    // Mencoba kirim langsung ke backend Laravel
    try {
      const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/users/${id}`
      const backendRes = await fetch(backendUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        body: JSON.stringify(body),
      })

      if (backendRes.ok) {
        const json = await backendRes.json()
        return NextResponse.json(json)
      }
    } catch {
      // Fallback lokal
    }

    const index = usersStore.findIndex((u) => u.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 })
    }

    const role: UserRole = body.role || usersStore[index].role
    const isPpk = role === "PPK"

    const skpdObj = body.kode_skpd !== undefined
      ? MOCK_SKPD.find((s) => s.kode_skpd === body.kode_skpd) || null
      : usersStore[index].skpd

    let subKegiatanList = usersStore[index].sub_kegiatan || []
    if (isPpk && Array.isArray(body.sub_kegiatan_ids)) {
      subKegiatanList = body.sub_kegiatan_ids.map((subId: string) => {
        const found = MOCK_SUB_KEGIATAN.find((s) => s.kode_sub_kegiatan === subId)
        return found || {
          kode_sub_kegiatan: subId,
          kode_kegiatan: subId.substring(0, subId.lastIndexOf(".")),
          nama_sub_kegiatan: `Sub Kegiatan ${subId}`,
        }
      })
    } else if (!isPpk) {
      subKegiatanList = []
    }

    usersStore[index] = {
      ...usersStore[index],
      nama: body.nama ?? usersStore[index].nama,
      username: body.username ?? usersStore[index].username,
      role,
      kode_skpd: body.kode_skpd !== undefined ? body.kode_skpd : usersStore[index].kode_skpd,
      nama_skpd: skpdObj ? skpdObj.nama_skpd : usersStore[index].nama_skpd,
      skpd: skpdObj ? {
        kode_skpd: skpdObj.kode_skpd,
        nama_skpd: skpdObj.nama_skpd,
        parent_kode_skpd: null,
      } : null,
      sub_kegiatan: subKegiatanList,
      info: {
        ...(usersStore[index].info || {}),
        ...(body.info || {}),
      },
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: usersStore[index],
    })
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui data pengguna" },
      { status: 400 }
    )
  }
}

export async function DELETE(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get("id") || "", 10)

  if (!id) {
    return NextResponse.json({ error: "ID pengguna diperlukan" }, { status: 400 })
  }

  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/users/${id}`
    const backendRes = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
    })

    if (backendRes.ok) {
      const json = await backendRes.json()
      return NextResponse.json(json)
    }
  } catch {
    // Fallback lokal
  }

  usersStore = usersStore.filter((u) => u.id !== id)

  return NextResponse.json({
    message: "User deleted successfully",
  })
}
