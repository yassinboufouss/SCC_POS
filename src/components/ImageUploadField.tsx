import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ value, onChange, label }) => {
  const [previewUrl, setPreviewUrl] = useState(value);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewUrl(url);
    onChange(url);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-20 h-20 rounded-md border flex items-center justify-center overflow-hidden shrink-0",
          !previewUrl && "bg-muted text-muted-foreground"
        )}>
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Product Preview" 
              className="w-full h-full object-cover" 
              onError={() => setPreviewUrl('')} // Fallback if URL is bad
            />
          ) : (
            <Image className="h-6 w-6" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            type="url"
            placeholder="Enter image URL (e.g., https://.../image.jpg)"
            value={value}
            onChange={handleUrlChange}
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Upload className="h-3 w-3" /> Using URL input for mock upload.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;