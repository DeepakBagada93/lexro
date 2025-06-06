"use client";

import type React from 'react';
import { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string[]; // e.g., ["image/png", "image/jpeg"]
}

export default function ImageUpload({ onFileSelect, acceptedFileTypes = ["image/png", "image/jpeg", "image/webp"] }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const { toast } = useToast();

  const handleFileValidation = (file: File): boolean => {
    if (!acceptedFileTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: `Please upload an image of type: ${acceptedFileTypes.join(', ')}.`,
        variant: "destructive",
      });
      return false;
    }
    // Add size validation if needed
    return true;
  };

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (handleFileValidation(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, acceptedFileTypes, toast]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const files = event.dataTransfer.files;
    handleFileChange(files);
  }, [handleFileChange]);

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event.target.files);
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
        dragging ? "border-primary bg-primary/10" : "border-border hover:border-accent"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept={acceptedFileTypes.join(',')}
        onChange={onFileInputChange}
      />
      <UploadCloud size={48} className={cn("mb-4", dragging ? "text-primary" : "text-muted-foreground")} />
      <p className="font-semibold">Drag & drop an image here</p>
      <p className="text-sm text-muted-foreground">or click to select a file</p>
      <p className="text-xs text-muted-foreground mt-2">Supported: {acceptedFileTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}</p>
    </div>
  );
}
