import { CONFIG } from '../config';
import { SharedText, SharedFile } from '../types';

// Upload text
export async function uploadText(text: string): Promise<SharedText> {
  const response = await fetch(`${CONFIG.API_BASE_URL}/test-save?text=${encodeURIComponent(text)}`, {
    method: 'GET'
  });
  
  if (!response.ok) {
    throw new Error('Failed to save text');
  }
  
  const data = await response.json();
  
  if (data && data.code) {
    return data;
  } else {
    throw new Error('Invalid response');
  }
}

// Upload file
export async function uploadFile(file: File): Promise<SharedFile> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${CONFIG.API_BASE_URL}/share-file`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
  
  const data = await response.json();
  
  if (data && data.code) {
    return data;
  } else {
    throw new Error('Invalid response');
  }
}

// Get text by code
export async function getTextByCode(code: string): Promise<SharedText | null> {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/test-get?code=${code}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.content) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Get text error:', error);
    return null;
  }
}

// Get file by code
export async function getFileByCode(code: string): Promise<SharedFile | null> {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/file/${code}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.originalFilename) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Get file error:', error);
    return null;
  }
}

// Get download URL
export function getDownloadUrl(code: string): string {
  return `${CONFIG.API_BASE_URL}/download/${code}`;
}

