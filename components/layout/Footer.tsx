import Link from 'next/link';
import { Github, Twitter, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/memestack',
    icon: Twitter,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/memestack',
    icon: Github,
  },
  {
    name: 'Docs',
    href: '/docs',
    icon: FileText,
  },
];

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Launches', href: '/launches' },
      { label: 'Create', href: '/create' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Support', href: '/support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold">Memestack</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Fair launch platform for memecoins on Stacks blockchain.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Memestack. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built on{' '}
            <Link
              href="https://stacks.co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors"
            >
              Stacks
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
