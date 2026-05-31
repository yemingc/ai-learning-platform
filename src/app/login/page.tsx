import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/learn";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
