import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PayslipsPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Payslips</h1>
      <Card><CardContent><p className="text-sm text-[var(--muted-foreground)]">Generate and download employee payslip PDFs from approved payroll runs.</p><Button className="mt-4">Download selected PDFs</Button></CardContent></Card>
    </div>
  );
}
