import { EmployeeForm } from "@/components/forms/employee-form";

async function getEmployee(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api"}/employees/${id}`, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await getEmployee(id);
  return <EmployeeForm employee={employee} />;
}
