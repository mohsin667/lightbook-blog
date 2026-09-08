import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, PenLine } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { InlineCode } from '../components/post/InlineCode';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { showToast } from '../features/toast/toastSlice';
import { loginUser } from '../features/auth/checkAuthSlice';


export function SignInPage() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      dispatch(showToast('Enter your email and password'));
      return;
    }
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(result)) {
      dispatch(showToast((result.payload as string) ?? 'Incorrect email or password'));
      return;
    }
    dispatch(showToast('Welcome back', Check));
  };

  return (
    <form onSubmit={handleSignIn}>
      <div className="max-w-[400px] mx-auto px-6 pt-16">
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-2 text-xl font-display font-bold">
            <PenLine size={22} strokeWidth={1.75} className="text-coral" />
            lightbook<span className="text-coral">.blog</span>
          </div>
          <p className="text-ink-soft mt-2">Welcome back. Sign in to continue.</p>
        </div>

        <Card className="flex flex-col gap-4.5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignIn(e)}
            placeholder="••••••••"
          />
          <Button type="submit" disabled={status === 'loading'} variant="primary" className="justify-center">
            <Check size={16} strokeWidth={1.75} />
            Sign in
          </Button>
        </Card>

        <p className="text-center text-ink-soft mt-4.5 text-sm">
          New here?{' '}
          <Link to="/signup" className="text-coral font-semibold">
            Create an account
          </Link>
        </p>
        <p className="text-center text-ink-soft mt-2.5 text-xs">
          Demo login: <InlineCode>you@lightbook.blog</InlineCode> / <InlineCode>demo1234</InlineCode>
        </p>
      </div>
    </form>
  );
}
