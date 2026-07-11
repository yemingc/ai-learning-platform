import { LoginForm } from "@/components/auth/login-form";
import { connection } from "next/server";
import { parsePublicDemoAccountConfig } from "@/features/application/public-demo-account";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await connection();
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/learn";
  const demoAccount = parsePublicDemoAccountConfig(process.env);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <LoginForm callbackUrl={callbackUrl} demoAccount={demoAccount} />
    </div>
  );
}
