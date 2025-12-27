'use client';

import Link from 'next/link';
import { ArrowRight, Rocket, Shield, TrendingUp, Users, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState } from 'react';
import { WalletModal } from '@/components/wallet/WalletModal';
import { useWallet } from '@/lib/hooks/useWallet';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Hero from '@/components/hero';

const features = [
	{
		icon: Rocket,
		title: 'Fair Launch',
		description: 'No presale, no VCs. Everyone gets the same price at the same time.',
	},
	{
		icon: Shield,
		title: 'Soft Cap Protection',
		description: 'Automatic refunds if the launch doesn\'t meet its funding goal.',
	},
	{
		icon: TrendingUp,
		title: 'Hard Cap Limit',
		description: 'Prevents overselling and ensures fair token distribution.',
	},
	{
		icon: Zap,
		title: 'Instant Settlement',
		description: 'Immediate token claims on successful launches.',
	},
	{
		icon: Users,
		title: 'Community-Driven',
		description: 'Built for the community, governed by the community.',
	},
	{
		icon: Globe,
		title: '2% Platform Fee',
		description: 'Low fees, high transparency. Only charged on successful launches.',
	},
];

const howItWorks = [
	{
		step: '01',
		title: 'Create',
		description: 'Set your token parameters, supply, and launch duration.',
	},
	{
		step: '02',
		title: 'Launch',
		description: 'Community members buy tokens with STX during the launch period.',
	},
	{
		step: '03',
		title: 'Finalize',
		description: 'After the period ends, finalize to distribute tokens or refunds.',
	},
	{
		step: '04',
		title: 'Claim',
		description: 'Successful launches distribute tokens. Failed launches return STX.',
	},
];

const faqs = [
	{
		question: 'What is a fair launch?',
		answer: 'A fair launch means everyone has equal opportunity to participate at the same price. There are no presales, private rounds, or preferential treatment for early investors.',
	},
	{
		question: 'How does the soft cap work?',
		answer: 'The soft cap is the minimum amount of STX that must be raised for a launch to be considered successful. If the soft cap is not met by the end of the launch period, all contributors can claim a full refund.',
	},
	{
		question: 'What happens if a launch fails?',
		answer: 'If a launch doesn\'t meet its soft cap, it\'s marked as failed and all participants can request a full refund of their contributed STX. No tokens are distributed in this case.',
	},
	{
		question: 'When can I claim my tokens?',
		answer: 'You can claim your tokens after the launch period ends and the launch is finalized. If the launch is successful (meets soft cap), tokens will be available for claiming.',
	},
	{
		question: 'What are the fees?',
		answer: 'Memestack charges a 2% platform fee on successfully raised funds. This fee is only charged if the launch meets its soft cap. Failed launches incur no fees.',
	},
	{
		question: 'Can I participate in multiple launches?',
		answer: 'Yes! You can participate in as many launches as you like. Each launch has independent contribution limits that apply per user.',
	},
	{
		question: 'What are min/max purchase limits?',
		answer: 'Launch creators set minimum and maximum purchase amounts to ensure fair distribution. The minimum prevents dust contributions, while the maximum prevents whales from dominating the launch.',
	},
	{
		question: 'How long does a launch last?',
		answer: 'Launch duration is set by the creator in blocks (~10 minutes per block). Typical launches run from 1 day (144 blocks) to 7 days (1,008 blocks).',
	},
];

export default function HomePage() {
	const [walletModalOpen, setWalletModalOpen] = useState(false);
	const { isConnected } = useWallet();
	const router = useRouter();

	const handleGetStarted = () => {
		if (isConnected) {
			router.push('/launches');
		} else {
			setWalletModalOpen(true);
		}
	};


	return (
		<div className="flex flex-col">
			{/* Hero Section (Memestack) */}
			<Hero />


			{/* How It Works Section (features-10 style) */}
			<section id="how-it-works" className="min-h-screen flex items-center justify-center py-12">
				<div className="w-full">
					<h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center mb-4">
						How It Works
					</h2>
					<p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 text-center mb-10">
						Launch your token in four simple steps
					</p>
					<div className="mt-10 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-(--breakpoint-lg) mx-auto px-6">
						{howItWorks.map((item) => (
							<div
								key={item.step}
								className="flex flex-col border rounded-xl py-6 px-5 bg-background"
							>
								<div className="mb-4 h-10 w-10 flex items-center justify-center bg-muted rounded-full text-xl font-bold text-primary">
									{item.step}
								</div>
								<span className="text-lg font-semibold">{item.title}</span>
								<p className="mt-1 text-foreground/80 text-[15px]">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Grid Section (shadcnblocks features-10 style) */}
			<section className="min-h-screen flex items-center justify-center py-12 bg-muted/50">
				<div className="w-full">
					<h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center mb-4">
						Why Choose Memestack
					</h2>
					<p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 text-center mb-10">
						Built with fairness, transparency, and community in mind
					</p>
					<div className="mt-10 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-(--breakpoint-lg) mx-auto px-6">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="flex flex-col border rounded-xl py-6 px-5 bg-background"
							>
								<div className="mb-4 h-10 w-10 flex items-center justify-center bg-muted rounded-full">
									<feature.icon className="size-5 text-primary" />
								</div>
								<span className="text-lg font-semibold">{feature.title}</span>
								<p className="mt-1 text-foreground/80 text-[15px]">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ Section (shadcnblocks faq-02 style) */}
			<section id="faq" className="min-h-screen flex items-center justify-center px-6 py-12">
				<div className="flex flex-col md:flex-row items-start gap-x-12 gap-y-6 w-full max-w-6xl mx-auto">
					<h2 className="text-4xl lg:text-5xl leading-[1.15]! font-semibold tracking-[-0.035em]">
						Frequently Asked <br /> Questions
					</h2>
					<Accordion type="single" defaultValue="item-0" className="max-w-xl w-full">
						{faqs.map((faq, index) => (
							<AccordionItem key={faq.question} value={`item-${index}`}>
								<AccordionTrigger className="text-left text-lg">
									{faq.question}
								</AccordionTrigger>
								<AccordionContent className="text-base text-muted-foreground">
									{faq.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>

			{/* CTA Section - blue grid style */}
			<section className="py-16 sm:py-20 md:py-24 lg:py-32" style={{ background: 'linear-gradient(180deg, #2196f3 0%, #21cbf3 100%)', position: 'relative', overflow: 'hidden' }}>
				{/* Grid overlay */}
				<div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
				<div className="container px-4 relative z-10">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4 text-white">
							Ready to Launch Your Token?
						</h2>
						<p className="text-base sm:text-lg text-blue-100 mb-6 sm:mb-8 px-4">
							Join hundreds of projects launching fair and transparent token sales on Stacks
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" onClick={handleGetStarted} className="text-base sm:text-lg w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 font-semibold rounded-full px-8 py-2 shadow-md">
								{isConnected ? 'Create Launch' : 'Connect Wallet'}
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</div>
					</div>
				</div>
			</section>

			<WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
		</div>
	);
}

