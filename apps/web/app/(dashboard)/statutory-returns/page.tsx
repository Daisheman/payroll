import { Card, CardContent } from "@/components/ui/card";

export default function StatutoryReturnsPage() {
  return <div className="grid gap-6"><h1 className="text-2xl font-bold">Statutory Returns</h1><div className="grid gap-4 md:grid-cols-4">{["PAYE returns", "NSSF schedules", "SDL", "WCF"].map((name) => <Card key={name}><CardContent><h2 className="font-semibold">{name}</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Ready for review and export.</p></CardContent></Card>)}</div></div>;
}
