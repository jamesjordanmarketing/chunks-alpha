import { create } from 'zustand';

export interface ProcessStep {
  id: string;
  number: number;
  title: string;
  description: string;
  requiredInputs: string[];
  expectedOutputs: string[];
  decisionPoints: DecisionPoint[];
  isValidated: boolean;
  isProprietary: boolean;
  estimatedDuration: number; // minutes
}

export interface DecisionPoint {
  id: string;
  condition: string;
  truePath: string;
  falsePath: string;
  type: 'boolean' | 'multiple' | 'threshold';
}

export interface ProprietaryElement {
  id: string;
  stepId: string;
  element: string;
  uniqueValue: string;
  competitiveAdvantage: string;
  tradeSecretLevel: 'low' | 'medium' | 'high';
}

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  threshold: number;
  unit: string;
  type: 'time' | 'cost' | 'quality' | 'efficiency';
  currentValue?: number;
}

export interface ProcessVariation {
  id: string;
  name: string;
  description: string;
  scenario: string;
  modifiedSteps: string[];
  additionalSteps: ProcessStep[];
}

export interface Process {
  id: string;
  name: string;
  type: string;
  estimatedDuration: number;
  description: string;
  steps: ProcessStep[];
  proprietaryElements: ProprietaryElement[];
  successMetrics: SuccessMetric[];
  variations: ProcessVariation[];
  commonMistakes: string[];
  dependencies: { [stepId: string]: string[] };
}

interface ProcessStore {
  currentProcess: Process | null;
  currentPage: number;
  setCurrentProcess: (process: Process) => void;
  setCurrentPage: (page: number) => void;
  updateStep: (stepId: string, updates: Partial<ProcessStep>) => void;
  addProprietaryElement: (element: ProprietaryElement) => void;
  updateSuccessMetric: (metricId: string, updates: Partial<SuccessMetric>) => void;
  addProcessVariation: (variation: ProcessVariation) => void;
  reorderSteps: (stepIds: string[]) => void;
  validateStep: (stepId: string) => void;
}

export const useProcessStore = create<ProcessStore>((set, get) => ({
  currentProcess: null,
  currentPage: 1,
  
  setCurrentProcess: (process) => set({ currentProcess: process }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  updateStep: (stepId, updates) => set((state) => {
    if (!state.currentProcess) return state;
    
    const updatedSteps = state.currentProcess.steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );
    
    return {
      currentProcess: {
        ...state.currentProcess,
        steps: updatedSteps
      }
    };
  }),
  
  addProprietaryElement: (element) => set((state) => {
    if (!state.currentProcess) return state;
    
    return {
      currentProcess: {
        ...state.currentProcess,
        proprietaryElements: [...state.currentProcess.proprietaryElements, element]
      }
    };
  }),
  
  updateSuccessMetric: (metricId, updates) => set((state) => {
    if (!state.currentProcess) return state;
    
    const updatedMetrics = state.currentProcess.successMetrics.map(metric =>
      metric.id === metricId ? { ...metric, ...updates } : metric
    );
    
    return {
      currentProcess: {
        ...state.currentProcess,
        successMetrics: updatedMetrics
      }
    };
  }),
  
  addProcessVariation: (variation) => set((state) => {
    if (!state.currentProcess) return state;
    
    return {
      currentProcess: {
        ...state.currentProcess,
        variations: [...state.currentProcess.variations, variation]
      }
    };
  }),
  
  reorderSteps: (stepIds) => set((state) => {
    if (!state.currentProcess) return state;
    
    const reorderedSteps = stepIds.map((stepId, index) => {
      const step = state.currentProcess!.steps.find(s => s.id === stepId);
      return step ? { ...step, number: index + 1 } : null;
    }).filter(Boolean) as ProcessStep[];
    
    return {
      currentProcess: {
        ...state.currentProcess,
        steps: reorderedSteps
      }
    };
  }),
  
  validateStep: (stepId) => set((state) => {
    if (!state.currentProcess) return state;
    
    const updatedSteps = state.currentProcess.steps.map(step =>
      step.id === stepId ? { ...step, isValidated: true } : step
    );
    
    return {
      currentProcess: {
        ...state.currentProcess,
        steps: updatedSteps
      }
    };
  }),
}));