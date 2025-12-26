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
import { Hero7 } from '@/components/hero7';

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
      {/* Hero Section (Rebranded) */}
      <Hero7
        heading="Launch Your Memecoin on Stacks"
        description="Fair launches, no presale, community-first. Create and participate in transparent token launches with built-in refund protection."
        button={{
          text: isConnected ? 'View Launches' : 'Connect Wallet to Start',
          url: isConnected ? '/launches' : '#',
          className: 'text-lg',
        }}
        reviews={{
          count: 150,
          rating: 5.0,
          avatars: [
            { src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp', alt: 'User 1' },
            { src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp', alt: 'User 2' },
            { src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp', alt: 'User 3' },
            { src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp', alt: 'User 4' },
            { src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp', alt: 'User 5' },
          ],
        }}
        className="border-b" style={{ background: 'var(--background)' }}
      />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="container px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Launch your token in four simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="relative h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-6xl font-bold text-muted-foreground/20">
                        {item.step}
                      </span>
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Why Choose Memestack
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Built with fairness, transparency, and community in mind
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="container max-w-3xl px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              Everything you need to know about Memestack
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm sm:text-base font-medium py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Ready to Launch Your Token?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
              Join hundreds of projects launching fair and transparent token sales on Stacks
            </p>
            <Button size="lg" onClick={handleGetStarted} className="text-base sm:text-lg w-full sm:w-auto">
              {isConnected ? 'Create Launch' : 'Connect Wallet'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
}

