"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function PayrollRunsListPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api<any[]>("/payroll/runs").then(setRuns).catch((err) => setError(err.message)); }, []);
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Payroll Runs</h1><Link href="/payroll/runs/new"><Button>Create run</Button></Link></div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Card><CardContent className="overflow-x-auto">
        <table className="w-full text-sm"><thead><tr><th className="p-3 text-left">Period</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Headcount</th><th className="p-3 text-left">Gross</th><th className="p-3 text-left">Net</th></tr></thead>
          <tbody>{runs.map((run) => <tr key={run.id}><td className="border-t p-3"><Link className="text-[var(--primary)]" href={`/payroll/runs/${run.id}`}>{run.periodMonth}/{run.periodYear}</Link></td><td className="border-t p-3">{run.status}</td><td className="border-t p-3">{run.items?.length ?? 0}</td><td className="border-t p-3">{Number(run.totals?.grossPay ?? 0).toLocaleString()}</td><td className="border-t p-3">{Number(run.totals?.netPay ?? 0).toLocaleString()}</td></tr>)}</tbody>
        </table>
        {runs.length === 0 && <p className="p-4 text-sm text-[var(--muted-foreground)]">No payroll runs yet.</p>}
      </CardContent></Card>
    </div>
  );
}
