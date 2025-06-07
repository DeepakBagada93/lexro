
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Pipette, Copy } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";

interface ColorDisplayProps {
  label: string;
  value: string;
  onCopy: (value: string) => void;
}

const ColorDisplay: React.FC<ColorDisplayProps> = ({ label, value, onCopy }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-sm sm:text-base">{value}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onCopy(value)} aria-label={`Copy ${label}`}>
        <Copy size={18} />
      </Button>
    </div>
  );
};

// Color conversion utilities (could be moved to a lib/colorUtils.ts)
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

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s: number, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};


export default function ColorPickerPage() {
  const [selectedColor, setSelectedColor] = useState<string>("#6954DE"); // Default to primary
  const [rgbValue, setRgbValue] = useState<string>("");
  const [hslValue, setHslValue] = useState<string>("");
  const { toast } = useToast();

  const isValidHex = (hex: string): boolean => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

  const updateColorValues = useCallback((hex: string) => {
    if (isValidHex(hex)) {
      const rgb = hexToRgb(hex);
      if (rgb) {
        setRgbValue(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        setHslValue(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
      } else {
        setRgbValue("Invalid HEX");
        setHslValue("Invalid HEX");
      }
    } else {
        setRgbValue("");
        setHslValue("");
    }
  }, []);

  useEffect(() => {
    updateColorValues(selectedColor);
  }, [selectedColor, updateColorValues]);

  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value.toUpperCase();
    setSelectedColor(newColor);
  };
  
  const handleHexInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newHex = event.target.value.toUpperCase();
    if (!newHex.startsWith("#")) {
      newHex = "#" + newHex;
    }
    setSelectedColor(newHex);
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied to Clipboard!", description: `${text} copied.` });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive"});
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Pipette size={28} className="text-primary" />
              Color Picker
            </CardTitle>
            <CardDescription>Select a color to see its HEX, RGB, and HSL values. Copy them easily.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="color-picker-input" className="sr-only">Choose Color</Label>
              <Input
                id="color-picker-input"
                type="color"
                value={selectedColor.length === 7 ? selectedColor : "#000000"} // Ensure valid hex for color input
                onChange={handleColorInputChange}
                className="w-32 h-32 p-1 cursor-pointer"
                aria-label="Color Picker Input"
              />
               <div 
                className="w-full h-32 rounded-lg border-2 border-border shadow-inner"
                style={{ backgroundColor: isValidHex(selectedColor) ? selectedColor : 'transparent' }}
                aria-label="Selected color preview"
              ></div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hex-input">HEX Value</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="hex-input"
                  type="text"
                  value={selectedColor}
                  onChange={handleHexInputChange}
                  placeholder="#RRGGBB"
                  className="font-mono flex-grow"
                  maxLength={7}
                />
                 <Button variant="outline" size="icon" onClick={() => copyToClipboard(selectedColor)} disabled={!isValidHex(selectedColor)} aria-label="Copy HEX value">
                    <Copy size={18} />
                  </Button>
              </div>
              {!isValidHex(selectedColor) && selectedColor.length > 0 && (
                <p className="text-xs text-destructive">Invalid HEX format (e.g., #FF0000)</p>
              )}
            </div>

            <div className="space-y-3">
              <ColorDisplay label="RGB Value" value={rgbValue} onCopy={copyToClipboard} />
              <ColorDisplay label="HSL Value" value={hslValue} onCopy={copyToClipboard} />
            </div>
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
