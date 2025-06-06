
"use client";

import { useState, useEffect } from 'react';
import { Replace, Download, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/shared/ImageUpload';
import ImagePreview from '@/components/shared/ImagePreview';
import { fileToDataUri, downloadImage } from '@/lib/imageUtils';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/layout/Header';

export default function JpgToPngConverterPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalImageDataUrl, setOriginalImageDataUrl] = useState<string | null>(null);
  const [convertedImageDataUrl, setConvertedImageDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (uploadedFile) {
      if (uploadedFile.type !== 'image/jpeg' && uploadedFile.type !== 'image/jpg') {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPG image.",
          variant: "destructive",
        });
        setUploadedFile(null);
        setOriginalImageDataUrl(null);
        return;
      }
      fileToDataUri(uploadedFile).then(dataUrl => {
        setOriginalImageDataUrl(dataUrl);
        setConvertedImageDataUrl(null); // Reset previous conversion
      }).catch(err => {
        toast({ title: "Error reading file", description: err.message, variant: "destructive" });
        setOriginalImageDataUrl(null);
      });
    } else {
      setOriginalImageDataUrl(null);
      setConvertedImageDataUrl(null);
    }
  }, [uploadedFile, toast]);

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
  };

  const handleConvert = () => {
    if (!originalImageDataUrl || !uploadedFile) {
      toast({ title: "No JPG image uploaded", description: "Please upload a JPG image first.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          const pngDataUrl = canvas.toDataURL('image/png');
          setConvertedImageDataUrl(pngDataUrl);
          toast({ title: "Conversion Successful", description: "Image successfully converted to PNG." });
        } catch (e) {
            console.error("Canvas toDataURL error:", e);
            toast({ title: "Conversion Error", description: "Could not convert image to PNG. The image might be tainted (e.g. from a different origin without CORS headers) or too large.", variant: "destructive" });
            setConvertedImageDataUrl(null);
        }
      } else {
        toast({ title: "Conversion Failed", description: "Could not get canvas context.", variant: "destructive" });
      }
      setIsProcessing(false);
    };
    img.onerror = () => {
      toast({ title: "Image Load Error", description: "Could not load the uploaded image for conversion.", variant: "destructive" });
      setIsProcessing(false);
    };
    img.src = originalImageDataUrl;
  };

  const handleDownload = () => {
    if (convertedImageDataUrl && uploadedFile) {
      const originalName = uploadedFile.name.substring(0, uploadedFile.name.lastIndexOf('.'));
      const newFilename = `${originalName}.png`;
      downloadImage(convertedImageDataUrl, newFilename);
    } else {
      toast({ title: "No converted image", description: "Please convert an image to PNG first.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Replace size={28} className="text-primary" />
              JPG to PNG Converter
            </CardTitle>
            <CardDescription>Convert your JPG images to PNG format. The conversion happens directly in your browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload 
              onFileSelect={handleFileSelected} 
              acceptedFileTypes={["image/jpeg", "image/jpg"]} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {originalImageDataUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-center">Original JPG</h3>
                  <ImagePreview src={originalImageDataUrl} alt="Original JPG preview" className="mx-auto" />
                </div>
              )}

              {convertedImageDataUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-center">Converted PNG</h3>
                  <ImagePreview src={convertedImageDataUrl} alt="Converted PNG preview" className="mx-auto" />
                </div>
              )}
            </div>
             {isProcessing && (
                <div className="flex items-center justify-center text-muted-foreground">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </div>
            )}

          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button 
              onClick={handleConvert} 
              disabled={!originalImageDataUrl || isProcessing}
              className="w-full sm:w-auto"
            >
              <Replace size={18} className="mr-2" />
              {isProcessing ? "Converting..." : "Convert to PNG"}
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={!convertedImageDataUrl || isProcessing} 
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <Download size={18} className="mr-2" />
              Download PNG
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

