import { loginAction } from "@/actions/login";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <form action={loginAction} className="font-sans text-sm">
      <div className="flex flex-col gap-3 items-start max-w-xs">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-1.5 w-full">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" name="email" autoComplete="username email" required />
        </div>
        <div className="flex flex-col gap-1.5 w-full">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit">Login</Button>
      </div>
    </form>
  );
}
