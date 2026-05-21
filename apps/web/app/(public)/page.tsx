import Link from "next/link";
import { BarChart3, Building2, FileText, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  const features: Array<[string, string, LucideIcon]> = [
    ["Multi-company", "Tenant-isolated payroll, HR, users, audit logs, and settings.", Building2],
    ["Payroll engine", "Tanzania PAYE, NSSF, SDL, WCF, bonuses, overtime, gratuity, leave deductions.", BarChart3],
    ["Reports", "Payslip PDFs, Excel summaries, statutory returns, schedules, and tax certificates.", FileText],
    ["Secure by design", "JWT rotation, secure cookies, RBAC, MFA readiness, CSP, audit trail.", ShieldCheck],
  ];
  return (
    <>
      <section className="bg-[var(--card)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">Cloud payroll platform</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">PayrollSaaS</h1>
            <p className="mt-5 max-w-2xl text-lg text-[var(--muted-foreground)]">
              A browser-accessible payroll, HR, and statutory reporting platform for multi-company operations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login"><Button>Open portal</Button></Link>
              <Link href="/pricing"><Button variant="secondary">View pricing</Button></Link>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border bg-[var(--background)] p-4">
            <div className="rounded-md bg-[var(--card)] p-4">
              <div className="text-sm text-[var(--muted-foreground)]">May payroll net pay</div>
              <div className="mt-1 text-3xl font-bold">TZS 84.6M</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["PAYE", "NSSF", "SDL", "WCF"].map((item, index) => (
                <div key={item} className="rounded-md border bg-[var(--card)] p-4">
                  <div className="text-xs text-[var(--muted-foreground)]">{item}</div>
                  <div className="mt-2 text-xl font-semibold">{[12.4, 9.8, 3.1, 0.6][index]}M</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:grid-cols-4">
        {features.map(([title, text, Icon]) => (
          <Card key={title as string}>
            <CardContent>
              <Icon className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{text}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
