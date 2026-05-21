import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader><h2 className="text-2xl font-semibold">Reset password</h2></CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <Input name="companySlug" placeholder="company-slug" />
          <Input name="email" type="email" placeholder="you@company.com" />
          <Button type="button">Send secure reset link</Button>
        </form>
      </CardContent>
    </Card>
  );
}
