import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <section className="shell grid min-h-[70vh] place-items-center py-16 sm:py-20">
      <AuthForm mode="register" />
    </section>
  );
}
