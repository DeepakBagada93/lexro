"use client";

import { useState, useEffect } from 'react';
import { Minimize2, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import ImageUpload from '@/components/shared/ImageUpload';
import ImagePreview from '@/components/shared/ImagePreview';
import { fileToDataUri, downloadImage } from '@/lib/imageUtils';
import { suggestOptimalImageSettings, type SuggestOptimalImageSettingsOutput } from '@/ai/flows/suggest-optimizations';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ImageCompressor() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<number>(75);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedImageUrl, setCompressedImageUrl] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<SuggestOptimalImageSettingsOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (uploadedFile) {
      fileToDataUri(uploadedFile).then(setImageDataUrl).catch(err => {
        toast({ title: "Error reading file", description: err.message, variant: "destructive" });
        setImageDataUrl(null);
      });
      setCompressedImageUrl(null); // Reset previous compression
      setAiSuggestion(null); // Reset AI suggestion
    } else {
      setImageDataUrl(null);
      setCompressedImageUrl(null);
      setAiSuggestion(null);
    }
  }, [uploadedFile, toast]);

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
  };

  const handleCompress = () => {
    if (!imageDataUrl || !uploadedFile) {
      toast({ title: "No image uploaded", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    // Mock compression
    setTimeout(() => {
      setCompressedImageUrl(imageDataUrl); // Preview remains the same for mock
      toast({ title: "Image 'Compressed'", description: `Mock compressed at ${compressionLevel}%.` });
      setIsProcessing(false);
    }, 1000);
  };

  const handleDownload = () => {
    if (compressedImageUrl && uploadedFile) {
      const originalName = uploadedFile.name.substring(0, uploadedFile.name.lastIndexOf('.'));
      const extension = uploadedFile.name.substring(uploadedFile.name.lastIndexOf('.') + 1);
      const newFilename = `${originalName}-compressed.${extension}`;
      downloadImage(compressedImageUrl, newFilename);
    } else {
      toast({ title: "No compressed image", description: "Please compress an image first.", variant: "destructive" });
    }
  };
  
  const handleAiOptimize = async () => {
    if (!imageDataUrl) {
      toast({ title: "No image uploaded", description: "Please upload an image to get AI suggestions.", variant: "destructive" });
      return;
    }
    setIsAiLoading(true);
    setAiSuggestion(null);
    try {
      const suggestion = await suggestOptimalImageSettings({ 
        photoDataUri: imageDataUrl, 
        targetUse: "web delivery with small file size" 
      });
      setAiSuggestion(suggestion);
      toast({ title: "AI Suggestion Ready", description: "AI has provided optimization suggestions." });
    } catch (error) {
      console.error("AI Optimization Error:", error);
      toast({ title: "AI Error", description: "Could not get AI suggestions.", variant: "destructive" });
    }
    setIsAiLoading(false);
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion?.suggestedCompressionLevel) {
      setCompressionLevel(aiSuggestion.suggestedCompressionLevel);
      toast({ title: "AI Suggestion Applied", description: `Compression level set to ${aiSuggestion.suggestedCompressionLevel}%.`});
    }
  };

  return (
    <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Minimize2 size={24} className="text-primary" />
          Image Compressor
        </CardTitle>
        <CardDescription>Reduce image file sizes with adjustable compression levels.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImageUpload onFileSelect={handleFileSelected} />
        
        {imageDataUrl && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Preview</h3>
            <ImagePreview src={imageDataUrl} alt="Image preview for compression" className="mx-auto" />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="compressionLevel" className="font-semibold">Compression Level: {compressionLevel}%</Label>
          <Slider
            id="compressionLevel"
            min={0}
            max={100}
            step={1}
            value={[compressionLevel]}
            onValueChange={(value) => setCompressionLevel(value[0])}
            disabled={!uploadedFile}
          />
        </div>
        
        {aiSuggestion && (
           <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle className="font-headline">AI Suggestion</AlertTitle>
            <AlertDescription className="space-y-1">
              <p><strong>Format:</strong> {aiSuggestion.suggestedFormat}</p>
              <p><strong>Compression:</strong> {aiSuggestion.suggestedCompressionLevel}%</p>
              <p><strong>Reasoning:</strong> {aiSuggestion.reasoning}</p>
              <Button onClick={applyAiSuggestion} size="sm" variant="outline" className="mt-2">Apply Suggestion</Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Compressed preview might not differ visually in mock, but shown for UI structure */}
        {compressedImageUrl && (
          <div className="space-y-4 mt-4">
             <h3 className="text-lg font-medium text-center">"Compressed" Preview</h3>
            <ImagePreview src={compressedImageUrl} alt="Compressed image preview" className="mx-auto" />
            <p className="text-sm text-muted-foreground text-center">Visuals may not change in this mock. Check downloaded file size.</p>
          </div>
        )}

      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
        <Button onClick={handleAiOptimize} variant="outline" disabled={!uploadedFile || isAiLoading}>
          <Sparkles size={18} className="mr-2" />
          {isAiLoading ? "Analyzing..." : "AI Suggest Compression"}
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleCompress} disabled={!uploadedFile || isProcessing} className="w-full sm:w-auto">
            <Minimize2 size={18} className="mr-2" />
            {isProcessing ? "Compressing..." : "Compress"}
          </Button>
          <Button onClick={handleDownload} disabled={!compressedImageUrl} variant="secondary" className="w-full sm:w-auto">
            <Download size={18} className="mr-2" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
