"use client";

import Image from 'next/image';

interface ImagePreviewProps {
  src: string | null;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderText?: string;
}

export default function ImagePreview({
  src,
  alt = "Image preview",
  width = 300,
  height = 200,
  className = "",
  placeholderText = "Preview will appear here"
}: ImagePreviewProps) {
  if (!src) {
    return (
      <div
        className={`w-full aspect-video bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground ${className}`}
        style={{maxWidth: `${width}px`, maxHeight: `${height}px`}}
      >
        {placeholderText}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-md ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain w-full h-auto"
        style={{maxWidth: `${width}px`, maxHeight: `${height}px`}}
        data-ai-hint="abstract photo"
      />
    </div>
  );
}
