
import Header from '@/components/layout/Header';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Zap, Lightbulb, BarChart, Settings, Brain, DollarSign, Briefcase } from 'lucide-react';

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
                Automate tedious tasks and get results faster with our intelligent tools, saving you valuable time and effort across image editing, financial calculations, and document generation.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-lg">
              <Lightbulb size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Unlock Creativity</h3>
              <p className="text-muted-foreground">
                Generate ideas, create stunning visuals with color palette and gradient tools, and refine your content with AI assistance that inspires innovation.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-lg">
              <Settings size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Simplify Complexity</h3>
              <p className="text-muted-foreground">
                Tackle complex financial calculations, legal document generation, and content analysis with easy-to-use interfaces and powerful AI backends.
              </p>
            </div>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section className="mb-16 sm:mb-24">
          <div className="grid md:grid-cols-1 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-6 text-center">Packed with Powerful Features</h2>
              <p className="text-muted-foreground mb-8 text-lg text-center max-w-3xl mx-auto">
                Lexro AI is engineered to be your all-in-one productivity powerhouse. Whether you're an entrepreneur managing business finances, a content creator needing text analysis, or a developer looking for image optimization solutions, our platform provides a diverse toolkit.
              </p>
              <ul className="space-y-4 max-w-2xl mx-auto">
                <li className="flex items-start">
                  <CheckCircle size={24} className="text-primary mr-3 mt-1 shrink-0" />
                  <span className="text-muted-foreground"><strong className="font-semibold text-foreground/90">Comprehensive Toolset:</strong> Wide range of tools for image manipulation (cropping, conversion, background removal), financial planning (EMI, compound interest, taxes), AI content analysis (token estimation, readability), business document generation (invoices, quotes), and health/lifestyle calculations.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={24} className="text-primary mr-3 mt-1 shrink-0" />
                  <span className="text-muted-foreground"><strong className="font-semibold text-foreground/90">Intuitive User Experience:</strong> User-friendly interfaces designed for seamless operation, ensuring you can leverage powerful AI without a steep learning curve.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={24} className="text-primary mr-3 mt-1 shrink-0" />
                  <span className="text-muted-foreground"><strong className="font-semibold text-foreground/90">AI-Powered Assistance:</strong> Benefit from intelligent suggestions, optimizations, and generation capabilities to enhance your output and save time.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={24} className="text-primary mr-3 mt-1 shrink-0" />
                  <span className="text-muted-foreground"><strong className="font-semibold text-foreground/90">Secure & Reliable:</strong> Built with performance and data security in mind, providing a dependable platform for all your tasks.</span>
                </li>
                 <li className="flex items-start">
                  <CheckCircle size={24} className="text-primary mr-3 mt-1 shrink-0" />
                  <span className="text-muted-foreground"><strong className="font-semibold text-foreground/90">Continuous Evolution:</strong> Our platform is constantly updated with new tools and features, driven by user feedback and advancements in AI technology.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        <Separator className="my-12 sm:my-16" />
        
        <section className="mb-16 sm:mb-24">
           <div className="grid md:grid-cols-1 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-6 text-center">Why Choose Lexro AI?</h2>
              <p className="text-muted-foreground mb-6 text-lg text-center max-w-3xl mx-auto">
                In a world demanding efficiency and innovation, Lexro AI stands out by offering a comprehensive, user-friendly platform. We consolidate a multitude of AI-driven functionalities into one accessible space, eliminating the need to juggle multiple applications. Our commitment is to provide tools that are not only powerful but also intuitive, enabling professionals and creatives alike to achieve more with less effort.
              </p>
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="p-6 bg-card rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-primary mb-2 flex items-center"><Brain size={22} className="mr-2" />Unparalleled Versatility</h3>
                    <p className="text-muted-foreground">From precise financial calculators for robust business planning and AI content tools for impactful marketing, to versatile image utilities for stunning visuals and document generators for legal and operational needs—Lexro AI covers a vast spectrum of professional requirements.</p>
                </div>
                <div className="p-6 bg-card rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-primary mb-2 flex items-center"><DollarSign size={22} className="mr-2" />User-Centric by Design</h3>
                    <p className="text-muted-foreground">We prioritize ease of use, ensuring that powerful capabilities are accessible to everyone, regardless of technical expertise. Our intuitive interfaces mean less time learning and more time achieving your goals efficiently.</p>
                </div>
                <div className="p-6 bg-card rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-primary mb-2 flex items-center"><Briefcase size={22} className="mr-2" />Continuous Innovation</h3>
                    <p className="text-muted-foreground">Lexro AI is a dynamic platform, constantly updated with new tools and features driven by user feedback and technological advancements. We ensure you always have the best, most relevant solutions at your fingertips to stay ahead.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section className="text-center">
            <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-6">Ready to Get Started?</h2>
            <p className="max-w-xl mx-auto text-muted-foreground mb-8 text-lg">
                Dive into the world of AI-powered efficiency. Explore our tools today and transform the way you work, create, and manage your tasks.
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
