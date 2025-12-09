export interface SharedText {
  code: string;
  content: string;
  createdAt: string;
}

export interface SharedFile {
  code: string;
  originalFilename: string;
  size: number;
  contentType: string;
  path: string;
  createdAt: string;
}

export type ReceivedContent = SharedText | SharedFile;

export interface Config {
  API_BASE_URL: string;
  TOAST_DURATION: number;
  MAX_FILE_SIZE: number;
}

