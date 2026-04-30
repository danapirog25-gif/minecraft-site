import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <section className="shell grid min-h-[60vh] place-items-center py-16">
      <div className="panel pixel-corners max-w-2xl p-8 text-center shadow-redglow">
        <XCircle className="mx-auto text-blood" size={56} />
        <h1 className="voxel-title mt-5 text-3xl font-black uppercase text-white">Оплата не завершена</h1>
        <p className="mt-4 text-lg leading-8 text-fog/75">
          Оплата не завершена. Спробуйте ще раз або напишіть адміністратору.
        </p>
        <Link
          href="/top-up"
          className="menu-button mt-7 inline-flex rounded-sm bg-blood px-6 py-3 font-black uppercase text-white transition hover:-translate-y-1 hover:bg-red-400"
        >
          Спробувати поповнити ще раз
        </Link>
      </div>
    </section>
  );
}
