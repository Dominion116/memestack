'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/hooks/useWallet';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isConnected, connectWallet } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet to continue',
        action: {
          label: 'Connect',
          onClick: connectWallet,
        },
      });
      router.push('/');
    }
  }, [isConnected, router, connectWallet]);

  if (!isConnected) {
    return null;
  }

  return <>{children}</>;
}
