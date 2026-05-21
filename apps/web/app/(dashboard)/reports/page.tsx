import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return <div className="grid gap-6"><h1 className="text-2xl font-bold">Reports</h1><div className="grid gap-4 md:grid-cols-3">{["Payroll summary", "P9/P9A", "Employee tax certificates"].map((name) => <Card key={name}><CardContent><h2 className="font-semibold">{name}</h2><Button className="mt-4" variant="secondary">Export</Button></CardContent></Card>)}</div></div>;
}
