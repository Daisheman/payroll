"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";

type Employee = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  employmentType: string;
  baseSalary: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState("");
  async function load() {
    try {
      setEmployees(await api<Employee[]>("/employees"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load employees");
    }
  }
  useEffect(() => { void load(); }, []);
  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div><h1 className="text-2xl font-bold">Employees</h1><p className="text-sm text-[var(--muted-foreground)]">Tenant-scoped employee master data.</p></div>
        <div className="flex gap-2">
          <Link href="/employees/import"><Button variant="secondary">Import</Button></Link>
          <Link href="/employees/new"><Button>Add employee</Button></Link>
        </div>
      </div>
      <Card>
        <CardHeader><Input placeholder="Search employees" /></CardHeader>
        <CardContent className="overflow-x-auto">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error.includes("401") ? "Your API session is missing or expired. Sign in again, then reopen Employees." : error}
            </div>
          )}
          <Table>
            <thead><tr><Th>No</Th><Th>Name</Th><Th>Email</Th><Th>Type</Th><Th>Base salary</Th></tr></thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <Td>{employee.employeeNumber}</Td>
                  <Td><Link className="text-[var(--primary)]" href={`/employees/${employee.id}`}>{employee.firstName} {employee.lastName}</Link></Td>
                  <Td>{employee.email ?? "-"}</Td>
                  <Td>{employee.employmentType}</Td>
                  <Td>{Number(employee.baseSalary).toLocaleString()}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
