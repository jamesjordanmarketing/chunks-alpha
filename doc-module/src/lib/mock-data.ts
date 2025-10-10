import { DocumentFile, ValidationResult, ExtractedContent, DocumentMetadata } from './stores/document-store';

// Mock file data for demonstration purposes
export const mockFiles: Partial<DocumentFile>[] = [
  {
    name: 'ML_Training_Guide.pdf',
    size: 2457600,
    type: 'application/pdf',
    format: 'pdf',
    status: 'completed',
    priority: 'high',
    progress: 100
  },
  {
    name: 'Dataset_Documentation.docx',
    size: 1048576,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    format: 'docx',
    status: 'processing',
    priority: 'medium',
    progress: 67
  },
  {
    name: 'README.md',
    size: 8192,
    type: 'text/markdown',
    format: 'md',
    status: 'completed',
    priority: 'low',
    progress: 100
  },
  {
    name: 'Config_Settings.txt',
    size: 4096,
    type: 'text/plain',
    format: 'txt',
    status: 'error',
    priority: 'medium',
    progress: 0,
    errorMessage: 'File appears to be corrupted or unreadable'
  },
  {
    name: 'Technical_Specification.rtf',
    size: 512000,
    type: 'application/rtf',
    format: 'rtf',
    status: 'queued',
    priority: 'high',
    progress: 0
  }
];

export const mockValidationResults: ValidationResult[] = [
  { 
    type: 'format', 
    status: 'passed', 
    message: 'File format recognized and supported',
    details: 'PDF format version 1.4 detected and fully supported'
  },
  { 
    type: 'integrity', 
    status: 'passed', 
    message: 'File integrity verified successfully',
    details: 'All file structures and metadata are intact'
  },
  { 
    type: 'size', 
    status: 'passed', 
    message: 'File size within acceptable limits',
    details: 'Size: 2.34 MB (under 100 MB limit)'
  },
  { 
    type: 'content', 
    status: 'passed', 
    message: 'Content successfully extracted and analyzed',
    details: 'Text extraction completed with 99.8% confidence'
  },
  { 
    type: 'security', 
    status: 'passed', 
    message: 'No security threats detected',
    details: 'Virus scan completed, no malicious content found'
  }
];

export const mockExtractedContent: ExtractedContent = {
  text: `# Machine Learning Training Guide

## Introduction

This comprehensive guide provides step-by-step instructions for training machine learning models using LoRA (Low-Rank Adaptation) techniques. The document covers preparation, training, and evaluation phases.

## Prerequisites

Before beginning the training process, ensure you have the following:

- Python 3.8 or higher
- GPU with at least 8GB VRAM (recommended)
- Required dependencies installed
- Training dataset prepared and validated

## Chapter 1: Data Preparation

### 1.1 Dataset Structure

Your training dataset should be organized as follows:

\`\`\`
dataset/
├── train/
│   ├── images/
│   └── annotations/
├── validation/
│   ├── images/
│   └── annotations/
└── test/
    ├── images/
    └── annotations/
\`\`\`

### 1.2 Data Quality Validation

Before training, it's crucial to validate your data:

1. Check for missing files
2. Verify annotation formats
3. Validate image dimensions
4. Ensure class balance

## Chapter 2: Model Configuration

### 2.1 Base Model Selection

Choose an appropriate base model based on your task requirements:

- For text generation: GPT-3.5/4 or LLaMA
- For image classification: ResNet, EfficientNet
- For object detection: YOLO, R-CNN variants

### 2.2 LoRA Configuration

Configure LoRA parameters:

\`\`\`python
lora_config = {
    "rank": 16,
    "alpha": 32,
    "dropout": 0.1,
    "target_modules": ["attention", "feed_forward"]
}
\`\`\`

## Chapter 3: Training Process

### 3.1 Training Script Setup

Initialize your training environment:

\`\`\`python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import LoraConfig, get_peft_model

# Load base model
model = AutoModelForCausalLM.from_pretrained("base_model_name")
tokenizer = AutoTokenizer.from_pretrained("base_model_name")

# Apply LoRA
model = get_peft_model(model, lora_config)
\`\`\`

### 3.2 Training Loop

Implement the training loop with proper monitoring:

1. Forward pass
2. Loss calculation
3. Backward pass
4. Parameter updates
5. Logging and validation

### 3.3 Monitoring and Evaluation

Track key metrics during training:

- Training loss
- Validation accuracy
- Learning rate
- GPU utilization
- Memory usage

## Chapter 4: Best Practices

### 4.1 Hyperparameter Tuning

Systematically tune hyperparameters:

- Learning rate: Start with 1e-4
- Batch size: Adjust based on GPU memory
- LoRA rank: Try values between 8-64
- Training epochs: Monitor for overfitting

### 4.2 Common Issues and Solutions

**Issue**: Training loss not decreasing
- **Solution**: Check learning rate, verify data loading

**Issue**: Out of memory errors
- **Solution**: Reduce batch size, use gradient checkpointing

**Issue**: Poor validation performance
- **Solution**: Increase training data, adjust regularization

## Chapter 5: Advanced Techniques

### 5.1 Multi-GPU Training

Scale training across multiple GPUs:

\`\`\`python
model = torch.nn.DataParallel(model)
\`\`\`

### 5.2 Mixed Precision Training

Reduce memory usage and increase speed:

\`\`\`python
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()
\`\`\`

## Conclusion

This guide provides a foundation for successful LoRA training. Remember to:

- Validate data quality thoroughly
- Monitor training metrics closely
- Experiment with different configurations
- Document your experiments for reproducibility

For additional resources and community support, visit our documentation portal and forums.

---

*Document Version: 2.1*
*Last Updated: March 2024*
*Authors: ML Engineering Team*`,
  wordCount: 547,
  characterCount: 3842,
  pages: 12,
  language: 'en',
  encoding: 'UTF-8',
  hasImages: false,
  hasTables: true,
  structure: [
    { type: 'heading', level: 1, text: 'Machine Learning Training Guide', position: 0 },
    { type: 'heading', level: 2, text: 'Introduction', position: 1 },
    { type: 'paragraph', text: 'This comprehensive guide provides...', position: 2 },
    { type: 'heading', level: 2, text: 'Prerequisites', position: 3 },
    { type: 'list', text: 'Python 3.8 or higher', position: 4 },
    { type: 'list', text: 'GPU with at least 8GB VRAM', position: 5 },
    { type: 'heading', level: 2, text: 'Chapter 1: Data Preparation', position: 6 },
    { type: 'heading', level: 3, text: '1.1 Dataset Structure', position: 7 },
    { type: 'heading', level: 3, text: '1.2 Data Quality Validation', position: 8 },
    { type: 'heading', level: 2, text: 'Chapter 2: Model Configuration', position: 9 },
    { type: 'heading', level: 2, text: 'Chapter 3: Training Process', position: 10 },
    { type: 'heading', level: 2, text: 'Chapter 4: Best Practices', position: 11 },
    { type: 'heading', level: 2, text: 'Chapter 5: Advanced Techniques', position: 12 },
    { type: 'heading', level: 2, text: 'Conclusion', position: 13 }
  ]
};

export const mockMetadata: DocumentMetadata = {
  author: 'ML Engineering Team',
  createdAt: new Date('2024-03-15T10:30:00Z'),
  modifiedAt: new Date('2024-03-20T14:22:00Z'),
  title: 'Machine Learning Training Guide',
  subject: 'Technical Documentation',
  keywords: ['machine learning', 'LoRA', 'training', 'deep learning', 'AI'],
  application: 'Adobe Acrobat Pro',
  fileSize: 2457600,
  checksum: 'sha256:a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890'
};

// Supabase table schemas for future backend integration
export const supabaseSchemas = {
  documents: `
    CREATE TABLE documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR NOT NULL,
      size BIGINT NOT NULL,
      type VARCHAR NOT NULL,
      format VARCHAR NOT NULL,
      status VARCHAR NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'error', 'paused', 'validating')),
      priority VARCHAR NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
      progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      processing_started_at TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE,
      error_message TEXT,
      user_id UUID REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  document_validation: `
    CREATE TABLE document_validation (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      type VARCHAR NOT NULL CHECK (type IN ('format', 'integrity', 'size', 'content', 'security')),
      status VARCHAR NOT NULL CHECK (status IN ('passed', 'failed', 'warning')),
      message TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  document_content: `
    CREATE TABLE document_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      extracted_text TEXT,
      word_count INTEGER,
      character_count INTEGER,
      pages INTEGER,
      language VARCHAR,
      encoding VARCHAR,
      has_images BOOLEAN DEFAULT FALSE,
      has_tables BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  document_metadata: `
    CREATE TABLE document_metadata (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      author VARCHAR,
      created_at_source TIMESTAMP WITH TIME ZONE,
      modified_at_source TIMESTAMP WITH TIME ZONE,
      title VARCHAR,
      subject VARCHAR,
      keywords TEXT[],
      application VARCHAR,
      checksum VARCHAR,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  document_structure: `
    CREATE TABLE document_structure (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      type VARCHAR NOT NULL CHECK (type IN ('heading', 'paragraph', 'list', 'table', 'image')),
      level INTEGER,
      text TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
};

// API endpoints structure for future implementation
export const apiEndpoints = {
  upload: 'POST /api/documents/upload',
  list: 'GET /api/documents',
  get: 'GET /api/documents/:id',
  delete: 'DELETE /api/documents/:id',
  updateStatus: 'PATCH /api/documents/:id/status',
  updatePriority: 'PATCH /api/documents/:id/priority',
  getContent: 'GET /api/documents/:id/content',
  getValidation: 'GET /api/documents/:id/validation',
  getMetadata: 'GET /api/documents/:id/metadata',
  batchOperations: 'POST /api/documents/batch',
  processingStats: 'GET /api/documents/stats'
};

export default {
  mockFiles,
  mockValidationResults,
  mockExtractedContent,
  mockMetadata,
  supabaseSchemas,
  apiEndpoints
};