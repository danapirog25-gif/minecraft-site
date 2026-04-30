import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession, setAdminCookie, verifyAdminPassword } from "@/lib/admin-auth";

const loginSchema = z.object({
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success || !verifyAdminPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setAdminCookie(response, createAdminSession());
  return response;
}
