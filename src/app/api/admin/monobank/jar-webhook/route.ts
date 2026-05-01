import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { getMonoJarSendId, isMonoJarMode } from "@/lib/monobank";
import { registerMonoPersonalWebhook } from "@/lib/monobank-jar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  if (!isMonoJarMode()) {
    return NextResponse.json({ error: "MONOBANK_JAR_MODE має бути true" }, { status: 400 });
  }

  if (!getMonoJarSendId()) {
    return NextResponse.json({ error: "MONOBANK_JAR_SEND_ID не налаштовано" }, { status: 400 });
  }

  try {
    await registerMonoPersonalWebhook();
    return NextResponse.json({
      ok: true,
      message: "Webhook банки monobank підв'язано"
    });
  } catch (error) {
    console.error("register monobank jar webhook failed", error);
    return NextResponse.json(
      {
        error:
          "Не вдалося підв'язати webhook monobank. Перевір APP_URL, MONOBANK_PERSONAL_TOKEN і доступність сайту по HTTPS."
      },
      { status: 502 }
    );
  }
}
