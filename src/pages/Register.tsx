import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegister, useGuestLogin } from '@/hooks/use-auth';

export function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');

  const registerMutation = useRegister();
  const guestMutation = useGuestLogin();

  const isLoading = registerMutation.isPending || guestMutation.isPending;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: () => setShowSuccess(true),
      }
    );
  };

  const passwordStrength = (password: string): { strength: number; label: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    return { strength, label: labels[strength - 1] || 'Too short' };
  };

  const { strength, label } = passwordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl border shadow-xl p-8 space-y-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold">Registration submitted!</h1>
            <p className="text-muted-foreground">
              Your account has been created with the email <span className="font-medium text-foreground">{formData.email}</span>.
            </p>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm text-left space-y-1">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Manual verification required</p>
                  <p className="text-amber-700 text-xs mt-1">
                    Email verification is currently unavailable as the system is running on free-tier services. Your account will need to be manually verified by an administrator. Please allow some time for this process.
                  </p>
                </div>
              </div>
            </div>
            <Button asChild className="w-full h-12">
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e03000] to-[#0082f3] mb-4 shadow-lg shadow-primary/20">
            <span className="text-3xl font-bold text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-1">Join CivicConnect and engage with your community</p>
        </div>

        {/* Admin Verification Notice */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl text-sm mb-4 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-xs">
            <span className="font-medium">Note:</span> Email verification is currently unavailable due to free-tier service limitations. After registering, your account will be manually verified by an administrator.
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-card rounded-2xl border shadow-xl p-6 sm:p-8">
          {registerMutation.isError && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm mb-6">
              {(registerMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed'}
            </div>
          )}

          {oauthError === 'oauth_failed' && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm mb-6">
              Social sign up failed. Please try again or use email/password.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1 h-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 rounded-full transition-colors',
                          i < strength ? strengthColors[strength - 1] : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    'text-xs',
                    strength === 4 ? 'text-green-500' : 'text-muted-foreground'
                  )}>
                    Password strength: {label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={
                isLoading ||
                formData.password !== formData.confirmPassword ||
                strength < 2
              }
            >
              {registerMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Create account</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
            </div>
          </div> */}

          {/* Social Login */}
          {/* <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              className="flex items-center justify-center gap-2 h-11 rounded-lg border hover:bg-muted transition-colors"
              onClick={() => window.location.href = `${API_URL}/auth/google`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button 
              type="button"
              className="flex items-center justify-center gap-2 h-11 rounded-lg border hover:bg-muted transition-colors"
              onClick={() => window.location.href = `${API_URL}/auth/facebook`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div> */}

          {/* Guest Login */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full h-11 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
            onClick={() => guestMutation.mutate()}
          >
            {guestMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              'Continue as Guest'
            )}
          </Button>
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
