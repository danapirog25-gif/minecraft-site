import { NextResponse } from "next/server";
import { clearAdminCookie, clearAdminTwoFactorCookie } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAdminCookie(response);
  clearAdminTwoFactorCookie(response);
  return response;
}
