"use client";

import { useEffect, useState } from "react";
import { calculatePayrollLine } from "@payroll/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function PayrollRunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [run, setRun] = useState<any>(null);
  const [saving, setSaving] = useState("");
  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);
  useEffect(() => { if (id) api<any>(`/payroll/runs/${id}`).then(setRun); }, [id]);
  async function patch(line: any, data: Record<string, number>) {
    setSaving(line.id);
    const updated = await api<any>(`/payroll/runs/${id}/lines/${line.id}`, { method: "PATCH", body: JSON.stringify(data) });
    setRun((current: any) => ({ ...current, items: current.items.map((item: any) => item.id === updated.id ? updated : item) }));
    setSaving("");
  }
  if (!run) return <Card><CardContent>Loading payroll run...</CardContent></Card>;
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Payroll {run.periodMonth}/{run.periodYear}</h1><p className="text-sm text-[var(--muted-foreground)]">Status: {run.status} · Exchange rate: {run.exchangeRate ?? "N/A"}</p></div>
        <div className="flex gap-2"><Button onClick={() => api(`/payroll/runs/${id}/approve`, { method: "POST" }).then(setRun)}>Approve</Button><Button variant="secondary" onClick={() => api(`/payroll/runs/${id}/lock`, { method: "POST" }).then(setRun)}>Lock</Button></div>
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Payroll lines</h2></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm"><thead><tr>{["Name","Code","Type","Hours","OT","PH","Deductions","Adjustments","Gross","PAYE","NSSF EE","Net","State"].map((h) => <th key={h} className="p-2 text-left">{h}</th>)}</tr></thead>
            <tbody>{run.items.map((line: any) => {
              const employee = line.employee;
              const preview = calculatePayrollLine({
                payType: employee.employmentType,
                currency: employee.currency,
                periodMonth: run.periodMonth,
                periodYear: run.periodYear,
                startDate: employee.startDate,
                endDate: employee.endDate,
                fixedSalaryTzs: Number(employee.baseSalary),
                usdSalary: Number(employee.usdSalary ?? 0),
                exchangeRate: Number(run.exchangeRate ?? 0),
                hourlyRateTzs: Number(employee.hourlyRate ?? 0),
                stdHoursPerMonth: Number(employee.stdHoursPerMonth ?? 234),
                actualHoursWorked: Number(line.actualHours ?? 0),
                otHours: Number(line.otHours ?? 0),
                phHours: Number(line.phHours ?? 0),
                otherDeductions: Number(line.otherDeductions ?? 0),
                adjustments: Number(line.adjustments ?? 0),
                housingAllowance: Number(employee.housingAllowance ?? 0),
                transportAllowance: Number(employee.transportAllowance ?? 0),
                siteAllowance: Number(employee.siteAllowance ?? 0),
              });
              return <tr key={line.id}><td className="border-t p-2">{employee.fullName ?? `${employee.firstName} ${employee.lastName}`}</td><td className="border-t p-2">{employee.employeeNumber}</td><td className="border-t p-2">{employee.employmentType}</td>
                {["actualHours","otHours","phHours","otherDeductions","adjustments"].map((field) => <td key={field} className="border-t p-2"><Input type="number" step="0.01" className="w-28" defaultValue={line[field]} disabled={field === "actualHours" && employee.employmentType !== "HOURLY"} onBlur={(event) => patch(line, { [field]: Number(event.currentTarget.value) })} /></td>)}
                <td className="border-t p-2">{preview.grossPay.toLocaleString()}</td><td className="border-t p-2">{preview.paye.toLocaleString()}</td><td className="border-t p-2">{preview.nssfEmployee.toLocaleString()}</td><td className="border-t p-2 font-semibold">{preview.netPay.toLocaleString()}</td><td className="border-t p-2">{saving === line.id ? "Saving..." : "Saved"}</td></tr>;
            })}</tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
