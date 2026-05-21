import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserManagementPage() {
  return <div className="grid gap-6"><h1 className="text-2xl font-bold">User Management</h1><Card><CardContent><p className="text-sm text-[var(--muted-foreground)]">Manage tenant users, roles, MFA status, and access reviews.</p><Button className="mt-4">Invite user</Button></CardContent></Card></div>;
}
