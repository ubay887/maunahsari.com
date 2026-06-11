import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <div id="login-main-viewport" className="w-full flex-grow flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
