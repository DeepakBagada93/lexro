import { Combine } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="py-6 bg-card border-b border-border shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold text-primary hover:text-primary/90 transition-colors">
          <Combine size={28} />
          <span>Toolbox AI</span>
        </Link>
        {/* Future navigation links can go here */}
      </div>
    </header>
  );
}
