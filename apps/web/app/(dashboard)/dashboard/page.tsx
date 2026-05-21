import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { currency } from "@/lib/utils";

export default function DashboardPage() {
  const metrics = [
    ["Gross payroll", currency.format(128600000), "+6.4%"],
    ["Net payroll", currency.format(84600000), "+4.1%"],
    ["PAYE due", currency.format(12400000), "May"],
    ["Active employees", "248", "12 companies"],
  ];
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Payroll health, statutory exposure, and employee service activity.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(([label, value, note]) => (
          <Card key={label}>
            <CardContent>
              <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
              <div className="mt-2 text-2xl font-bold">{value}</div>
              <div className="mt-1 text-xs text-[var(--primary)]">{note}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Processing pipeline</h2></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {["Inputs locked", "Calculated", "Reviewed", "Approved", "Paid"].map((step, index) => (
              <div key={step} className="rounded-md border p-4">
                <div className="text-sm font-medium">{step}</div>
                <div className="mt-3 h-2 rounded bg-[var(--muted)]">
                  <div className="h-2 rounded bg-[var(--primary)]" style={{ width: `${Math.min(100, (index + 1) * 20)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
