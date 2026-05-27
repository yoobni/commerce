import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-[20px]">RAVI Admin</CardTitle>
          <CardDescription>관리자 로그인</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-4 text-[12px] text-muted-foreground">
        문제가 있으면 SUPER_ADMIN에게 문의하세요.
      </p>
    </main>
  );
}
