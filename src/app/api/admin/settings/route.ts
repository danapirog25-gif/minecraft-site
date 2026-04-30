import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { getStoreSettings, setStreamActive } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  streamActive: z.boolean()
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const settings = await getStoreSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некоректні налаштування" }, { status: 400 });
  }

  const settings = await setStreamActive(parsed.data.streamActive);
  return NextResponse.json({ settings });
}
