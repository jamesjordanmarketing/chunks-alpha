import { create } from 'zustand';

export interface DocumentChunk {
  id: string;
  chunkNumber: number;
  title: string;
  content: string;
  startLine: number;
  endLine: number;
  pageNumber?: number;
  category: 'header' | 'content' | 'instruction' | 'criteria' | 'example' | 'footer';
  isAnalyzed: boolean;
  metadata: {
    wordCount: number;
    characterCount: number;
    estimatedReadingTime: number; // seconds
    complexity: 'low' | 'medium' | 'high';
  };
  aiFindings: {
    thingsWeKnow: AIFinding[];
    thingsWeNeedToKnow: string[];
    semanticTags: string[];
    ontologicalCategories: string[];
    keyEntities: string[];
    actionableItems: string[];
  };
}

export interface AIFinding {
  id: string;
  category: 'requirement' | 'process' | 'guideline' | 'standard' | 'definition' | 'example';
  finding: string;
  confidence: number; // 0-100
  evidence: string[];
}

export interface DocumentSummary {
  id: string;
  filename: string;
  title: string;
  description: string;
  uploadDate: string;
  totalPages: number;
  totalWords: number;
  documentType: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'error';
  chunks: DocumentChunk[];
  overallInsights: {
    mainPurpose: string;
    keyTopics: string[];
    documentStructure: string[];
    targetAudience: string;
    actionItems: string[];
  };
}

interface DocumentStore {
  currentDocument: DocumentSummary | null;
  currentPage: number;
  setCurrentDocument: (document: DocumentSummary) => void;
  setCurrentPage: (page: number) => void;
  updateChunk: (chunkId: string, updates: Partial<DocumentChunk>) => void;
  markChunkAnalyzed: (chunkId: string) => void;
  addAIFinding: (chunkId: string, finding: AIFinding) => void;
  addKnowledgeGap: (chunkId: string, gap: string) => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  currentDocument: null,
  currentPage: 1,
  
  setCurrentDocument: (document) => set({ currentDocument: document }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  updateChunk: (chunkId, updates) => set((state) => {
    if (!state.currentDocument) return state;
    
    const updatedChunks = state.currentDocument.chunks.map(chunk =>
      chunk.id === chunkId ? { ...chunk, ...updates } : chunk
    );
    
    return {
      currentDocument: {
        ...state.currentDocument,
        chunks: updatedChunks
      }
    };
  }),
  
  markChunkAnalyzed: (chunkId) => set((state) => {
    if (!state.currentDocument) return state;
    
    const updatedChunks = state.currentDocument.chunks.map(chunk =>
      chunk.id === chunkId ? { ...chunk, isAnalyzed: true } : chunk
    );
    
    return {
      currentDocument: {
        ...state.currentDocument,
        chunks: updatedChunks
      }
    };
  }),
  
  addAIFinding: (chunkId, finding) => set((state) => {
    if (!state.currentDocument) return state;
    
    const updatedChunks = state.currentDocument.chunks.map(chunk =>
      chunk.id === chunkId 
        ? { 
            ...chunk, 
            aiFindings: {
              ...chunk.aiFindings,
              thingsWeKnow: [...chunk.aiFindings.thingsWeKnow, finding]
            }
          } 
        : chunk
    );
    
    return {
      currentDocument: {
        ...state.currentDocument,
        chunks: updatedChunks
      }
    };
  }),
  
  addKnowledgeGap: (chunkId, gap) => set((state) => {
    if (!state.currentDocument) return state;
    
    const updatedChunks = state.currentDocument.chunks.map(chunk =>
      chunk.id === chunkId 
        ? { 
            ...chunk, 
            aiFindings: {
              ...chunk.aiFindings,
              thingsWeNeedToKnow: [...chunk.aiFindings.thingsWeNeedToKnow, gap]
            }
          } 
        : chunk
    );
    
    return {
      currentDocument: {
        ...state.currentDocument,
        chunks: updatedChunks
      }
    };
  }),
}));