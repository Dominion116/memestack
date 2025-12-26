'use client';

import { Wallet, LogOut, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@/lib/hooks/useWallet';
import { formatAddress, formatSTX } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';

export function WalletButton() {
  const { address, balance, isConnected, connectWallet, disconnectWallet, isLoading } = useWallet();
  const router = useRouter();

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2 items-stretch">
        <Button onClick={connectWallet} disabled={isLoading} size="sm">
          <Wallet className="mr-2 h-4 w-4" />
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        <div className="text-xs text-muted-foreground text-center">
          <span>Having trouble connecting?</span>
          <br />
          <span>
            Make sure you have the latest <b>Xverse</b> or <b>Leather</b> wallet app on your phone.
            <br />
            <b>Scan the QR code</b> with your wallet's "Scan QR" feature.
            <br />
            <a
              href="https://www.xverse.app/download"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Download Xverse
            </a>{' '}
            |
            <a
              href="https://leather.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Download Leather
            </a>
          </span>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">{formatAddress(address!)}</span>
          <span className="sm:hidden">{formatAddress(address!, 3)}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">My Wallet</p>
            <p className="text-xs text-muted-foreground font-mono">{formatAddress(address!, 6)}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground">Balance</span>
          <span className="text-sm font-semibold">{formatSTX(Number(balance))} STX</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
