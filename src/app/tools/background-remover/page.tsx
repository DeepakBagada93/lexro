
"use client";

import { useState, useEffect } from 'react';
import { Eraser, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/shared/ImageUpload';
import ImagePreview from '@/components/shared/ImagePreview';
import { fileToDataUri, downloadImage } from '@/lib/imageUtils';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/layout/Header';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BackgroundRemoverPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (uploadedFile) {
      fileToDataUri(uploadedFile).then(setImageDataUrl).catch(err => {
        toast({ title: "Error reading file", description: err.message, variant: "destructive" });
        setImageDataUrl(null);
      });
      setProcessedImageUrl(null);
    } else {
      setImageDataUrl(null);
      setProcessedImageUrl(null);
    }
  }, [uploadedFile, toast]);

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
  };

  const handleRemoveBackground = () => {
    if (!imageDataUrl || !uploadedFile) {
      toast({ title: "No image uploaded", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    // Mock background removal
    setTimeout(() => {
      setProcessedImageUrl(imageDataUrl); // For mock, just show the original
      toast({ title: "Background 'Removed' (Mock)", description: "This is a mock-up. True background removal requires advanced AI." });
      setIsProcessing(false);
    }, 1500);
  };

  const handleDownload = () => {
    if (processedImageUrl && uploadedFile) {
      const originalName = uploadedFile.name.substring(0, uploadedFile.name.lastIndexOf('.'));
      const extension = uploadedFile.name.substring(uploadedFile.name.lastIndexOf('.') + 1);
      const newFilename = `${originalName}-no-bg-mock.${extension}`;
      downloadImage(processedImageUrl, newFilename);
    } else {
      toast({ title: "No processed image", description: "Please 'remove background' from an image first.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Eraser size={28} className="text-primary" />
              Background Remover
            </CardTitle>
            <CardDescription>Upload an image to (mock) remove its background. This is a placeholder for a future AI-powered feature.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload onFileSelect={handleFileSelected} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {imageDataUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-center">Original Image</h3>
                  <ImagePreview src={imageDataUrl} alt="Original image" />
                </div>
              )}
              {processedImageUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-center">"Processed" Image</h3>
                  <ImagePreview src={processedImageUrl} alt="Image with background removed (mock)" />
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
            {processedImageUrl && !isProcessing && (
              <Alert variant="default" className="mt-4">
                <Eraser className="h-4 w-4" />
                <AlertTitle>Mock Feature</AlertTitle>
                <AlertDescription>
                  Actual AI-powered background removal is a complex feature and is not implemented in this demonstration. The preview shows the original image.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button 
              onClick={handleRemoveBackground} 
              disabled={!imageDataUrl || isProcessing}
              className="w-full sm:w-auto"
            >
              <Eraser size={18} className="mr-2" />
              {isProcessing ? "Processing..." : "Remove Background (Mock)"}
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={!processedImageUrl || isProcessing} 
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <Download size={18} className="mr-2" />
              Download (Mock)
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
