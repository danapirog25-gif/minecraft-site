import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/catalog";

const MAX_PRODUCT_PRICE_TALERS = 9999;

type ProductRouteProps = {
  params: {
    id: string;
  };
};

const productPatchSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().min(5).optional(),
  priceTalers: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  team: z.string().min(1).optional(),
  contents: z.string().optional(),
  benefits: z.string().optional(),
  itemsCommands: z.string().min(1).optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional()
});

function normalizePatch(input: z.infer<typeof productPatchSchema>) {
  const data: Record<string, string | number | boolean | null> = {};

  if (input.name !== undefined) {
    data.name = input.name.trim();
  }

  if (input.slug !== undefined || input.name !== undefined) {
    data.slug = (input.slug?.trim() || (input.name ? slugify(input.name) : undefined)) ?? "";
  }

  if (input.description !== undefined) {
    data.description = input.description.trim();
  }

  if (input.priceTalers !== undefined) {
    const price = Math.round(Number(input.priceTalers.replace(",", ".")));
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("Некоректна ціна");
    }
    if (price > MAX_PRODUCT_PRICE_TALERS) {
      throw new Error("Максимальна ціна товару — 9999 талерів");
    }
    data.price = price;
  }

  if (input.category !== undefined) {
    data.category = input.category;
  }

  if (input.team !== undefined) {
    data.team = input.team;
  }

  if (input.contents !== undefined) {
    const contents = input.contents
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/^[-*]\s*/, ""))
      .filter(Boolean);
    data.contents = contents.length ? JSON.stringify(contents) : null;
  }

  if (input.benefits !== undefined) {
    const benefits = input.benefits
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/^[-*]\s*/, ""))
      .filter(Boolean);
    data.benefits = benefits.length ? JSON.stringify(benefits) : null;
  }

  if (input.itemsCommands !== undefined) {
    data.itemsCommands = JSON.stringify(
      input.itemsCommands
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    );
  }

  if (input.imageUrl !== undefined) {
    data.imageUrl = input.imageUrl.trim() || null;
  }

  if (input.isActive !== undefined) {
    data.isActive = input.isActive;
  }

  return data;
}

export async function PATCH(request: Request, { params }: ProductRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const parsed = productPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некоректні дані товару" }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({
      where: {
        id: params.id
      },
      data: normalizePatch(parsed.data)
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("admin update product failed", error);
    return NextResponse.json({ error: "Не вдалося оновити товар" }, { status: 400 });
  }
}
