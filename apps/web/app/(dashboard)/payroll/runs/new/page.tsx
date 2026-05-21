"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function NewPayrollRunPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  async function submit(formData: FormData) {
    setError("");
    try {
      const run = await api<any>("/payroll/runs", {
        method: "POST",
        body: JSON.stringify({
          periodMonth: Number(formData.get("periodMonth")),
          periodYear: Number(formData.get("periodYear")),
          workingDays: Number(formData.get("workingDays") || 26),
          standardHoursPerDay: Number(formData.get("standardHoursPerDay") || 9),
          exchangeRate: Number(formData.get("exchangeRate") || 0) || undefined,
          paymentDate: new Date(`${formData.get("periodYear")}-${String(formData.get("periodMonth")).padStart(2, "0")}-25`).toISOString(),
        }),
      });
      router.push(`/payroll/runs/${run.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create payroll run");
    }
  }
  return (
    <Card>
      <CardHeader><h1 className="text-xl font-semibold">Create payroll run</h1></CardHeader>
      <CardContent><form action={submit} className="grid gap-4 md:grid-cols-2">
        <select name="periodMonth" className="h-10 rounded-md border bg-[var(--card)] px-3 text-sm" defaultValue={5}>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
        <Input name="periodYear" type="number" defaultValue={2026} />
        <Input name="workingDays" type="number" defaultValue={26} />
        <Input name="standardHoursPerDay" type="number" defaultValue={9} />
        <Input name="exchangeRate" type="number" step="0.000001" placeholder="USD to TZS exchange rate" defaultValue={2600} />
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <Button className="md:col-span-2">Create and calculate</Button>
      </form></CardContent>
    </Card>
  );
}
