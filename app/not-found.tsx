import Link from 'next/link';
import { Rocket } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center">
        <Rocket className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold mb-2">404 - Not Found</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="inline-block px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}
