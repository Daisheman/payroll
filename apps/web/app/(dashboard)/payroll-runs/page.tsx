"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function PayrollRunsPage() {
  const [result, setResult] = useState<string>("");
  async function calculate() {
    const run = await api<{ id: string; totals: Record<string, number> }>("/payroll-runs", {
      method: "POST",
      body: JSON.stringify({ periodMonth: new Date().getMonth() + 1, periodYear: new Date().getFullYear(), paymentDate: new Date().toISOString() }),
    });
    setResult(`Run ${run.id} calculated. Net pay: ${Number(run.totals.netPay).toLocaleString()}`);
  }
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Payroll Runs</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">Create monthly payroll</h2></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Input defaultValue={new Date().getMonth() + 1} />
          <Input defaultValue={new Date().getFullYear()} />
          <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          <Button onClick={calculate}>Calculate payroll</Button>
          {result && <p className="md:col-span-4 text-sm text-[var(--primary)]">{result}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
