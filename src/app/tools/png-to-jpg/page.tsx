// Placeholder page for PNG to JPG Converter
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Replace } from 'lucide-react';

export default function PngToJpgConverterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Replace size={28} className="text-primary" />
              PNG to JPG Converter
            </CardTitle>
            <CardDescription>Convert PNG images to JPG format. This tool is currently under development.</CardDescription>
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
