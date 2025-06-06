"use client";

import { useState, useEffect } from 'react';
import { ArrowRightLeft, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/shared/ImageUpload';
import ImagePreview from '@/components/shared/ImagePreview';
import { fileToDataUri, downloadImage } from '@/lib/imageUtils';
import { suggestOptimalImageSettings, type SuggestOptimalImageSettingsOutput } from '@/ai/flows/suggest-optimizations';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const availableFormats = ["JPG", "PNG", "WEBP"];

export default function ImageConverter() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>(availableFormats[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<SuggestOptimalImageSettingsOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (uploadedFile) {
      fileToDataUri(uploadedFile).then(setImageDataUrl).catch(err => {
        toast({ title: "Error reading file", description: err.message, variant: "destructive" });
        setImageDataUrl(null);
      });
      setConvertedImageUrl(null); // Reset previous conversion
      setAiSuggestion(null); // Reset AI suggestion
    } else {
      setImageDataUrl(null);
      setConvertedImageUrl(null);
      setAiSuggestion(null);
    }
  }, [uploadedFile, toast]);

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
  };

  const handleConvert = () => {
    if (!imageDataUrl || !uploadedFile) {
      toast({ title: "No image uploaded", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    // Mock conversion: In a real app, this would involve server-side processing or a library.
    // For now, we'll just use the original image data URL for preview.
    setTimeout(() => {
      setConvertedImageUrl(imageDataUrl); 
      toast({ title: "Image 'Converted'", description: `Mock converted to ${targetFormat}.` });
      setIsProcessing(false);
    }, 1000);
  };
  
  const handleDownload = () => {
    if (convertedImageUrl && uploadedFile) {
      const originalName = uploadedFile.name.substring(0, uploadedFile.name.lastIndexOf('.'));
      const newFilename = `${originalName}.${targetFormat.toLowerCase()}`;
      downloadImage(convertedImageUrl, newFilename);
    } else {
      toast({ title: "No converted image", description: "Please convert an image first.", variant: "destructive" });
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
        targetUse: "web display" 
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
    if (aiSuggestion?.suggestedFormat) {
      const formatExists = availableFormats.includes(aiSuggestion.suggestedFormat.toUpperCase());
      if (formatExists) {
        setTargetFormat(aiSuggestion.suggestedFormat.toUpperCase());
        toast({ title: "AI Suggestion Applied", description: `Format set to ${aiSuggestion.suggestedFormat}.`});
      } else {
         toast({ title: "Format Not Supported", description: `AI suggested format ${aiSuggestion.suggestedFormat} is not available.`, variant: "destructive"});
      }
    }
  };

  return (
    <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <ArrowRightLeft size={24} className="text-primary" />
          Image Converter
        </CardTitle>
        <CardDescription>Convert your images to different formats like JPG, PNG, or WEBP.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImageUpload onFileSelect={handleFileSelected} />
        
        {imageDataUrl && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Original Preview</h3>
            <ImagePreview src={imageDataUrl} alt="Original image preview" className="mx-auto" />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="targetFormat" className="font-semibold">Target Format</Label>
          <Select value={targetFormat} onValueChange={setTargetFormat} disabled={!uploadedFile}>
            <SelectTrigger id="targetFormat">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {availableFormats.map(format => (
                <SelectItem key={format} value={format}>{format}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        
        {convertedImageUrl && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Converted Preview</h3>
            <ImagePreview src={convertedImageUrl} alt="Converted image preview" className="mx-auto" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
        <Button onClick={handleAiOptimize} variant="outline" disabled={!uploadedFile || isAiLoading}>
          <Sparkles size={18} className="mr-2" />
          {isAiLoading ? "Analyzing..." : "AI Suggest Format"}
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleConvert} disabled={!uploadedFile || isProcessing} className="w-full sm:w-auto">
            <ArrowRightLeft size={18} className="mr-2" />
            {isProcessing ? "Converting..." : "Convert"}
          </Button>
          <Button onClick={handleDownload} disabled={!convertedImageUrl} variant="secondary" className="w-full sm:w-auto">
            <Download size={18} className="mr-2" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
