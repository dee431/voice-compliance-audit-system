export interface AnalysisResult {
  transcription: string;
  similarityScore: number;
  isAcceptable: boolean;
  analysis: string;
  correctedVersion: string;
  mode?: 'verification' | 'transcription';
}

export interface FileData {
  name: string;
  type: string;
  data: string; // Base64
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}