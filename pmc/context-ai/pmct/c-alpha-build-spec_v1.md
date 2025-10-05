# Bright Run Chunks Alpha Module - Final Build Specification
**Version:** 1.0  
**Date:** January 2025  
**Module:** Chunk Dimension Testing Environment  

## Executive Summary

This specification details the implementation of a chunk dimension testing environment that extends the existing document categorization module. The system will automatically extract document chunks, generate 60+ dimension values per chunk using AI, and display all data in a spreadsheet interface for evaluation and testing.

---

## SECTION A: Database Setup & Prerequisites
*These steps must be completed BEFORE running the main build prompts*

### Step 1: Supabase SQL Setup

**Instructions for Human:** 
1. Open your Supabase SQL Editor
2. Copy and paste the following SQL commands in sequence
3. Execute each block separately and verify successful completion

```sql
-- ============================================
-- BLOCK 1: Create Chunk Storage Tables
-- ============================================

-- Main chunks table
CREATE TABLE IF NOT EXISTS chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chunk_id VARCHAR(255) UNIQUE NOT NULL, -- Format: DOC_ID#C001
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_type VARCHAR(50) NOT NULL CHECK (chunk_type IN ('Chapter_Sequential', 'Instructional_Unit', 'CER', 'Example_Scenario')),
    chunk_order INTEGER NOT NULL,
    
    -- Structural data
    section_heading TEXT,
    page_start INTEGER,
    page_end INTEGER,
    char_start INTEGER NOT NULL,
    char_end INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    overlap_tokens INTEGER DEFAULT 0,
    chunk_handle VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index for efficient querying
    INDEX idx_chunks_document (document_id),
    INDEX idx_chunks_type (chunk_type),
    UNIQUE INDEX idx_chunks_order (document_id, chunk_order)
);

-- ============================================
-- BLOCK 2: Create Dimension Values Table
-- ============================================

-- Table for storing all dimension values (normalized)
CREATE TABLE IF NOT EXISTS chunk_dimensions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chunk_id VARCHAR(255) NOT NULL REFERENCES chunks(chunk_id) ON DELETE CASCADE,
    run_id UUID NOT NULL REFERENCES dimension_runs(id) ON DELETE CASCADE,
    
    -- Previously Generated Dimensions (from document)
    doc_id VARCHAR(255),
    doc_title TEXT,
    doc_version VARCHAR(50),
    source_type VARCHAR(50),
    source_url TEXT,
    author TEXT,
    doc_date DATE,
    primary_category TEXT,
    
    -- Mechanically Generated Dimensions
    embedding_id VARCHAR(255),
    vector_checksum VARCHAR(255),
    label_source VARCHAR(20) DEFAULT 'auto',
    label_model VARCHAR(100),
    labeled_by VARCHAR(100) DEFAULT 'auto',
    label_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_status VARCHAR(20) DEFAULT 'unreviewed',
    data_split VARCHAR(10) DEFAULT 'train',
    
    -- AI Generated Dimensions - Content Analysis
    chunk_summary_1s TEXT,
    key_terms TEXT,
    audience TEXT,
    intent VARCHAR(20),
    tone_voice_tags TEXT,
    brand_persona_tags TEXT,
    domain_tags TEXT,
    
    -- AI Generated - Task Dimensions (for Instructional chunks)
    task_name TEXT,
    preconditions TEXT,
    inputs TEXT,
    steps_json JSONB,
    expected_output TEXT,
    warnings_failure_modes TEXT,
    
    -- AI Generated - CER Dimensions
    claim TEXT,
    evidence_snippets TEXT,
    reasoning_sketch TEXT,
    citations TEXT,
    factual_confidence DECIMAL(3,2),
    
    -- AI Generated - Example Dimensions
    scenario_type VARCHAR(50),
    problem_context TEXT,
    solution_action TEXT,
    outcome_metrics TEXT,
    style_notes TEXT,
    
    -- AI Generated - Training Dimensions
    prompt_candidate TEXT,
    target_answer TEXT,
    style_directives TEXT,
    
    -- AI Generated - Risk/Compliance Dimensions
    safety_tags TEXT,
    coverage_tag VARCHAR(20),
    novelty_tag VARCHAR(20),
    ip_sensitivity VARCHAR(50),
    pii_flag BOOLEAN DEFAULT FALSE,
    compliance_flags TEXT,
    
    -- Training Decisions
    include_in_training BOOLEAN DEFAULT TRUE,
    augmentation_notes TEXT,
    
    -- Meta Dimensions for Analysis
    dimension_criticality INTEGER CHECK (dimension_criticality BETWEEN 1 AND 10),
    dimension_category VARCHAR(50), -- e.g., 'privacy', 'content', 'training'
    ai_engineering_type VARCHAR(100), -- e.g., 'simple_extraction', 'deep_analysis', 'multi_chunk_reasoning'
    system_confidence INTEGER CHECK (system_confidence BETWEEN 1 AND 10),
    generation_cost DECIMAL(10,6), -- in dollars
    precision_confidence INTEGER CHECK (precision_confidence BETWEEN 1 AND 10),
    accuracy_confidence INTEGER CHECK (accuracy_confidence BETWEEN 1 AND 10),
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_dimensions_chunk (chunk_id),
    INDEX idx_dimensions_run (run_id),
    INDEX idx_dimensions_confidence (system_confidence),
    UNIQUE INDEX idx_dimensions_unique (chunk_id, run_id)
);

-- ============================================
-- BLOCK 3: Create Dimension Runs Table
-- ============================================

-- Table for tracking generation runs
CREATE TABLE IF NOT EXISTS dimension_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    run_name VARCHAR(255) NOT NULL,
    run_type VARCHAR(50) DEFAULT 'full', -- 'full', 'regeneration', 'test'
    
    -- Run metadata
    total_chunks INTEGER,
    processed_chunks INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    
    -- AI Processing metadata
    ai_model VARCHAR(100),
    prompt_version VARCHAR(50),
    total_tokens_used INTEGER DEFAULT 0,
    total_api_cost DECIMAL(10,4) DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processing_time_seconds INTEGER,
    
    -- Results summary
    avg_confidence DECIMAL(3,2),
    high_confidence_count INTEGER DEFAULT 0, -- dimensions with confidence >= 8
    low_confidence_count INTEGER DEFAULT 0,  -- dimensions with confidence < 5
    unable_to_determine_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_runs_document (document_id),
    INDEX idx_runs_status (status),
    INDEX idx_runs_created (created_at DESC)
);

-- ============================================
-- BLOCK 4: Create Prompt Templates Table
-- ============================================

-- Table for storing prompt templates
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name VARCHAR(100) UNIQUE NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- 'content_analysis', 'task_extraction', 'cer_analysis', etc.
    prompt_text TEXT NOT NULL,
    json_schema JSONB, -- Expected response schema
    version VARCHAR(20) DEFAULT 'v1',
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Performance tracking
    usage_count INTEGER DEFAULT 0,
    avg_confidence DECIMAL(3,2),
    avg_tokens INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_templates_type (template_type),
    INDEX idx_templates_active (is_active)
);

-- ============================================
-- BLOCK 5: Create Processing Queue Table
-- ============================================

-- Table for managing chunk processing queue
CREATE TABLE IF NOT EXISTS chunk_processing_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES dimension_runs(id) ON DELETE CASCADE,
    chunk_id VARCHAR(255) NOT NULL REFERENCES chunks(chunk_id) ON DELETE CASCADE,
    
    -- Processing status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'retrying'
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Error tracking
    error_message TEXT,
    last_error_at TIMESTAMP WITH TIME ZONE,
    
    -- Timing
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_queue_status (status),
    INDEX idx_queue_run (run_id),
    UNIQUE INDEX idx_queue_unique (run_id, chunk_id)
);

-- ============================================
-- BLOCK 6: Create Preset Views Table
-- ============================================

-- Table for storing spreadsheet preset views
CREATE TABLE IF NOT EXISTS spreadsheet_preset_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    view_name VARCHAR(100) UNIQUE NOT NULL,
    display_columns TEXT[], -- Array of column names to display
    sort_column VARCHAR(100),
    sort_direction VARCHAR(4) DEFAULT 'ASC',
    filter_conditions JSONB, -- JSON object with filter conditions
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_views_default (is_default)
);

-- ============================================
-- BLOCK 7: Insert Default Prompt Templates
-- ============================================

-- Insert default prompt templates
INSERT INTO prompt_templates (template_name, template_type, prompt_text, json_schema) VALUES
(
    'content_analysis_v1',
    'content_analysis',
    'Analyze this text chunk and extract the following content dimensions. Be precise and concise in your analysis.

Document context:
Title: {{doc_title}}
Category: {{primary_category}}
Author: {{author}}

Chunk text:
{{chunk_text}}

Provide your analysis in the specified JSON format.',
    '{
        "chunk_summary_1s": {"type": "string", "maxLength": 240},
        "key_terms": {"type": "array", "items": {"type": "string"}},
        "audience": {"type": "string"},
        "intent": {"type": "string", "enum": ["educate", "instruct", "persuade", "inform", "narrate", "summarize", "compare", "evaluate"]},
        "tone_voice_tags": {"type": "array", "items": {"type": "string"}},
        "brand_persona_tags": {"type": "array", "items": {"type": "string"}},
        "domain_tags": {"type": "array", "items": {"type": "string"}}
    }'::jsonb
),
(
    'task_extraction_v1',
    'task_extraction',
    'Extract task/procedural information from this instructional chunk. Focus on actionable steps and clear outcomes.

Chunk text:
{{chunk_text}}

Provide detailed task information in the specified JSON format.',
    '{
        "task_name": {"type": "string"},
        "preconditions": {"type": "string"},
        "inputs": {"type": "string"},
        "steps": {"type": "array", "items": {"type": "object"}},
        "expected_output": {"type": "string"},
        "warnings_failure_modes": {"type": "string"}
    }'::jsonb
),
(
    'cer_analysis_v1',
    'cer_analysis',
    'Analyze this chunk for Claims, Evidence, and Reasoning. Extract factual assertions and supporting evidence.

Chunk text:
{{chunk_text}}

Provide CER analysis in the specified JSON format.',
    '{
        "claim": {"type": "string"},
        "evidence_snippets": {"type": "array", "items": {"type": "string"}},
        "reasoning_sketch": {"type": "string"},
        "citations": {"type": "array", "items": {"type": "string"}},
        "factual_confidence": {"type": "number", "minimum": 0, "maximum": 1}
    }'::jsonb
);

-- ============================================
-- BLOCK 8: Insert Default Preset Views
-- ============================================

INSERT INTO spreadsheet_preset_views (view_name, display_columns, is_default) VALUES
(
    'Quality View',
    ARRAY[
        'chunk_id', 'chunk_type', 'chunk_summary_1s', 
        'system_confidence', 'precision_confidence', 'accuracy_confidence',
        'factual_confidence', 'review_status', 'include_in_training'
    ],
    TRUE
),
(
    'Cost View',
    ARRAY[
        'chunk_id', 'chunk_type', 'token_count',
        'generation_cost', 'ai_engineering_type', 'label_model',
        'total_api_cost', 'processing_time_seconds'
    ],
    FALSE
),
(
    'Confidence View',
    ARRAY[
        'chunk_id', 'chunk_type', 'system_confidence',
        'precision_confidence', 'accuracy_confidence', 'factual_confidence',
        'coverage_tag', 'novelty_tag', 'dimension_criticality'
    ],
    FALSE
);

-- ============================================
-- BLOCK 9: Create Helper Functions
-- ============================================

-- Function to get the latest run for a document
CREATE OR REPLACE FUNCTION get_latest_run(doc_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM dimension_runs 
        WHERE document_id = doc_id 
        ORDER BY created_at DESC 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate run statistics
CREATE OR REPLACE FUNCTION update_run_statistics(run_uuid UUID)
RETURNS void AS $$
DECLARE
    avg_conf DECIMAL(3,2);
    high_count INTEGER;
    low_count INTEGER;
    unable_count INTEGER;
BEGIN
    SELECT 
        AVG(system_confidence),
        COUNT(*) FILTER (WHERE system_confidence >= 8),
        COUNT(*) FILTER (WHERE system_confidence < 5),
        COUNT(*) FILTER (WHERE chunk_summary_1s = 'Unable to determine')
    INTO avg_conf, high_count, low_count, unable_count
    FROM chunk_dimensions
    WHERE run_id = run_uuid;
    
    UPDATE dimension_runs
    SET 
        avg_confidence = avg_conf,
        high_confidence_count = high_count,
        low_confidence_count = low_count,
        unable_to_determine_count = unable_count,
        updated_at = NOW()
    WHERE id = run_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- BLOCK 10: Create Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_chunks_fulltext ON chunks USING gin(to_tsvector('english', chunk_text));
CREATE INDEX IF NOT EXISTS idx_dimensions_summary ON chunk_dimensions USING gin(to_tsvector('english', chunk_summary_1s));
CREATE INDEX IF NOT EXISTS idx_dimensions_tags ON chunk_dimensions USING gin(to_tsvector('english', key_terms || ' ' || domain_tags));

-- Grant appropriate permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

### Step 2: Environment Setup

**Instructions for Human:**
1. Create a `.env.local` file in your project root if it doesn't exist
2. Add the following environment variables:

```bash
# AI API Configuration
ANTHROPIC_API_KEY=your_claude_api_key_here
ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=4096

# Processing Configuration
CHUNK_BATCH_SIZE=5
MAX_RETRIES=3
RETRY_DELAY_MS=2000
PROCESSING_TIMEOUT_MS=30000

# Cost Tracking
COST_PER_1K_INPUT_TOKENS=0.003
COST_PER_1K_OUTPUT_TOKENS=0.015
```

### Step 3: Prompt Template Files Setup

**Instructions for Human:**
1. Create a new folder: `chunks-alpha/prompts/`
2. Create markdown files for each prompt template
3. These files will be editable for testing different prompts

Create `prompts/content-analysis.md`:
```markdown
Analyze this text chunk and extract content dimensions with high precision.

# Document Context
- Title: {{doc_title}}
- Category: {{primary_category}}
- Author: {{author}}

# Chunk Information
- Type: {{chunk_type}}
- Position: Chunk {{chunk_order}} of {{total_chunks}}

# Text to Analyze
{{chunk_text}}

# Instructions
Provide a comprehensive analysis following the JSON schema. For each dimension:
1. Be precise and specific to this chunk
2. Rate your confidence (1-10) in each answer
3. Mark as "Unable to determine" if insufficient information

# Response Format
Respond with valid JSON matching the provided schema.
```

---

## SECTION B: Main Build Prompts

### PROMPT 1: Core Chunk Processing Infrastructure
*This prompt builds the chunk extraction engine, processing pipeline, and background job system*

**Instructions for Human:**
1. Ensure all SQL from Section A is executed
2. Copy the entire prompt below into Claude 4.5 Sonnet (200k context)
3. Let it complete all file modifications
4. Test that the basic chunk extraction works before proceeding

```
You are an expert full-stack developer building a chunk dimension testing environment for the Bright Run LoRA training data platform. You will extend the existing document categorization module to add chunk extraction and dimension generation capabilities.

# Context
The existing codebase is a Next.js 14 application with:
- Document categorization workflow (3 panels: belonging, category, tags)
- Supabase database with documents and categorization data
- TypeScript, shadcn/ui components, Zustand state management

# Your Task
Build the core chunk processing infrastructure including:
1. Chunk extraction engine (4 types: Chapter, Instructional, CER, Example)
2. Background job processing system
3. API routes for chunk operations
4. Database integration layer

# Requirements

## 1. Chunk Extraction Engine
Create `/lib/chunking/chunk-extractor.ts`:
- Extract Chapter chunks (max 15) by detecting headings, sections, page breaks
- Extract Instructional chunks (max 5) by finding procedures, how-to content
- Extract CER chunks (max 10) by identifying claims with evidence
- Extract Example chunks (max 5) by finding scenarios, case studies
- Use AI to rank and select most valuable chunks when limits exceeded

## 2. Background Processing System
Create `/lib/processing/job-processor.ts`:
- Queue management for chunk processing
- Batch processing (5 chunks at a time from env)
- Retry logic with exponential backoff
- Progress tracking and status updates
- Error handling and recovery

## 3. API Routes
Create/Update these API routes:

`/api/chunks/extract/route.ts`:
- POST endpoint to start chunk extraction
- Creates chunks in database
- Initiates dimension run
- Returns run_id for tracking

`/api/chunks/[chunkId]/route.ts`:
- GET endpoint for chunk details
- PUT endpoint for regeneration
- DELETE endpoint (soft delete)

`/api/runs/[runId]/route.ts`:
- GET endpoint for run status
- GET endpoint for run results
- POST endpoint to retry failed chunks

`/api/dimensions/generate/route.ts`:
- POST endpoint to generate dimensions for chunks
- Handles batching and queueing
- Tracks API usage and costs

## 4. Database Integration
Create `/lib/db/chunks.ts`:
- Functions to create/read/update chunks
- Functions to manage dimension runs
- Functions to store dimension values
- Transaction support for consistency

## 5. State Management
Create `/stores/chunk-store.ts`:
- Zustand store for chunk state
- Current run tracking
- Processing status
- Selected chunks for view

## 6. Utility Functions
Create `/lib/utils/chunk-utils.ts`:
- Token counting
- Text overlap calculation
- Chunk ID generation
- Cost calculation helpers

## Implementation Details

For chunk extraction, use these detection patterns:

**Chapter Detection:**
- Regex: /^(Chapter|Section|Part|Stage)\s+\d+/i
- H1/H2 tags in HTML
- Lines with all caps
- Numbered sections (1., 1.1, etc.)

**Instructional Detection:**
- Keywords: "how to", "steps", "procedure", "instructions"
- Numbered/bulleted lists
- Imperative verbs at line start
- "Step 1:", "First,", "Next,", "Finally,"

**CER Detection:**
- Keywords: "because", "therefore", "evidence", "shows that"
- Citations patterns: [1], (Smith, 2024)
- Statistical data: percentages, numbers
- "Studies show", "Research indicates"

**Example Detection:**
- Keywords: "for example", "case study", "scenario"
- Dialogue patterns (quotes, Q&A)
- "Consider the case of"
- Story indicators: "Once", "A client"

For the background processing:
- Use Next.js API routes with long-running support
- Store job status in database
- Implement webhook for completion notification
- Use database transactions for atomic updates

For API integration with Claude:
- Use Anthropic SDK or fetch API
- Implement retry with exponential backoff
- Track tokens and calculate costs
- Store raw responses for debugging

Remember to:
- Maintain existing functionality
- Use TypeScript throughout
- Follow existing code patterns
- Add proper error handling
- Include loading states
- Update types as needed

Please implement all the files mentioned above with complete, production-ready code. Focus on robustness and scalability.
```

### PROMPT 2: AI Dimension Generation & Prompt System
*This prompt implements the AI integration for generating chunk dimensions*

**Instructions for Human:**
1. Ensure Prompt 1 is complete and tested
2. Copy this prompt into a NEW Claude conversation (200k context)
3. Provide the context of what was built in Prompt 1 if needed

```
You are continuing the build of the chunk dimension testing environment. The chunk extraction and processing infrastructure is complete. Now you will implement the AI dimension generation system.

# Context
We have:
- Chunk extraction working (4 types)
- Background job processor
- Database tables for dimensions
- API routes for chunk operations

We need to generate 60+ dimensions per chunk, organized into three categories:
1. Previously Generated (8 dims) - inherited from document
2. Mechanically Generated (17 dims) - calculated without AI  
3. AI Processing Required (35 dims) - needs LLM analysis

# Your Task
Build the AI dimension generation system including:
1. Prompt management system
2. AI API integration (Claude 3.5 Sonnet)
3. Dimension generation pipeline
4. Confidence scoring system
5. Cost tracking

# Requirements

## 1. Prompt Management System
Create `/lib/ai/prompt-manager.ts`:
- Load prompts from database or markdown files
- Variable substitution ({{doc_title}}, {{chunk_text}}, etc.)
- Group dimensions for efficient prompting:
  - Content Analysis (6 dims in 1 prompt)
  - Style Analysis (3 dims in 1 prompt)
  - Task Extraction (6 dims for Instructional)
  - CER Analysis (5 dims for CER chunks)
  - Scenario Analysis (4 dims for Examples)
  - Training Generation (3 dims)
  - Risk Assessment (6 dims)
  - Training Decisions (2 dims)
- JSON schema validation for responses

## 2. AI Service Integration
Create `/lib/ai/claude-service.ts`:
- Anthropic API client setup
- Message formatting for Claude
- Token counting before sending
- Cost calculation
- Response parsing and validation
- Error handling and retries
- Rate limiting

## 3. Dimension Generators
Create dimension generator modules:

`/lib/dimensions/mechanical-generator.ts`:
- Generate Chunk_ID (DOC_ID#C001 format)
- Calculate token counts
- Character positions
- Page numbers from text markers
- Generate chunk handles (slugs)
- Calculate overlaps

`/lib/dimensions/inherited-generator.ts`:
- Pull document metadata
- Inherit primary category
- Copy author, date, source info
- No AI needed

`/lib/dimensions/ai-generator.ts`:
- Main AI dimension generation
- Orchestrate multiple prompts
- Aggregate responses
- Handle "Unable to determine" cases
- Self-report confidence scores

## 4. Prompt Templates
Create `/lib/ai/prompts/templates.ts`:
Define template structures for each prompt group:

```typescript
export const CONTENT_ANALYSIS_PROMPT = {
  name: 'content_analysis',
  dimensions: ['chunk_summary_1s', 'key_terms', 'audience', 'intent', 'tone_voice_tags', 'brand_persona_tags', 'domain_tags'],
  template: `...`,
  schema: contentAnalysisSchema,
  estimatedTokens: 800
};
```

## 5. Confidence Scoring
Create `/lib/ai/confidence-scorer.ts`:
- Parse AI self-reported confidence
- Calculate precision confidence (1-10)
- Calculate accuracy confidence (1-10)
- Overall system confidence
- Identify low-confidence dimensions

## 6. Batch Processing Orchestrator
Create `/lib/processing/dimension-orchestrator.ts`:
- Process chunks in batches
- Coordinate mechanical, inherited, and AI generation
- Manage prompt sequencing
- Aggregate all dimension values
- Update database with results
- Track progress

## Implementation Details

For prompt grouping efficiency:
```typescript
// Group 1: Content Analysis (1 API call for 6 dimensions)
const contentDimensions = {
  chunk_summary_1s: "One sentence summary",
  key_terms: ["term1", "term2"],
  audience: "Target audience",
  intent: "instruct",
  tone_voice_tags: ["professional", "clear"],
  brand_persona_tags: ["expert", "helpful"],
  domain_tags: ["AI", "Training"]
};

// Include confidence for each
const contentWithConfidence = {
  ...contentDimensions,
  _confidence: {
    chunk_summary_1s: 9,
    key_terms: 8,
    audience: 7,
    // etc.
  }
};
```

For JSON contract format with Claude:
```typescript
const message = {
  role: "user",
  content: [
    {
      type: "text",
      text: promptText
    },
    {
      type: "text", 
      text: "Respond with valid JSON matching this schema:\n" + JSON.stringify(schema)
    }
  ]
};
```

For confidence scoring:
- Ask AI to include confidence (1-10) for each dimension
- Track which dimensions often get low confidence
- Flag dimensions marked "Unable to determine"
- Calculate aggregate confidence per chunk

For cost tracking:
```typescript
const calculateCost = (inputTokens: number, outputTokens: number) => {
  const inputCost = (inputTokens / 1000) * COST_PER_1K_INPUT;
  const outputCost = (outputTokens / 1000) * COST_PER_1K_OUTPUT;
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    tokens: { input: inputTokens, output: outputTokens }
  };
};
```

Remember to:
- Validate all AI responses against schema
- Handle partial failures gracefully
- Store raw AI responses for debugging
- Update run statistics after processing
- Implement proper TypeScript types
- Use transactions for database updates

Please implement all the files mentioned above with complete, production-ready code.
```

### PROMPT 3: Spreadsheet Interface & Dashboard
*This prompt builds the user interface for viewing and managing chunk dimensions*

**Instructions for Human:**
1. Ensure Prompts 1 and 2 are complete
2. Copy this prompt into a NEW Claude conversation (200k context)
3. This completes the module with the UI layer

```
You are completing the chunk dimension testing environment by building the spreadsheet interface and dashboard components.

# Context
We have completed:
- Chunk extraction engine (Prompt 1)
- AI dimension generation (Prompt 2)
- Background processing system
- Database with all dimension data

Now we need the user interface to:
- Show chunk dashboard after categorization
- Display spreadsheet view of all dimensions
- Enable regeneration and run comparison
- Show high/low confidence dimensions

# Your Task
Build the complete user interface including:
1. Chunk dashboard page
2. Spreadsheet view component
3. Run comparison interface
4. Progress tracking UI
5. Navigation updates

# Requirements

## 1. Update Document Dashboard
Modify `/app/(dashboard)/dashboard/page.tsx`:
- Add "Chunks" button below "Start Categorization" for completed documents
- Show button only after categorization is complete
- Link to chunk dashboard for that document

## 2. Create Chunk Dashboard
Create `/app/(dashboard)/chunks/[documentId]/page.tsx`:
- Display document title and metadata
- Show list of extracted chunks with cards
- For each chunk card show:
  - Chunk type and ID
  - Summary (chunk_summary_1s)
  - "Things we know" - 3 high confidence dimensions (≥8)
  - "Things we don't know" - 3 low confidence dimensions (<5)
  - Token count and estimated cost
  - "View Details" button → spreadsheet view
  - "Regenerate" button
- Add "Extract Chunks" button if no chunks exist
- Show processing status during extraction

## 3. Create Spreadsheet View
Create `/components/chunks/spreadsheet-view.tsx`:
- Display ALL 60+ dimensions as columns
- Horizontal scrolling for many columns
- Sticky first column (chunk_id)
- Sortable columns (click header to sort)
- Color coding for confidence levels:
  - Green: confidence ≥ 8
  - Yellow: confidence 5-7
  - Red: confidence < 5
  - Gray: "Unable to determine"
- Preset view selector (Quality, Cost, Confidence)
- Dense layout (minimal padding)

## 4. Create Run Selector
Create `/components/chunks/run-selector.tsx`:
- Dropdown to select historical runs
- Shows run name and timestamp
- Displays run statistics:
  - Average confidence
  - Total cost
  - Processing time
  - Completion status
- "Compare Runs" mode (side-by-side)

## 5. Progress Tracking Component
Create `/components/chunks/processing-status.tsx`:
- Real-time progress during chunk extraction
- Show current chunk being processed
- Progress bar (X of Y chunks)
- Estimated time remaining
- Cancel button
- Error display with retry option

## 6. Chunk Details Panel
Create `/components/chunks/chunk-details-panel.tsx`:
- Slide-out panel with full chunk text
- All dimension values in organized sections
- Confidence indicators for each dimension
- "Copy as JSON" button
- "Export to CSV" button
- Regenerate specific chunk button

## 7. Update Navigation
Modify `/app/(dashboard)/layout.tsx`:
- Add "Chunks" section to sidebar
- Show count of documents with chunks
- Quick access to recent runs

## Implementation Details

For the spreadsheet component:
```tsx
// Preset views configuration
const PRESET_VIEWS = {
  quality: {
    name: "Quality View",
    columns: ['chunk_id', 'chunk_type', 'chunk_summary_1s', 'system_confidence', 'precision_confidence', 'accuracy_confidence', 'review_status']
  },
  cost: {
    name: "Cost View", 
    columns: ['chunk_id', 'token_count', 'generation_cost', 'ai_engineering_type', 'processing_time_seconds']
  },
  confidence: {
    name: "Confidence View",
    columns: ['chunk_id', 'system_confidence', 'precision_confidence', 'accuracy_confidence', 'coverage_tag', 'novelty_tag']
  }
};

// Virtualized scrolling for performance
const VirtualizedSpreadsheet = () => {
  // Use react-window or tanstack-virtual for large datasets
  // Render only visible cells
  // Maintain smooth scrolling
};
```

For the chunk dashboard cards:
```tsx
// Auto-select high/low confidence dimensions
const getHighConfidenceDims = (dimensions: ChunkDimensions) => {
  return Object.entries(dimensions)
    .filter(([key, value]) => value.confidence >= 8)
    .sort((a, b) => b[1].confidence - a[1].confidence)
    .slice(0, 3)
    .map(([key, value]) => ({
      name: formatDimensionName(key),
      value: truncate(value.value, 50),
      confidence: value.confidence
    }));
};
```

For real-time progress updates:
```tsx
// Use Server-Sent Events or polling
useEffect(() => {
  const eventSource = new EventSource(`/api/runs/${runId}/progress`);
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setProgress(data);
  };
  return () => eventSource.close();
}, [runId]);
```

For the spreadsheet styling:
```css
/* Dense spreadsheet layout */
.spreadsheet-cell {
  padding: 4px 8px;
  font-size: 12px;
  border-right: 1px solid #e5e5e5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.confidence-high { background-color: #dcfce7; }
.confidence-medium { background-color: #fef9c3; }
.confidence-low { background-color: #fee2e2; }
.unable-to-determine { background-color: #f3f4f6; color: #6b7280; }
```

For run comparison view:
```tsx
// Side-by-side comparison
const ComparisonView = ({ run1, run2 }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SpreadsheetView data={run1} />
      <SpreadsheetView data={run2} />
      {/* Highlight differences */}
    </div>
  );
};
```

## Pages to Create/Update

1. `/app/(dashboard)/dashboard/page.tsx` - Add Chunks button
2. `/app/(dashboard)/chunks/[documentId]/page.tsx` - Chunk dashboard
3. `/app/(dashboard)/chunks/[documentId]/[chunkId]/page.tsx` - Chunk details
4. `/app/(dashboard)/chunks/[documentId]/runs/page.tsx` - Run history
5. `/app/(dashboard)/chunks/[documentId]/compare/page.tsx` - Run comparison

## Components to Create

1. `/components/chunks/spreadsheet-view.tsx`
2. `/components/chunks/chunk-card.tsx`
3. `/components/chunks/run-selector.tsx`
4. `/components/chunks/processing-status.tsx`
5. `/components/chunks/chunk-details-panel.tsx`
6. `/components/chunks/dimension-cell.tsx`
7. `/components/chunks/preset-view-selector.tsx`

Remember to:
- Use existing shadcn/ui components
- Maintain consistent styling
- Add loading states
- Include error boundaries
- Make responsive for mobile
- Use React Server Components where appropriate
- Implement proper TypeScript types

Please implement all the UI components and pages mentioned above with complete, production-ready code.
```

---

## SECTION C: Post-Implementation Tasks

### Manual Tasks After Build Completion

**For Human to Complete:**

1. **Test Chunk Extraction:**
   - Select a test document that has completed categorization
   - Click "Chunks" button
   - Verify chunks are extracted correctly
   - Check database for chunk records

2. **Test Dimension Generation:**
   - Wait for background processing to complete
   - Verify all dimensions are populated
   - Check confidence scores are reasonable
   - Verify cost tracking is accurate

3. **Test Spreadsheet View:**
   - Navigate to chunk details
   - Test sorting functionality
   - Test preset views
   - Verify color coding works

4. **Test Regeneration:**
   - Click regenerate on a chunk
   - Verify new run is created
   - Compare old vs new results

5. **Update Prompt Templates:**
   - Edit markdown files in `/prompts/` folder
   - Test with different prompt styles
   - Monitor confidence improvements

### Monitoring & Optimization

1. **Monitor API Costs:**
   - Check total costs per document
   - Optimize batch sizes if needed
   - Adjust retry logic if excessive

2. **Performance Tuning:**
   - Monitor processing times
   - Adjust batch sizes in `.env.local`
   - Optimize database queries if slow

3. **Quality Assessment:**
   - Review low confidence dimensions
   - Identify patterns in failures
   - Refine prompts based on results

---

## Summary

This specification provides a complete implementation plan for the chunk dimension testing environment with:

1. **Comprehensive database schema** supporting all requirements
2. **Three focused build prompts** that:
   - Prompt 1: Builds core infrastructure (extraction, processing, APIs)
   - Prompt 2: Implements AI dimension generation
   - Prompt 3: Creates the complete UI/dashboard
3. **Clear separation of concerns** to avoid context conflicts
4. **All 60+ dimensions** supported with proper categorization
5. **Efficient prompt grouping** reducing API calls from 35 to 5-8 per chunk
6. **Complete testing and monitoring** instructions

The modular approach ensures each prompt can be executed independently while building toward the complete system. The human operator can execute these in sequence with clear checkpoints between each phase.

**Estimated Timeline:**
- Section A (Database Setup): 30 minutes
- Prompt 1 (Infrastructure): 2-3 hours development + testing
- Prompt 2 (AI Integration): 2-3 hours development + testing  
- Prompt 3 (UI/Dashboard): 2-3 hours development + testing
- Section C (Testing): 1-2 hours

**Total: 8-12 hours of focused development**
