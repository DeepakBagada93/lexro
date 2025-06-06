
"use client";

import { useState, useEffect } from 'react';
import { Palette, Copy, Image as ImageIcon, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/shared/ImageUpload';
import ImagePreview from '@/components/shared/ImagePreview';
import { fileToDataUri } from '@/lib/imageUtils';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorSwatchProps {
  color: string; // HEX color string e.g., "#RRGGBB"
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color }) => {
  const { toast } = useToast();
  const copyColorToClipboard = () => {
    navigator.clipboard.writeText(color);
    toast({ title: "Color Copied!", description: `${color} copied to clipboard.` });
  };

  return (
    <div className="flex flex-col items-center gap-2 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors shadow-sm w-full">
      <div 
        className="w-full h-24 rounded-md border" 
        style={{ backgroundColor: color, boxShadow: `0 0 0 1px hsl(var(--border)) inset` }} 
        aria-label={`Color swatch for ${color}`}
      />
      <div className="flex items-center gap-2 w-full pt-1">
        <span className="font-mono text-sm flex-grow text-center">{color.toUpperCase()}</span>
        <Button variant="ghost" size="icon" onClick={copyColorToClipboard} className="shrink-0 h-8 w-8" aria-label={`Copy color ${color}`}>
          <Copy size={16} />
        </Button>
      </div>
    </div>
  );
};

// Color Manipulation Utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const rgbToHsl = (r: number, g: number, b: number): { h: number, s: number, l: number } => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s: number, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; 
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = (h: number, s: number, l: number): { r: number, g: number, b: number } => {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { r: 255 * f(0), g: 255 * f(8), b: 255 * f(4) };
};

const generatePaletteFromColor = (baseHex: string): string[] => {
  const baseRgb = hexToRgb(baseHex);
  if (!baseRgb) return [baseHex];

  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const palette: string[] = [baseHex];

  const tint1Hsl = { ...baseHsl, l: Math.min(100, baseHsl.l + 15) };
  const tint1Rgb = hslToRgb(tint1Hsl.h, tint1Hsl.s, tint1Hsl.l);
  palette.push(rgbToHex(tint1Rgb.r, tint1Rgb.g, tint1Rgb.b));
  
  const tint2Hsl = { ...baseHsl, l: Math.min(100, baseHsl.l + 30) };
  const tint2Rgb = hslToRgb(tint2Hsl.h, tint2Hsl.s, tint2Hsl.l);
  palette.push(rgbToHex(tint2Rgb.r, tint2Rgb.g, tint2Rgb.b));

  const shade1Hsl = { ...baseHsl, l: Math.max(0, baseHsl.l - 15) };
  const shade1Rgb = hslToRgb(shade1Hsl.h, shade1Hsl.s, shade1Hsl.l);
  palette.push(rgbToHex(shade1Rgb.r, shade1Rgb.g, shade1Rgb.b));

  const shade2Hsl = { ...baseHsl, l: Math.max(0, baseHsl.l - 30) };
  const shade2Rgb = hslToRgb(shade2Hsl.h, shade2Hsl.s, shade2Hsl.l);
  palette.push(rgbToHex(shade2Rgb.r, shade2Rgb.g, shade2Rgb.b));
  
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
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
         setPaletteFromManual([]); // Clear previous manual palette when input changes
    }
  };
  
  const handleGeneratePaletteFromManualColor = () => {
    if (!/^#[0-9A-F]{6}$/i.test(manualHexColor)) {
      toast({ title: "Invalid HEX Color", description: "Please enter a valid 6-digit HEX color code (e.g., #RRGGBB).", variant: "destructive" });
      return;
    }
    setIsProcessingManual(true);
    setPaletteFromManual([]);
    setTimeout(() => { // Simulate processing
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
                   {!/^#[0-9A-F]{6}$/i.test(manualHexColor) && manualHexColor.length > 0 && (
                    <p className="text-xs text-destructive">Enter a valid HEX color (e.g., #FF0000)</p>
                  )}
                </div>
                <Button 
                  onClick={handleGeneratePaletteFromManualColor} 
                  disabled={isProcessingManual || !/^#[0-9A-F]{6}$/i.test(manualHexColor)}
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
             {currentPalette.length === 0 && !isLoading && activeTab === "manual" && /^#[0-9A-F]{6}$/i.test(manualHexColor) && (
                 <p className="text-center text-muted-foreground py-4">Click "Generate Palette from Color" to see variations.</p>
            )}


          </CardContent>
          <CardFooter className="pt-4">
             {/* Footer can be empty or have general info if needed */}
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

