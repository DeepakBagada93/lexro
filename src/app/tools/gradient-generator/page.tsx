
"use client";

import { useState, useEffect } from 'react';
import { Layers, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/layout/Header';

type GradientType = "linear" | "radial";
type LinearDirection = "to right" | "to bottom" | "to top left" | "to bottom right" | "45deg" | "90deg" | "135deg" | "180deg";

export default function GradientGeneratorPage() {
  const [color1, setColor1] = useState("#6954DE"); // Default to primary color
  const [color2, setColor2] = useState("#C354DE"); // Default to accent color
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [linearDirection, setLinearDirection] = useState<LinearDirection>("to right");
  const [gradientCss, setGradientCss] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    let css = "";
    if (gradientType === "linear") {
      css = `linear-gradient(${linearDirection}, ${color1}, ${color2})`;
    } else { // radial
      css = `radial-gradient(circle, ${color1}, ${color2})`;
    }
    setGradientCss(css);
  }, [color1, color2, gradientType, linearDirection]);

  const copyCss = () => {
    navigator.clipboard.writeText(`background: ${gradientCss};`);
    toast({ title: "CSS Copied!", description: "Gradient CSS copied to clipboard." });
  };

  const linearDirections: LinearDirection[] = ["to right", "to bottom", "to top left", "to bottom right", "45deg", "90deg", "135deg", "180deg"];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Layers size={28} className="text-primary" />
              Gradient Generator
            </CardTitle>
            <CardDescription>Design and customize CSS gradients. Copy the generated CSS code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color1">Color 1</Label>
                <Input id="color1" type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color2">Color 2</Label>
                <Input id="color2" type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradientType">Gradient Type</Label>
              <Select value={gradientType} onValueChange={(value) => setGradientType(value as GradientType)}>
                <SelectTrigger id="gradientType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {gradientType === "linear" && (
              <div className="space-y-2">
                <Label htmlFor="linearDirection">Direction (Linear)</Label>
                <Select value={linearDirection} onValueChange={(value) => setLinearDirection(value as LinearDirection)}>
                  <SelectTrigger id="linearDirection">
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    {linearDirections.map(dir => (
                      <SelectItem key={dir} value={dir}>{dir}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-center">Preview</h3>
              <div 
                className="w-full h-48 rounded-lg border border-border shadow-inner"
                style={{ background: gradientCss }}
                aria-label="Gradient preview"
              ></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cssOutput">Generated CSS</Label>
              <div className="relative">
                <Input 
                  id="cssOutput" 
                  type="text" 
                  value={`background: ${gradientCss};`} 
                  readOnly 
                  className="pr-10 font-mono text-sm"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyCss} 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  aria-label="Copy CSS"
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end pt-4">
             {/* No primary action button needed as changes are live */}
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
