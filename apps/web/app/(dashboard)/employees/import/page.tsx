"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function EmployeeImportPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function preview(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/import/employees", { method: "POST", body: formData });
      if (!response.ok) throw new Error(await response.text());
      setRows(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    const form = new FormData();
    form.set("confirm", "true");
    form.set("rows", JSON.stringify(rows));
    const response = await fetch("/api/import/employees", { method: "POST", body: form });
    if (!response.ok) setError(await response.text());
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Import Employees</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">Profacc Employee Setup spreadsheet</h2></CardHeader>
        <CardContent>
          <form action={preview} className="flex flex-col gap-3 md:flex-row">
            <Input type="file" name="file" accept=".xlsx" required />
            <Button disabled={loading}>{loading ? "Reading..." : "Preview import"}</Button>
          </form>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
      {rows.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><h2 className="font-semibold">Preview {rows.length} rows</h2><Button onClick={confirm}>Confirm import</Button></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr><th className="p-2 text-left">Row</th><th className="p-2 text-left">Code</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Errors</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.row}><td className="border-t p-2">{row.row}</td><td className="border-t p-2">{row.employeeNumber}</td><td className="border-t p-2">{row.fullName}</td><td className="border-t p-2 text-red-600">{row.errors?.join(", ")}</td></tr>)}</tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
