"use client";

import { useState, useEffect, useRef } from 'react';
import { Crop, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/shared/ImageUpload';
import { fileToDataUri, downloadImage } from '@/lib/imageUtils';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/layout/Header'; 

interface CropConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropperPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [cropConfig, setCropConfig] = useState<CropConfig>({ x: 0, y: 0, width: 100, height: 100 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const { toast } = useToast();
  const imgPreviewRef = useRef<HTMLImageElement>(null);


  useEffect(() => {
    if (uploadedFile) {
      fileToDataUri(uploadedFile).then(dataUrl => {
        setImageDataUrl(dataUrl);
        const img = new Image();
        img.onload = () => {
          setImageDimensions({width: img.width, height: img.height});
          setCropConfig({x: 0, y: 0, width: Math.min(300, img.width), height: Math.min(200, img.height)});
        };
        img.src = dataUrl;
      }).catch(err => {
        toast({ title: "Error reading file", description: err.message, variant: "destructive" });
        setImageDataUrl(null);
      });
      setCroppedImageUrl(null); 
    } else {
      setImageDataUrl(null);
      setCroppedImageUrl(null);
      setImageDimensions(null);
    }
  }, [uploadedFile, toast]);
  
  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
  };

  const handleCropConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCropConfig(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleCrop = () => {
    if (!imageDataUrl || !uploadedFile || !imageDimensions) {
      toast({ title: "No image uploaded", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setCroppedImageUrl(imageDataUrl); 
      toast({ title: "Image 'Cropped'", description: "Mock cropped. Preview updated." });
      setIsProcessing(false);
    }, 1000);
  };

  const handleDownload = () => {
    if (croppedImageUrl && uploadedFile) {
      const originalName = uploadedFile.name.substring(0, uploadedFile.name.lastIndexOf('.'));
      const extension = uploadedFile.name.substring(uploadedFile.name.lastIndexOf('.') + 1);
      const newFilename = `${originalName}-cropped.${extension}`;
      downloadImage(croppedImageUrl, newFilename); 
    } else {
      toast({ title: "No cropped image", description: "Please crop an image first.", variant: "destructive" });
    }
  };

  const getClipPathStyle = () => {
    if (!imageDimensions || !imgPreviewRef.current) return {};
    const xPercent = (cropConfig.x / imageDimensions.width) * 100;
    const yPercent = (cropConfig.y / imageDimensions.height) * 100;
    const widthPercent = (cropConfig.width / imageDimensions.width) * 100;
    const heightPercent = (cropConfig.height / imageDimensions.height) * 100;

    return {
      clipPath: `inset(${yPercent}% ${100 - (xPercent + widthPercent)}% ${100 - (yPercent + heightPercent)}% ${xPercent}%)`,
    };
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Crop size={28} className="text-primary" />
              Image Cropper
            </CardTitle>
            <CardDescription>Crop images to custom dimensions. Enter pixel values.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload onFileSelect={handleFileSelected} />
            
            {imageDataUrl && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-center">Preview (Mock Crop)</h3>
                 <div className="relative w-full max-w-sm mx-auto aspect-video bg-muted/20 overflow-hidden rounded">
                    <img 
                        ref={imgPreviewRef}
                        src={imageDataUrl} 
                        alt="Original for cropping" 
                        className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                    {(isProcessing || croppedImageUrl) && ( 
                         <img 
                            src={imageDataUrl} 
                            alt="Cropped preview" 
                            className="absolute top-0 left-0 w-full h-full object-contain"
                            style={getClipPathStyle()}
                        />
                    )}
                    {!isProcessing && !croppedImageUrl && imgPreviewRef.current && (
                         <img 
                            src={imageDataUrl} 
                            alt="Cropped preview" 
                            className="absolute top-0 left-0 w-full h-full object-contain"
                            style={getClipPathStyle()}
                        />
                    )}
                </div>
                {imageDimensions && <p className="text-xs text-muted-foreground text-center">Original: {imageDimensions.width}x{imageDimensions.height}px</p>}
              </div>
            )}

            {uploadedFile && imageDimensions && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cropX">X (px)</Label>
                  <Input id="cropX" name="x" type="number" value={cropConfig.x} onChange={handleCropConfigChange} max={imageDimensions.width - cropConfig.width} />
                </div>
                <div>
                  <Label htmlFor="cropY">Y (px)</Label>
                  <Input id="cropY" name="y" type="number" value={cropConfig.y} onChange={handleCropConfigChange} max={imageDimensions.height - cropConfig.height} />
                </div>
                <div>
                  <Label htmlFor="cropWidth">Width (px)</Label>
                  <Input id="cropWidth" name="width" type="number" value={cropConfig.width} onChange={handleCropConfigChange} max={imageDimensions.width - cropConfig.x} />
                </div>
                <div>
                  <Label htmlFor="cropHeight">Height (px)</Label>
                  <Input id="cropHeight" name="height" type="number" value={cropConfig.height} onChange={handleCropConfigChange} max={imageDimensions.height - cropConfig.y} />
                </div>
              </div>
            )}
            {croppedImageUrl && !isProcessing && (
               <p className="text-sm text-muted-foreground text-center">"Cropped" preview updated. Download will provide the specified section (mocked).</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button onClick={handleCrop} disabled={!uploadedFile || isProcessing}>
              <Crop size={18} className="mr-2" />
              {isProcessing ? "Cropping..." : "Apply Crop"}
            </Button>
            <Button onClick={handleDownload} disabled={!croppedImageUrl} variant="secondary">
              <Download size={18} className="mr-2" />
              Download
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
