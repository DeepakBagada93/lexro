
"use client";

import { useState, useEffect } from 'react';
import { Palette, Copy, Image as ImageIcon, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/shared/ImageUpload';
import ImagePreview from '@/components/shared/ImagePreview';
import ColorSwatch from '@/components/shared/ColorSwatch';
import { fileToDataUri } from '@/lib/imageUtils';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, isValidHex } from '@/lib/colorUtils';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const generatePaletteFromColor = (baseHex: string): string[] => {
  const baseRgb = hexToRgb(baseHex);
  if (!baseRgb) return [baseHex];

  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const palette: string[] = [baseHex];

  // Tints (lighter versions)
  const tint1Hsl = { ...baseHsl, l: Math.min(100, baseHsl.l + 15) };
  const tint1Rgb = hslToRgb(tint1Hsl.h, tint1Hsl.s, tint1Hsl.l);
  palette.push(rgbToHex(tint1Rgb.r, tint1Rgb.g, tint1Rgb.b));
  
  const tint2Hsl = { ...baseHsl, l: Math.min(100, baseHsl.l + 30) };
  const tint2Rgb = hslToRgb(tint2Hsl.h, tint2Hsl.s, tint2Hsl.l);
  palette.push(rgbToHex(tint2Rgb.r, tint2Rgb.g, tint2Rgb.b));

  // Shades (darker versions)
  const shade1Hsl = { ...baseHsl, l: Math.max(0, baseHsl.l - 15) };
  const shade1Rgb = hslToRgb(shade1Hsl.h, shade1Hsl.s, shade1Hsl.l);
  palette.push(rgbToHex(shade1Rgb.r, shade1Rgb.g, shade1Rgb.b));

  const shade2Hsl = { ...baseHsl, l: Math.max(0, baseHsl.l - 30) };
  const shade2Rgb = hslToRgb(shade2Hsl.h, shade2Hsl.s, shade2Hsl.l);
  palette.push(rgbToHex(shade2Rgb.r, shade2Rgb.g, shade2Rgb.b));
  
  // Complementary color
  const complementaryHsl = { ...baseHsl, h: (baseHsl.h + 180) % 360 };
  const compRgb = hslToRgb(complementaryHsl.h, complementaryHsl.s, complementaryHsl.l);
  palette.push(rgbToHex(compRgb.r, compRgb.g, compRgb.b));
  
  return [...new Set(palette)].slice(0, 6); // Remove duplicates and limit to 6
};


export default function ColorPaletteGeneratorPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  
  const [paletteFromImage, setPaletteFromImage] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const [manualHexColor, setManualHexColor] = useState<string>("#6954DE"); // Default primary
  const [paletteFromManual, setPaletteFromManual] = useState<string[]>([]);
  const [isProcessingManual, setIsProcessingManual] = useState(false);
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"image" | "manual">("image");


  useEffect(() => {
    if (uploadedFile) {
      fileToDataUri(uploadedFile).then(setImageDataUrl).catch(err => {
        toast({ title: "Error reading file", description: err.message, variant: "destructive" });
        setImageDataUrl(null);
      });
      setPaletteFromImage([]);
    } else {
      setImageDataUrl(null);
      setPaletteFromImage([]);
    }
  }, [uploadedFile, toast]);

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
    setActiveTab("image");
  };

  const handleGeneratePaletteFromImage = () => {
    if (!imageDataUrl) {
      toast({ title: "No image uploaded", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setIsProcessingImage(true);
    setPaletteFromImage([]);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 100; 
      const scaleRatio = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scaleRatio;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        toast({ title: "Error", description: "Could not get canvas context.", variant: "destructive" });
        setIsProcessingImage(false);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const colorCounts: { [key: string]: number } = {};
        const step = 4 * Math.max(1, Math.floor(data.length / (1000 * 4))); // Sample ~1000 pixels

        for (let i = 0; i < data.length; i += step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const hex = rgbToHex(r,g,b);
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }
        
        const sortedColors = Object.entries(colorCounts)
          .sort(([, countA], [, countB]) => countB - countA)
          .map(([color]) => color);

        setPaletteFromImage(sortedColors.slice(0, 6)); 
        toast({ title: "Palette Generated", description: "Extracted colors from the image." });
      } catch (e) {
         console.error("Error processing image data:", e);
         toast({ title: "Processing Error", description: "Could not extract colors.", variant: "destructive" });
      }
      setIsProcessingImage(false);
    };
    img.onerror = () => {
      toast({ title: "Image Load Error", description: "Could not load image.", variant: "destructive" });
      setIsProcessingImage(false);
    };
    img.crossOrigin = "anonymous"; 
    img.src = imageDataUrl;
  };

  const handleManualColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value.toUpperCase();
    setManualHexColor(newColor);
    if (isValidHex(newColor)) {
         setPaletteFromManual([]); 
    }
  };
  
  const handleGeneratePaletteFromManualColor = () => {
    if (!isValidHex(manualHexColor)) {
      toast({ title: "Invalid HEX Color", description: "Please enter a valid 6-digit HEX color code (e.g., #RRGGBB).", variant: "destructive" });
      return;
    }
    setIsProcessingManual(true);
    setPaletteFromManual([]);
    setTimeout(() => { 
      const newPalette = generatePaletteFromColor(manualHexColor);
      setPaletteFromManual(newPalette);
      toast({ title: "Palette Generated", description: "Created palette from your selected color." });
      setIsProcessingManual(false);
    }, 500);
  };
  
  const currentPalette = activeTab === 'image' ? paletteFromImage : paletteFromManual;
  const isLoading = activeTab === 'image' ? isProcessingImage : isProcessingManual;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Palette size={28} className="text-primary" />
              Color Palette Generator
            </CardTitle>
            <CardDescription>Extract palettes from images or generate them from a base color.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "image" | "manual")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" />Extract from Image</TabsTrigger>
                <TabsTrigger value="manual"><Edit3 className="mr-2 h-4 w-4" />Generate from Color</TabsTrigger>
              </TabsList>
              <TabsContent value="image" className="mt-6 space-y-6">
                <ImageUpload onFileSelect={handleFileSelected} />
                {imageDataUrl && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-center">Uploaded Image</h3>
                    <ImagePreview src={imageDataUrl} alt="Uploaded image for palette generation" className="mx-auto max-h-64" />
                  </div>
                )}
                <Button 
                  onClick={handleGeneratePaletteFromImage} 
                  disabled={!imageDataUrl || isProcessingImage}
                  className="w-full"
                >
                  <Palette size={18} className="mr-2" />
                  {isProcessingImage ? "Extracting Colors..." : "Extract Palette from Image"}
                </Button>
              </TabsContent>
              <TabsContent value="manual" className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="manualColorHex" className="font-medium">Enter Base HEX Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="manualColorPicker"
                      type="color"
                      value={manualHexColor}
                      onChange={handleManualColorChange}
                      className="p-1 h-10 w-12 shrink-0"
                      aria-label="Color Picker"
                    />
                    <Input
                      id="manualColorHex"
                      type="text"
                      value={manualHexColor}
                      onChange={handleManualColorChange}
                      placeholder="#RRGGBB"
                      maxLength={7}
                      className="font-mono"
                    />
                  </div>
                   {!isValidHex(manualHexColor) && manualHexColor.length > 0 && (
                    <p className="text-xs text-destructive">Enter a valid HEX color (e.g., #FF0000)</p>
                  )}
                </div>
                <Button 
                  onClick={handleGeneratePaletteFromManualColor} 
                  disabled={isProcessingManual || !isValidHex(manualHexColor)}
                  className="w-full"
                >
                  <Palette size={18} className="mr-2" />
                  {isProcessingManual ? "Generating..." : "Generate Palette from Color"}
                </Button>
              </TabsContent>
            </Tabs>
            
            {isLoading && (
              <div className="flex items-center justify-center text-muted-foreground py-8">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
              </div>
            )}

            {currentPalette.length > 0 && !isLoading && (
              <div className="space-y-4 pt-6">
                <h3 className="text-xl font-headline font-semibold text-center">Generated Palette</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
                  {currentPalette.map((color, index) => (
                    <ColorSwatch key={`${activeTab}-${index}-${color}`} color={color} />
                  ))}
                </div>
              </div>
            )}
            {currentPalette.length === 0 && !isLoading && activeTab === "image" && imageDataUrl && (
                 <p className="text-center text-muted-foreground py-4">Click "Extract Palette from Image" to see colors.</p>
            )}
             {currentPalette.length === 0 && !isLoading && activeTab === "manual" && isValidHex(manualHexColor) && (
                 <p className="text-center text-muted-foreground py-4">Click "Generate Palette from Color" to see variations.</p>
            )}
          </CardContent>
          <CardFooter className="pt-4">
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
