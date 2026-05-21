import { Card, CardContent } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";

export default function AuditLogsPage() {
  return <div className="grid gap-6"><h1 className="text-2xl font-bold">Audit Logs</h1><Card><CardContent className="overflow-x-auto"><Table><thead><tr><Th>Time</Th><Th>Actor</Th><Th>Action</Th><Th>Entity</Th></tr></thead><tbody><tr><Td>Latest</Td><Td>System</Td><Td>LOGIN</Td><Td>User</Td></tr></tbody></Table></CardContent></Card></div>;
}
