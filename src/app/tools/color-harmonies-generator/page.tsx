
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Shapes, Palette } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ColorSwatch from '@/components/shared/ColorSwatch';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, isValidHex } from '@/lib/colorUtils';
import { useToast } from "@/hooks/use-toast";

interface HarmonySet {
  complementary: string;
  analogous: string[];
  triadic: string[];
  splitComplementary: string[];
}

export default function ColorHarmoniesGeneratorPage() {
  const [baseColor, setBaseColor] = useState<string>("#6954DE"); // Default to primary
  const [harmonies, setHarmonies] = useState<HarmonySet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const calculateHarmonies = useCallback((hex: string): HarmonySet | null => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const getHarmonizedHex = (hueAdjust: number, satAdjust?: number, lightAdjust?: number): string => {
      const newH = (hsl.h + hueAdjust + 360) % 360;
      const newS = satAdjust !== undefined ? Math.max(0, Math.min(100, hsl.s + satAdjust)) : hsl.s;
      const newL = lightAdjust !== undefined ? Math.max(0, Math.min(100, hsl.l + lightAdjust)) : hsl.l;
      const harmonizedRgb = hslToRgb(newH, newS, newL);
      return rgbToHex(harmonizedRgb.r, harmonizedRgb.g, harmonizedRgb.b);
    };

    // Complementary
    const complementary = getHarmonizedHex(180);

    // Analogous (e.g., +/- 30 degrees)
    const analogous = [
      getHarmonizedHex(-30),
      // baseColor itself could be here if desired
      getHarmonizedHex(30),
    ];

    // Triadic (e.g., +/- 120 degrees)
    const triadic = [
      getHarmonizedHex(120),
      getHarmonizedHex(240), // or -120
    ];
    
    // Split Complementary (complementary +/- 30 degrees)
    const compHueBase = (hsl.h + 180) % 360;
    const splitComplementary = [
      getHarmonizedHex(compHueBase - hsl.h - 30), // hue is relative to original baseColor
      getHarmonizedHex(compHueBase - hsl.h + 30),
    ];


    return { complementary, analogous, triadic, splitComplementary };
  }, []);

  useEffect(() => {
    if (isValidHex(baseColor)) {
      const newHarmonies = calculateHarmonies(baseColor);
      setHarmonies(newHarmonies);
    } else {
      setHarmonies(null);
    }
  }, [baseColor, calculateHarmonies]);

  const handleBaseColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value.toUpperCase();
    setBaseColor(newColor);
  };
  
   const handleGenerateClick = () => {
    if (!isValidHex(baseColor)) {
      toast({ title: "Invalid HEX Color", description: "Please enter a valid 6-digit HEX color (e.g., #RRGGBB).", variant: "destructive" });
      setHarmonies(null);
      return;
    }
    setIsLoading(true);
    // Recalculate (even though useEffect does it, this handles button click explicitly and can show loading)
    setTimeout(() => { // Simulate processing time if needed
        const newHarmonies = calculateHarmonies(baseColor);
        setHarmonies(newHarmonies);
        if (newHarmonies) {
            toast({ title: "Harmonies Generated", description: "Color harmonies updated for the new base color." });
        }
        setIsLoading(false);
    }, 300);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Shapes size={28} className="text-primary" />
              Color Harmonies Generator
            </CardTitle>
            <CardDescription>Pick a base color to generate its harmonies: complementary, analogous, triadic, and split-complementary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="baseColorHex" className="font-medium">Enter Base HEX Color</Label>
              <div className="flex items-center gap-2">
                 <Input
                  id="baseColorPicker"
                  type="color"
                  value={isValidHex(baseColor) ? baseColor : "#000000"}
                  onChange={handleBaseColorChange}
                  className="p-1 h-10 w-12 shrink-0"
                  aria-label="Base Color Picker"
                />
                <Input
                  id="baseColorHex"
                  type="text"
                  value={baseColor}
                  onChange={handleBaseColorChange}
                  placeholder="#RRGGBB"
                  maxLength={7}
                  className="font-mono flex-grow"
                />
              </div>
              {!isValidHex(baseColor) && baseColor.length > 0 && (
                <p className="text-xs text-destructive">Enter a valid HEX color (e.g., #FF0000)</p>
              )}
            </div>
             <Button 
                onClick={handleGenerateClick} 
                disabled={isLoading || !isValidHex(baseColor)}
                className="w-full"
              >
                <Palette size={18} className="mr-2" />
                {isLoading ? "Generating..." : "Generate/Update Harmonies"}
            </Button>

            {isLoading && (
                 <div className="flex items-center justify-center text-muted-foreground py-8">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                </div>
            )}

            {harmonies && !isLoading && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary/90">Base Color</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     <ColorSwatch color={baseColor} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary/90">Complementary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ColorSwatch color={harmonies.complementary} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary/90">Analogous Colors</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {harmonies.analogous.map((color, index) => (
                      <ColorSwatch key={`analogous-${index}`} color={color} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary/90">Triadic Colors</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {harmonies.triadic.map((color, index) => (
                      <ColorSwatch key={`triadic-${index}`} color={color} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary/90">Split-Complementary Colors</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {harmonies.splitComplementary.map((color, index) => (
                      <ColorSwatch key={`split-${index}`} color={color} />
                    ))}
                  </div>
                </div>
              </div>
            )}
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
