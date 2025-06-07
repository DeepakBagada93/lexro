
"use client";

import type * as React from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface ColorSwatchProps {
  color: string; // HEX color string e.g., "#RRGGBB"
  label?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, label }) => {
  const { toast } = useToast();
  const copyColorToClipboard = () => {
    navigator.clipboard.writeText(color);
    toast({ title: "Color Copied!", description: `${color} copied to clipboard.` });
  };

  return (
    <div className="flex flex-col items-center gap-2 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors shadow-sm w-full">
      {label && <p className="text-xs text-muted-foreground font-medium self-start">{label}</p>}
      <div 
        className="w-full h-20 sm:h-24 rounded-md border" 
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

export default ColorSwatch;
