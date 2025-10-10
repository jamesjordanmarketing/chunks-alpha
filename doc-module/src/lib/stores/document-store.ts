import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  format: 'pdf' | 'docx' | 'txt' | 'md' | 'rtf' | 'unknown';
  status: 'queued' | 'processing' | 'completed' | 'error' | 'paused' | 'validating';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  uploadedAt: Date;
  processingStartedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  validationResults?: ValidationResult[];
  extractedContent?: ExtractedContent;
  metadata?: DocumentMetadata;
  thumbnailUrl?: string;
}

export interface ValidationResult {
  type: 'format' | 'integrity' | 'size' | 'content' | 'security';
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: string;
}

export interface ExtractedContent {
  text: string;
  wordCount: number;
  characterCount: number;
  pages: number;
  language: string;
  encoding: string;
  hasImages: boolean;
  hasTables: boolean;
  structure: ContentStructure[];
}

export interface ContentStructure {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'image';
  level?: number;
  text: string;
  position: number;
}

export interface DocumentMetadata {
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  title?: string;
  subject?: string;
  keywords?: string[];
  application?: string;
  fileSize: number;
  checksum: string;
}

export interface ProcessingStats {
  totalFiles: number;
  queuedFiles: number;
  processingFiles: number;
  completedFiles: number;
  errorFiles: number;
  pausedFiles: number;
  totalProgress: number;
  estimatedTimeRemaining?: number;
  throughputPerMinute: number;
}

interface DocumentStore {
  files: DocumentFile[];
  selectedFileIds: string[];
  currentView: 'upload' | 'queue' | 'preview';
  selectedFileForPreview?: string;
  isUploading: boolean;
  isDragOver: boolean;
  processingStats: ProcessingStats;
  
  // Actions
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  removeFiles: (fileIds: string[]) => void;
  updateFileStatus: (fileId: string, status: DocumentFile['status'], progress?: number) => void;
  updateFilePriority: (fileId: string, priority: DocumentFile['priority']) => void;
  reorderFiles: (fileIds: string[]) => void;
  selectFile: (fileId: string) => void;
  selectMultipleFiles: (fileIds: string[]) => void;
  clearSelection: () => void;
  setCurrentView: (view: 'upload' | 'queue' | 'preview') => void;
  setSelectedFileForPreview: (fileId?: string) => void;
  setIsUploading: (isUploading: boolean) => void;
  setIsDragOver: (isDragOver: boolean) => void;
  pauseFile: (fileId: string) => void;
  resumeFile: (fileId: string) => void;
  retryFile: (fileId: string) => void;
  startProcessing: (fileId: string) => void;
  updateProcessingStats: () => void;
  
  // Batch operations
  pauseAllFiles: () => void;
  resumeAllFiles: () => void;
  clearCompletedFiles: () => void;
  clearErrorFiles: () => void;
}

const generateMockValidationResults = (): ValidationResult[] => [
  { type: 'format', status: 'passed', message: 'File format recognized and supported' },
  { type: 'integrity', status: 'passed', message: 'File integrity verified' },
  { type: 'size', status: 'passed', message: 'File size within limits (< 100MB)' },
  { type: 'security', status: 'passed', message: 'No security threats detected' },
  { type: 'content', status: 'passed', message: 'Content successfully extracted' }
];

const generateMockExtractedContent = (fileName: string): ExtractedContent => {
  const sampleTexts = [
    "This document contains comprehensive information about machine learning algorithms and their applications in natural language processing. The content covers various aspects of deep learning, neural networks, and transformer architectures...",
    "Executive Summary: Our Q3 financial results demonstrate strong growth across all business segments. Revenue increased by 23% year-over-year, driven by expansion in cloud services and enterprise solutions...",
    "Technical specification document outlining the architecture and implementation details of our new microservices platform. This document provides guidance for developers and system administrators...",
    "Research paper investigating the effectiveness of various data preprocessing techniques in improving model performance for document classification tasks. The study examines multiple approaches..."
  ];
  
  const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  
  return {
    text: text + " [Content preview truncated for display purposes]",
    wordCount: Math.floor(Math.random() * 5000) + 1000,
    characterCount: Math.floor(Math.random() * 25000) + 5000,
    pages: Math.floor(Math.random() * 20) + 1,
    language: 'en',
    encoding: 'UTF-8',
    hasImages: Math.random() > 0.5,
    hasTables: Math.random() > 0.7,
    structure: [
      { type: 'heading', level: 1, text: 'Document Title', position: 0 },
      { type: 'paragraph', text: 'Introduction paragraph...', position: 1 },
      { type: 'heading', level: 2, text: 'Section 1', position: 2 },
      { type: 'paragraph', text: 'Content paragraph...', position: 3 }
    ]
  };
};

const generateMockMetadata = (file: File): DocumentMetadata => ({
  author: ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Lisa Anderson'][Math.floor(Math.random() * 4)],
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  modifiedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  title: file.name.replace(/\.[^/.]+$/, ""),
  subject: ['Technical Documentation', 'Business Report', 'Research Paper', 'User Manual'][Math.floor(Math.random() * 4)],
  keywords: ['document', 'processing', 'analysis', 'data', 'content'].slice(0, Math.floor(Math.random() * 3) + 2),
  application: ['Microsoft Word', 'Adobe Acrobat', 'Google Docs', 'LibreOffice'][Math.floor(Math.random() * 4)],
  fileSize: file.size,
  checksum: Math.random().toString(36).substring(2, 15)
});

const getFileFormat = (type: string): DocumentFile['format'] => {
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('word') || type.includes('docx')) return 'docx';
  if (type.includes('text')) return 'txt';
  if (type.includes('markdown')) return 'md';
  if (type.includes('rtf')) return 'rtf';
  return 'unknown';
};

export const useDocumentStore = create<DocumentStore>()(
  devtools(
    (set, get) => ({
      files: [],
      selectedFileIds: [],
      currentView: 'upload',
      selectedFileForPreview: undefined,
      isUploading: false,
      isDragOver: false,
      processingStats: {
        totalFiles: 0,
        queuedFiles: 0,
        processingFiles: 0,
        completedFiles: 0,
        errorFiles: 0,
        pausedFiles: 0,
        totalProgress: 0,
        throughputPerMinute: 0
      },

      addFiles: (newFiles: File[]) => {
        const files = get().files;
        const newDocumentFiles: DocumentFile[] = newFiles.map(file => ({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          format: getFileFormat(file.type),
          status: 'queued',
          priority: 'medium',
          progress: 0,
          uploadedAt: new Date(),
          validationResults: generateMockValidationResults(),
          extractedContent: generateMockExtractedContent(file.name),
          metadata: generateMockMetadata(file)
        }));

        set({ files: [...files, ...newDocumentFiles] });
        get().updateProcessingStats();
        
        // Simulate automatic processing
        newDocumentFiles.forEach(file => {
          setTimeout(() => get().startProcessing(file.id), Math.random() * 2000);
        });
      },

      removeFile: (fileId: string) => {
        const files = get().files.filter(f => f.id !== fileId);
        set({ 
          files,
          selectedFileIds: get().selectedFileIds.filter(id => id !== fileId)
        });
        get().updateProcessingStats();
      },

      removeFiles: (fileIds: string[]) => {
        const files = get().files.filter(f => !fileIds.includes(f.id));
        set({ 
          files,
          selectedFileIds: get().selectedFileIds.filter(id => !fileIds.includes(id))
        });
        get().updateProcessingStats();
      },

      updateFileStatus: (fileId: string, status: DocumentFile['status'], progress?: number) => {
        const files = get().files.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                status, 
                progress: progress ?? f.progress,
                processingStartedAt: status === 'processing' ? new Date() : f.processingStartedAt,
                completedAt: status === 'completed' ? new Date() : f.completedAt
              }
            : f
        );
        set({ files });
        get().updateProcessingStats();
      },

      updateFilePriority: (fileId: string, priority: DocumentFile['priority']) => {
        const files = get().files.map(f => 
          f.id === fileId ? { ...f, priority } : f
        );
        set({ files });
      },

      reorderFiles: (fileIds: string[]) => {
        const files = get().files;
        const reorderedFiles = fileIds.map(id => files.find(f => f.id === id)!);
        const remainingFiles = files.filter(f => !fileIds.includes(f.id));
        set({ files: [...reorderedFiles, ...remainingFiles] });
      },

      selectFile: (fileId: string) => {
        set({ selectedFileIds: [fileId] });
      },

      selectMultipleFiles: (fileIds: string[]) => {
        set({ selectedFileIds: fileIds });
      },

      clearSelection: () => {
        set({ selectedFileIds: [] });
      },

      setCurrentView: (view: 'upload' | 'queue' | 'preview') => {
        set({ currentView: view });
      },

      setSelectedFileForPreview: (fileId?: string) => {
        set({ selectedFileForPreview: fileId });
      },

      setIsUploading: (isUploading: boolean) => {
        set({ isUploading });
      },

      setIsDragOver: (isDragOver: boolean) => {
        set({ isDragOver });
      },

      pauseFile: (fileId: string) => {
        get().updateFileStatus(fileId, 'paused');
      },

      resumeFile: (fileId: string) => {
        const file = get().files.find(f => f.id === fileId);
        if (file?.status === 'paused') {
          get().updateFileStatus(fileId, file.progress === 0 ? 'queued' : 'processing');
        }
      },

      retryFile: (fileId: string) => {
        get().updateFileStatus(fileId, 'queued', 0);
        setTimeout(() => get().startProcessing(fileId), 1000);
      },

      startProcessing: (fileId: string) => {
        get().updateFileStatus(fileId, 'validating');
        
        // Simulate validation phase
        setTimeout(() => {
          get().updateFileStatus(fileId, 'processing', 0);
          
          // Simulate processing with progress updates
          const progressInterval = setInterval(() => {
            const file = get().files.find(f => f.id === fileId);
            if (!file || file.status !== 'processing') {
              clearInterval(progressInterval);
              return;
            }
            
            const newProgress = Math.min(file.progress + Math.random() * 15 + 5, 100);
            get().updateFileStatus(fileId, 'processing', newProgress);
            
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              get().updateFileStatus(fileId, 'completed', 100);
            }
          }, 500 + Math.random() * 1000);
        }, 1000 + Math.random() * 2000);
      },

      updateProcessingStats: () => {
        const files = get().files;
        const stats: ProcessingStats = {
          totalFiles: files.length,
          queuedFiles: files.filter(f => f.status === 'queued').length,
          processingFiles: files.filter(f => f.status === 'processing' || f.status === 'validating').length,
          completedFiles: files.filter(f => f.status === 'completed').length,
          errorFiles: files.filter(f => f.status === 'error').length,
          pausedFiles: files.filter(f => f.status === 'paused').length,
          totalProgress: files.length > 0 ? files.reduce((sum, f) => sum + f.progress, 0) / files.length : 0,
          throughputPerMinute: Math.floor(Math.random() * 10) + 5
        };
        
        // Calculate estimated time remaining
        const processingFiles = stats.processingFiles + stats.queuedFiles;
        if (processingFiles > 0 && stats.throughputPerMinute > 0) {
          stats.estimatedTimeRemaining = Math.ceil(processingFiles / stats.throughputPerMinute);
        }
        
        set({ processingStats: stats });
      },

      pauseAllFiles: () => {
        const files = get().files.map(f => 
          (f.status === 'processing' || f.status === 'queued') 
            ? { ...f, status: 'paused' as const }
            : f
        );
        set({ files });
        get().updateProcessingStats();
      },

      resumeAllFiles: () => {
        const files = get().files.map(f => 
          f.status === 'paused' 
            ? { ...f, status: (f.progress === 0 ? 'queued' : 'processing') as const }
            : f
        );
        set({ files });
        get().updateProcessingStats();
        
        // Restart processing for resumed files
        files.forEach(f => {
          if (f.status === 'queued') {
            setTimeout(() => get().startProcessing(f.id), Math.random() * 1000);
          }
        });
      },

      clearCompletedFiles: () => {
        const files = get().files.filter(f => f.status !== 'completed');
        set({ files });
        get().updateProcessingStats();
      },

      clearErrorFiles: () => {
        const files = get().files.filter(f => f.status !== 'error');
        set({ files });
        get().updateProcessingStats();
      }
    }),
    {
      name: 'document-store',
    }
  )
);