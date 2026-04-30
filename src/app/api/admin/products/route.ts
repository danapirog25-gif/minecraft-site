import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const MAX_PRODUCT_PRICE_TALERS = 9999;

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().min(5),
  priceTalers: z.string().min(1),
  category: z.string().min(1),
  team: z.string().min(1),
  contents: z.string().optional(),
  benefits: z.string().optional(),
  itemsCommands: z.string().min(1),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional()
});

function normalizeProduct(input: z.infer<typeof productSchema>) {
  const price = Math.round(Number(input.priceTalers.replace(",", ".")));
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Некоректна ціна");
  }
  if (price > MAX_PRODUCT_PRICE_TALERS) {
    throw new Error("Максимальна ціна товару — 9999 талерів");
  }

  const commands = input.itemsCommands
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const contents = input.contents
    ?.split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
  const benefits = input.benefits
    ?.split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);

  return {
    name: input.name.trim(),
    slug: (input.slug?.trim() || slugify(input.name)) || randomUUID(),
    description: input.description.trim(),
    price,
    category: input.category,
    team: input.team,
    contents: contents?.length ? JSON.stringify(contents) : null,
    benefits: benefits?.length ? JSON.stringify(benefits) : null,
    itemsCommands: JSON.stringify(commands),
    imageUrl: input.imageUrl?.trim() || null,
    isActive: input.isActive ?? true
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некоректні дані товару" }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({
      data: normalizeProduct(parsed.data)
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("admin create product failed", error);
    return NextResponse.json({ error: "Не вдалося створити товар" }, { status: 400 });
  }
}
