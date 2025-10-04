// Component untuk upload PDF contract
// File: src/components/PDFUpload.tsx

import React, { useState } from 'react';
import { uploadPDF } from '../services/storageService';
import type { UploadResult } from '../services/storageService';

interface PDFUploadProps {
  onUploadSuccess: (fileUrl: string, filePath: string) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
}

export const PDFUpload: React.FC<PDFUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  disabled = false,
  acceptedFileTypes = ".pdf",
  maxFileSize = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file
    if (file.size > maxFileSize * 1024 * 1024) {
      onUploadError(`File terlalu besar. Maksimal ${maxFileSize}MB`);
      return;
    }

    // Validasi tipe file
    if (file.type !== 'application/pdf') {
      onUploadError('Hanya file PDF yang diperbolehkan');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onUploadError('Pilih file PDF terlebih dahulu');
      return;
    }

    setUploading(true);

    try {
      const result: UploadResult = await uploadPDF(selectedFile, 'contracts');
      
      if (result.success && result.file_url && result.file_path) {
        onUploadSuccess(result.file_url, result.file_path);
        setSelectedFile(null);
        // Reset input file
        const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        onUploadError(result.error || 'Upload gagal');
      }
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="pdf-upload-container">
      <div className="mb-4">
        <label 
          htmlFor="pdf-upload" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Upload Contract PDF
        </label>
        
        <input
          id="pdf-upload"
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        <p className="text-xs text-gray-500 mt-1">
          PDF files only, maksimal {maxFileSize}MB
        </p>
      </div>

      {selectedFile && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-red-500 hover:text-red-700 text-sm"
              disabled={uploading}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading || disabled}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {uploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </>
        ) : (
          'Upload PDF'
        )}
      </button>
    </div>
  );
};

export default PDFUpload;