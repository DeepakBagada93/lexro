
import Header from '@/components/layout/Header';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Zap, Lightbulb, BarChart, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <section className="text-center mb-16 sm:mb-24">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold tracking-tight">
            Welcome to Lexro <span className="text-primary">AI</span>
          </h1>
          <p className="mt-4 sm:mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground">
            Your ultimate suite of AI-powered tools designed to streamline your workflows, enhance productivity, and unlock new possibilities. From image editing to complex calculations, Lexro AI has you covered.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-6 py-3 sm:px-8 sm:py-4">
              <Link href="/tools/image-cropper">Explore Image Tools</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-6 py-3 sm:px-8 sm:py-4">
              <Link href="/calculators/finance/loan-emi-calculator">Discover Calculators</Link>
            </Button>
          </div>
        </section>
        
        <Separator className="my-12 sm:my-16" />

        <section className="mb-16 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-center mb-10 sm:mb-12">How Lexro AI Empowers You</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-lg">
              <Zap size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Boost Productivity</h3>
              <p className="text-muted-foreground">
                Automate tedious tasks and get results faster with our intelligent tools, saving you valuable time and effort.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-lg">
              <Lightbulb size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Unlock Creativity</h3>
              <p className="text-muted-foreground">
                Generate ideas, create stunning visuals, and refine your content with AI assistance that inspires.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-lg">
              <Settings size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Simplify Complexity</h3>
              <p className="text-muted-foreground">
                Tackle complex calculations and document generation with easy-to-use interfaces and powerful AI backends.
              </p>
            </div>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section className="mb-16 sm:mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-6">Packed with Powerful Features</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle size={24} className="text-primary mr-3 mt-1 shrink-0" />
                  <span className="text-muted-foreground">Wide range of tools for images, finance, content, business, and more.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={24} className="text-primary mr-3 mt-1 shrink-0" />
                  <span className="text-muted-foreground">Intuitive user interfaces for seamless operation.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={24} className="text-primary mr-3 mt-1 shrink-0" />
                  <span className="text-muted-foreground">AI-powered suggestions and optimizations to enhance your output.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={24} className="text-primary mr-3 mt-1 shrink-0" />
                  <span className="text-muted-foreground">Secure and reliable performance for all your tasks.</span>
                </li>
                 <li className="flex items-start">
                  <CheckCircle size={24} className="text-primary mr-3 mt-1 shrink-0" />
                  <span className="text-muted-foreground">Constantly evolving with new tools and features based on user needs.</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image src="https://placehold.co/600x400.png" alt="Lexro AI features" width={600} height={400} className="w-full h-auto object-cover" data-ai-hint="abstract tech" />
            </div>
          </div>
        </section>
        
        <Separator className="my-12 sm:my-16" />
        
        <section className="mb-16 sm:mb-24">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="rounded-lg overflow-hidden shadow-xl md:order-last">
              <Image src="https://placehold.co/600x450.png" alt="Why choose Lexro AI" width={600} height={450} className="w-full h-auto object-cover" data-ai-hint="modern office" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-6">Why Choose Lexro AI?</h2>
              <p className="text-muted-foreground mb-4 text-lg">
                In a world demanding efficiency and innovation, Lexro AI stands out by offering a comprehensive, user-friendly platform. We consolidate a multitude of AI-driven functionalities into one accessible space, eliminating the need to juggle multiple applications.
              </p>
              <p className="text-muted-foreground text-lg">
                Our commitment is to provide tools that are not only powerful but also intuitive, enabling professionals and creatives alike to achieve more with less effort.
              </p>
            </div>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section className="text-center">
            <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-6">Ready to Get Started?</h2>
            <p className="max-w-xl mx-auto text-muted-foreground mb-8 text-lg">
                Dive into the world of AI-powered efficiency. Explore our tools today and transform the way you work.
            </p>
            <Button asChild size="lg" className="text-xl px-10 py-7">
              <Link href="/tools/image-cropper">View All Tools</Link>
            </Button>
        </section>

      </main>
      <footer className="text-center py-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Lexro AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
