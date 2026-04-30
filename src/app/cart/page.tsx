import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCurrentUser } from "@/lib/user-auth";
import { CartClient } from "./CartClient";

export const metadata: Metadata = {
  title: "Кошик | Zombie Event Shop",
  description: "Оформлення кількох наборів і ресурсів одним замовленням за талери."
};

export default async function CartPage() {
  const user = await getCurrentUser();

  return (
    <section className="shell py-16 sm:py-20">
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.38fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">Кошик</p>
          <h1 className="voxel-title mt-3 text-4xl font-black uppercase text-white">Одне замовлення для всього луту</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-fog/70">
            Збирайте кілька наборів і ресурсів, перевіряйте суму та купуйте все за талери одним підтвердженням.
          </p>
        </div>
        <Link
          href="/shop"
          className="panel inline-flex items-center justify-center gap-3 rounded-sm border-moss/30 px-5 py-4 font-black text-acid shadow-glow transition hover:-translate-y-1 hover:text-white"
        >
          <ShoppingCart size={20} />
          Додати ще товари
        </Link>
      </div>

      <CartClient
        initialUser={
          user
            ? {
                email: user.email,
                minecraftNickname: user.minecraftNickname,
                contact: user.contact,
                balance: user.balance
              }
            : null
        }
      />
    </section>
  );
}
