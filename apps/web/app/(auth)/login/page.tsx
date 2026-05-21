"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          companySlug: formData.get("companySlug"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Login</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Use your company slug and work account.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} method="post" className="grid gap-4">
          <Input name="companySlug" placeholder="company-slug" required defaultValue="demo" />
          <Input name="email" type="email" placeholder="admin@company.co.tz" required defaultValue="admin@demo.co.tz" />
          <Input name="password" type="password" placeholder="Password" required defaultValue="ChangeMe123!" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button>Sign in</Button>
          <a className="text-sm text-[var(--primary)]" href="/forgot-password">Forgot password?</a>
        </form>
      </CardContent>
    </Card>
  );
}
