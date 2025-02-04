import { supabase } from '../lib/supabase';

/**
 * Upload an image file to Supabase Storage
 * @param file The image file to upload
 * @param path The storage path (e.g. 'agents/photos')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param path The full storage path of the image
 */
export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('images')
    .remove([path]);

  if (error) {
    throw error;
  }
}