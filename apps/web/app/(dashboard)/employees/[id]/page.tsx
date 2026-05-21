import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getEmployee(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api"}/employees/${id}`, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await getEmployee(id);
  if (!employee) return <Card><CardContent>Employee not found or session expired.</CardContent></Card>;
  return (
    <div className="grid gap-6">
      <div className="flex justify-between gap-3">
        <div><h1 className="text-2xl font-bold">{employee.fullName ?? `${employee.firstName} ${employee.lastName}`}</h1><p className="text-sm text-[var(--muted-foreground)]">{employee.employeeNumber} · {employee.title}</p></div>
        <Link href={`/employees/${id}/edit`}><Button>Edit</Button></Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {["Profile", "Salary History", "Leave Balance", "YTD Summary"].map((title) => (
          <Card key={title}><CardHeader><h2 className="font-semibold">{title}</h2></CardHeader><CardContent className="text-sm text-[var(--muted-foreground)]">{title === "Salary History" ? `${employee.salaryHistory?.length ?? 0} records` : "Available"}</CardContent></Card>
        ))}
      </div>
    </div>
  );
}
