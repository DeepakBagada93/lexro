
"use client";

import { useState, useEffect } from 'react';
import { Palette, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/shared/ImageUpload';
import ImagePreview from '@/components/shared/ImagePreview';
import { fileToDataUri } from '@/lib/imageUtils';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/layout/Header';

interface ColorSwatchProps {
  color: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color }) => {
  const { toast } = useToast();
  const copyColor = () => {
    navigator.clipboard.writeText(color);
    toast({ title: "Color Copied!", description: `${color} copied to clipboard.` });
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-card hover:bg-muted transition-colors">
      <div className="w-8 h-8 rounded" style={{ backgroundColor: color }}></div>
      <span className="font-mono text-sm">{color}</span>
      <Button variant="ghost" size="icon" onClick={copyColor} className="ml-auto">
        <Copy size={16} />
      </Button>
    </div>
  );
};

export default function ColorPaletteGeneratorPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (uploadedFile) {
      fileToDataUri(uploadedFile).then(setImageDataUrl).catch(err => {
        toast({ title: "Error reading file", description: err.message, variant: "destructive" });
        setImageDataUrl(null);
      });
      setPalette([]);
    } else {
      setImageDataUrl(null);
      setPalette([]);
    }
  }, [uploadedFile, toast]);

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
  };

  const handleGeneratePalette = () => {
    if (!imageDataUrl) {
      toast({ title: "No image uploaded", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setPalette([]);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 200; // Resize image for faster processing
      const scaleRatio = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scaleRatio;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        toast({ title: "Error", description: "Could not get canvas context.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const colorCounts: { [key: string]: number } = {};
        const step = 4 * 5; // Process every 5th pixel roughly

        for (let i = 0; i < data.length; i += step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Alpha is data[i+3], ignore for opaque colors for simplicity here
          const rgb = `rgb(${r},${g},${b})`;
          colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
        }
        
        const sortedColors = Object.entries(colorCounts)
          .sort(([, countA], [, countB]) => countB - countA)
          .map(([color]) => color);

        setPalette(sortedColors.slice(0, 8)); // Take top 8 dominant colors
        toast({ title: "Palette Generated", description: "Extracted colors from the image." });
      } catch (e) {
         console.error("Error processing image data:", e);
         toast({ title: "Processing Error", description: "Could not extract colors. Image might be too complex or from a restricted source.", variant: "destructive" });
      }
      setIsProcessing(false);
    };
    img.onerror = () => {
      toast({ title: "Image Load Error", description: "Could not load image.", variant: "destructive" });
      setIsProcessing(false);
    };
    img.crossOrigin = "anonymous"; // Required for getImageData if image is from another origin
    img.src = imageDataUrl;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Palette size={28} className="text-primary" />
              Color Palette Generator
            </CardTitle>
            <CardDescription>Upload an image to extract a color palette. This is a basic implementation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload onFileSelect={handleFileSelected} />
            
            {imageDataUrl && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-center">Uploaded Image</h3>
                <ImagePreview src={imageDataUrl} alt="Uploaded image for palette generation" />
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center justify-center text-muted-foreground">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Palette...
              </div>
            )}

            {palette.length > 0 && !isProcessing && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-center">Generated Palette</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {palette.map((color, index) => (
                    <ColorSwatch key={index} color={color} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end pt-4">
            <Button 
              onClick={handleGeneratePalette} 
              disabled={!imageDataUrl || isProcessing}
            >
              <Palette size={18} className="mr-2" />
              {isProcessing ? "Generating..." : "Generate Palette"}
            </Button>
          </CardFooter>
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
