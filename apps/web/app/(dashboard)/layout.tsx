import Link from "next/link";
import { BarChart3, Building2, ClipboardList, FileSpreadsheet, FileText, History, Home, Settings, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  ["/dashboard", "Dashboard", Home],
  ["/employees", "Employees", Users],
  ["/payroll/runs", "Payroll Runs", ClipboardList],
  ["/payslips", "Payslips", FileText],
  ["/leave-management", "Leave", ClipboardList],
  ["/reports", "Reports", BarChart3],
  ["/statutory-returns", "Statutory", FileSpreadsheet],
  ["/company-settings", "Settings", Settings],
  ["/audit-logs", "Audit Logs", History],
  ["/user-management", "Users", Users],
  ["/self-service", "Self-Service", Building2],
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-r bg-[var(--card)]">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <Link href="/dashboard" className="font-bold">PayrollSaaS</Link>
          <ThemeToggle />
        </div>
        <nav className="grid gap-1 p-3">
          {nav.map(([href, label, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[var(--muted)]">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <section>
        <header className="flex items-center justify-between border-b bg-[var(--card)] px-4 py-4">
          <div>
            <div className="text-sm text-[var(--muted-foreground)]">Demo Payroll Ltd</div>
            <div className="font-semibold">Enterprise payroll workspace</div>
          </div>
          <div className="rounded-md border px-3 py-2 text-sm">TZS payroll</div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </section>
    </main>
  );
}
