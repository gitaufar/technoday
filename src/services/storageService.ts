// Storage utility untuk handling upload PDF ke Supabase Storage
// File: src/services/storageService.ts

import supabase from '../utils/supabase';

export interface UploadResult {
  success: boolean;
  file_url?: string;
  error?: string;
  file_path?: string;
}

/**
 * Upload PDF file ke Supabase Storage bucket 'pdf_storage'
 * @param file - File object dari form input
 * @param folder - Folder path di storage (default: 'contracts')
 * @returns Promise dengan hasil upload
 */
export const uploadPDF = async (
  file: File,
  folder: string = 'contracts'
): Promise<UploadResult> => {
  try {
    // Validasi file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (file.type !== 'application/pdf') {
      return { success: false, error: 'Only PDF files are allowed' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${folder}/${timestamp}-${randomString}-${file.name}`;

    // Upload file ke storage
    const { error } = await supabase.storage
      .from('pdf_storage')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Generate public URL
    const { data: urlData } = supabase.storage
      .from('pdf_storage')
      .getPublicUrl(fileName);

    return {
      success: true,
      file_url: urlData.publicUrl,
      file_path: fileName
    };

  } catch (error) {
    console.error('Upload exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Delete file dari Supabase Storage
 * @param filePath - Path file di storage (dari database)
 * @returns Promise dengan hasil delete
 */
export const deletePDF = async (filePath: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Extract path dari full URL jika diperlukan
    const path = filePath.includes('/storage/v1/object/public/pdf_storage/') 
      ? filePath.split('/storage/v1/object/public/pdf_storage/')[1]
      : filePath;

    const { error } = await supabase.storage
      .from('pdf_storage')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Delete exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get signed URL untuk private file access (jika bucket private)
 * @param filePath - Path file di storage
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise dengan signed URL
 */
export const getSignedURL = async (
  filePath: string, 
  expiresIn: number = 3600
): Promise<{ success: boolean; signedUrl?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from('pdf_storage')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, signedUrl: data.signedUrl };

  } catch (error) {
    console.error('Signed URL exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * List files dalam folder tertentu
 * @param folder - Folder name (default: 'contracts')
 * @returns Promise dengan list files
 */
export const listFiles = async (folder: string = 'contracts') => {
  try {
    const { data, error } = await supabase.storage
      .from('pdf_storage')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('List files error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, files: data };

  } catch (error) {
    console.error('List files exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Download file dari storage
 * @param filePath - Path file di storage
 * @returns Promise dengan file blob
 */
export const downloadFile = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('pdf_storage')
      .download(filePath);

    if (error) {
      console.error('Download error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, blob: data };

  } catch (error) {
    console.error('Download exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export default {
  uploadPDF,
  deletePDF,
  getSignedURL,
  listFiles,
  downloadFile
};