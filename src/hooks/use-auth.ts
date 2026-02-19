import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router';

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate('/');
    },
  });
}

export function useRegister() {
  const { register } = useAuth();

  return useMutation({
    mutationFn: register,
  });
}

export function useGuestLogin() {
  const { guestLogin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: guestLogin,
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate('/');
    },
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
  });
}
