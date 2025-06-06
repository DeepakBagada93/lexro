import { Combine, Eraser, Crop, Replace, Palette, Layers, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const imageTools = [
  { name: "Background Remover", href: "/tools/background-remover", icon: Eraser, description: "Remove backgrounds from images quickly." },
  { name: "Image Cropper", href: "/tools/image-cropper", icon: Crop, description: "Crop images to desired dimensions." },
  { name: "JPG to PNG Converter", href: "/tools/jpg-to-png", icon: Replace, description: "Convert JPG images to PNG format." },
  { name: "PNG to JPG Converter", href: "/tools/png-to-jpg", icon: Replace, description: "Convert PNG images to JPG format." },
  { name: "WEBP to PNG Converter", href: "/tools/webp-to-png", icon: Replace, description: "Convert WEBP images to PNG format." },
  { name: "PNG to WEBP Converter", href: "/tools/png-to-webp", icon: Replace, description: "Convert PNG images to WEBP format." },
  { name: "JPG to WEBP Converter", href: "/tools/jpg-to-webp", icon: Replace, description: "Convert JPG images to WEBP format." },
  { name: "WEBP to JPG Converter", href: "/tools/webp-to-jpg", icon: Replace, description: "Convert WEBP images to JPG format." },
  { name: "Color Palette Generator", href: "/tools/color-palette-generator", icon: Palette, description: "Create color palettes from images." },
  { name: "Gradient Generator", href: "/tools/gradient-generator", icon: Layers, description: "Design and customize gradients." },
];

export default function Header() {
  return (
    <header className="py-6 bg-card border-b border-border shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold text-primary hover:text-primary/90 transition-colors">
          <Combine size={28} />
          <span>Toolbox AI</span>
        </Link>
        <nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Image Tools <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>Image Utilities</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {imageTools.map((tool) => (
                <DropdownMenuItem key={tool.name} asChild>
                  <Link href={tool.href} className="flex items-center gap-2 cursor-pointer">
                    <tool.icon size={16} className="text-muted-foreground" />
                    <span>{tool.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
