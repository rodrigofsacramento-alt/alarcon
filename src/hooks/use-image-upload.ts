import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File, propertyId?: string): Promise<string> => {
    setUploading(true);
    setProgress(0);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const folder = propertyId || 'temp';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(data.path);

      setProgress(100);
      return urlData.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (files: File[], propertyId?: string): Promise<string[]> => {
    setUploading(true);
    setProgress(0);
    const urls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i], propertyId);
        urls.push(url);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      return urls;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploadMultipleImages, uploading, progress };
}
