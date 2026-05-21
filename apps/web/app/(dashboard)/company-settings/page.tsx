import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CompanySettingsPage() {
  return <div className="grid gap-6"><h1 className="text-2xl font-bold">Company Settings</h1><Card><CardHeader><h2 className="font-semibold">Payroll policy</h2></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><Input defaultValue="25" /><Input defaultValue="TZS" /><Button>Save settings</Button></CardContent></Card></div>;
}
