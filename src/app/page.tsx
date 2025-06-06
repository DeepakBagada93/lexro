import Header from '@/components/layout/Header';
import ImageConverter from '@/components/tools/ImageConverter';
import ImageCompressor from '@/components/tools/ImageCompressor';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold tracking-tight">
            Toolbox <span className="text-primary">AI</span>
          </h1>
          <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
            Your one-stop solution for intelligent image optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12"> {/* Updated to lg:grid-cols-2 */}
          <ImageConverter />
          <ImageCompressor />
          {/* ImageCropper removed as it has its own page now */}
        </div>
        
        <Separator className="my-12 sm:my-16" />

        <section className="text-center">
            <h2 className="text-3xl font-headline font-bold mb-4">How It Works</h2>
            <p className="max-w-xl mx-auto text-muted-foreground">
                Simply upload your image, choose your desired operation, and let our tools (and AI!) do the rest. Preview your changes and download the optimized image.
            </p>
        </section>

      </main>
      <footer className="text-center py-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Toolbox AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
