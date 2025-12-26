'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WalletButton } from '@/components/wallet/WalletButton';
import { IS_MAINNET } from '@/lib/stacks/constants';
import { cn } from '@/lib/utils';

const navLinks = [
	{ href: '/launches', label: 'Launches' },
	{ href: '/create', label: 'Create' },
	{ href: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
	const pathname = usePathname();
	return (
		<nav className="fixed top-6 inset-x-4 h-16 bg-background border max-w-(--breakpoint-xl) mx-auto rounded-full z-50">
			<div className="h-full flex items-center justify-between mx-auto px-4">
				{/* Logo */}
				<Link href="/" className="flex items-center group">
					<span className="text-2xl font-extrabold tracking-tight text-foreground font-sans" style={{ letterSpacing: '-0.02em' }}>
						memestack
					</span>
				</Link>

				{/* Desktop Menu */}
				<div className="hidden md:flex md:items-center md:space-x-6">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								'text-sm font-medium transition-colors hover:text-primary',
								pathname === link.href ? 'text-foreground' : 'text-muted-foreground'
							)}
						>
							{link.label}
						</Link>
					))}
				</div>

				{/* Right Side: Network Badge + Wallet Button */}
				<div className="flex items-center gap-3">
					<Badge variant={IS_MAINNET ? "default" : "secondary"} className="hidden sm:inline-flex text-xs">
						{IS_MAINNET ? "Mainnet" : "Testnet"}
					</Badge>
					<div className="hidden md:block">
						<WalletButton />
					</div>
				</div>
			</div>
		</nav>
	);
}

export default Navbar;
