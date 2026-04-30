import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <section className="shell grid min-h-[70vh] place-items-center py-16 sm:py-20">
      <AuthForm mode="login" />
    </section>
  );
}
