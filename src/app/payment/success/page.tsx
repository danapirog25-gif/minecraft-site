import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { formatTalers } from "@/lib/currency";
import { prisma } from "@/lib/prisma";

type PaymentSuccessPageProps = {
  searchParams?: {
    topUpId?: string;
    orderId?: string;
  };
};

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const topUp = searchParams?.topUpId
    ? await prisma.currencyTopUp.findUnique({
        where: { id: searchParams.topUpId }
      })
    : null;
  const topUpCredited = topUp?.status === "paid";

  return (
    <section className="shell grid min-h-[60vh] place-items-center py-16">
      <div className="panel pixel-corners max-w-2xl p-8 text-center shadow-glow">
        <CheckCircle2 className="mx-auto text-moss" size={56} />
        <h1 className="voxel-title mt-5 text-3xl font-black uppercase text-white">
          {topUp ? (topUpCredited ? "Талери зараховано!" : "Оплату прийнято!") : "Оплату отримано!"}
        </h1>
        <p className="mt-4 text-lg leading-8 text-fog/75">
          {topUp && topUpCredited
            ? `${formatTalers(topUp.amountTalers)} додано на баланс акаунта. Тепер можна купувати набори, ресурси й суперпредмети.`
            : topUp
              ? "Заявку на поповнення отримано. Баланс оновиться після ручної перевірки адміністратором."
            : "Платіж успішний. Перейдіть у кабінет, щоб перевірити статус."}
        </p>
        <Link
          href={topUp ? "/shop" : "/account"}
          className="menu-button mt-7 inline-flex rounded-sm bg-moss px-6 py-3 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid"
        >
          {topUp ? "Повернутися в магазин" : "Відкрити кабінет"}
        </Link>
      </div>
    </section>
  );
}
