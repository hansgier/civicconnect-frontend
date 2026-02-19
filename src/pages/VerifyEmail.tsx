import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = useState(token ? '' : 'No verification token provided.');
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!token || hasCalledRef.current) return;
    
    hasCalledRef.current = true;
    
    const verify = async () => {
      try {
        await apiClient.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (err: unknown) {
        setStatus('error');
        const errorWithResponse = err as { response?: { data?: { message?: string } } };
        setErrorMessage(errorWithResponse.response?.data?.message || 'Email verification failed. The link may be invalid or expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border shadow-xl p-8 text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold">Verifying your email</h1>
              <p className="text-muted-foreground text-sm">
                Please wait while we confirm your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h1 className="text-2xl font-bold">Email verified!</h1>
              <p className="text-muted-foreground">
                Your account is now active. You can now sign in and start engaging with your community.
              </p>
              <Button asChild className="w-full h-12">
                <Link to="/login">Go to Login</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
                <XCircle className="h-10 w-10" />
              </div>
              <h1 className="text-2xl font-bold">Verification failed</h1>
              <p className="text-destructive text-sm font-medium">
                {errorMessage}
              </p>
              <p className="text-muted-foreground text-xs">
                If you haven't received a new link, you might need to register again or contact support.
              </p>
              <div className="pt-4 flex flex-col gap-3">
                <Button asChild variant="default" className="w-full h-12">
                  <Link to="/register">Back to Register</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full h-12">
                  <Link to="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Go to Home</span>
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
