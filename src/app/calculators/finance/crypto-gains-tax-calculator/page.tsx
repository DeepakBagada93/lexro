import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react'; // Using ShieldAlert as a proxy for crypto/tax specific icon

export default function CryptoGainsTaxCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <ShieldAlert size={28} className="text-primary" />
              Crypto Gains Tax Calculator
            </CardTitle>
            <CardDescription>Calculate potential taxes on your cryptocurrency gains. This tool is currently under development.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Check back soon for this feature!</p>
          </CardContent>
        </Card>
      </main>
      <footer className="text-center py-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Lexro AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
