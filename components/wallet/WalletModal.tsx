'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/hooks/useWallet';

const walletOptions = [
  {
    name: 'Leather Wallet',
    description: 'Secure wallet for Stacks blockchain',
    icon: '🦊',
  },
  {
    name: 'Hiro Wallet',
    description: 'Official Stacks wallet',
    icon: '🔷',
  },
  {
    name: 'Xverse',
    description: 'Multi-chain Bitcoin wallet',
    icon: '⚡',
  },
];

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { connectWallet, isLoading } = useWallet();

  const handleConnect = async () => {
    await connectWallet();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Memestack
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={handleConnect}
              disabled={isLoading}
            >
              <span className="text-2xl mr-3">{wallet.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{wallet.name}</div>
                <div className="text-xs text-muted-foreground">
                  {wallet.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
        <p className="text-xs text-center text-muted-foreground">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
}
