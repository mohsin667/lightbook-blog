import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PenLine, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAppDispatch } from '../app/hooks';
import { showToast } from '../features/toast/toastSlice';
import { registerUser } from '../features/auth/checkAuthSlice';

export function SignUpPage() {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      dispatch(showToast('Fill in all fields'));
      return;
    }
    if (password.length < 6) {
      dispatch(showToast('Password must be at least 6 characters'));
      return;
    }
    if (password !== confirmPassword) {
      dispatch(showToast("Passwords don't match"));
      return;
    }
    const result = await dispatch(registerUser({
      username: name,
      email,
      password,
      display_name: name,
    }));
    if (registerUser.rejected.match(result)) {
      dispatch(showToast((result.payload as string) ?? 'Could not create account'));
      return;
    }
    dispatch(showToast(`Welcome to lightbook, ${name}`, Plus));
  };

  return (
    <div className="max-w-[400px] mx-auto px-6 pt-16">
      <div className="text-center mb-7">
        <div className="flex items-center justify-center gap-2 text-xl font-display font-bold">
          <PenLine size={22} strokeWidth={1.75} className="text-coral" />
          lightbook<span className="text-coral">.blog</span>
        </div>
        <p className="text-ink-soft mt-2">Create an account to start writing.</p>
      </div>

      <Card className="flex flex-col gap-4.5">
        <Input
          id="signup-name"
          name="name"
          autoComplete="off"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <Input
          id="signup-email"
          name="email"
          autoComplete="off"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          id="signup-password"
          name="new-password"
          autoComplete="off"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
        <Input
          id="signup-confirm-password"
          name="confirm-password"
          autoComplete="new-password"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
          placeholder="Type it again"
        />
        <Button variant="primary" className="justify-center" onClick={handleSignUp}>
          <Plus size={16} strokeWidth={1.75} />
          Create account
        </Button>
      </Card>

      <p className="text-center text-ink-soft mt-4.5 text-sm">
        Already have an account?{' '}
        <Link to="/signin" className="text-coral font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
