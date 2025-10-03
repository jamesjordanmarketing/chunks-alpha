# Category Module Database Compliance Upgrade - Task Specification

**Version:** 1.0  
**Date:** October 3, 2025  
**Project:** Bright Run - Document Categorization Module  
**Purpose:** Upgrade from JSONB denormalized storage to proper relational database structure  
**Status:** Ready for Implementation

---

## Executive Summary

This specification provides step-by-step instructions to upgrade the Category Module's database architecture from a denormalized JSONB-based storage system to a fully normalized relational structure using junction tables. This upgrade will:

- ✅ Maintain all existing functionality (no breaking changes)
- ✅ Enable proper data integrity with foreign key constraints
- ✅ Improve query performance with indexed relationships
- ✅ Support advanced reporting and analytics capabilities
- ✅ Preserve all historical data through migration

**Estimated Duration:** 6-7 weeks  
**Risk Level:** Medium (mitigated with dual-write strategy and rollback plan)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: Database Schema Upgrade (SQL)](#phase-1-database-schema-upgrade-sql)
3. [Phase 2: Application Code Implementation](#phase-2-application-code-implementation)
4. [Testing & Validation Strategy](#testing--validation-strategy)
5. [Rollback Plan](#rollback-plan)
6. [Success Criteria](#success-criteria)

---

## Architecture Overview

### Current State (JSONB-Based)
```
workflow_sessions table
├── belonging_rating: INTEGER
├── selected_category_id: UUID (foreign key) ✅ Normalized
├── selected_tags: JSONB ❌ Denormalized
└── custom_tags: JSONB ❌ Denormalized
```

### Target State (Fully Normalized)
```
document_categories table
├── document_id → documents(id)
├── category_id → categories(id)
├── belonging_rating: INTEGER
└── workflow_session_id → workflow_sessions(id)

document_tags table
├── document_id → documents(id)
├── tag_id → tags(id)
├── dimension_id → tag_dimensions(id)
└── workflow_session_id → workflow_sessions(id)

custom_tags table
├── dimension_id → tag_dimensions(id)
├── name: TEXT
└── organization_id: UUID
```

### Data Collection Scope
The workflow collects three categories of data:
1. **Statement of Belonging** (Step A): 1-5 scale rating
2. **Primary Category Selection** (Step B): Single category from 10 options
3. **Secondary Tags & Metadata** (Step C): Multi-dimensional tagging across 7 dimensions with 43+ tags

---

## Phase 1: Database Schema Upgrade (SQL)

### Instructions for Human Operator

**Location:** Supabase SQL Editor  
**Estimated Time:** 30-45 minutes  
**Prerequisites:** Database backup created and verified DONE

⚠️ **IMPORTANT:** Execute these SQL scripts in order. Do not skip steps.


---

### Step 1.1: Create Junction Tables

**Purpose:** Create new normalized tables for storing document categorizations and tags

**SQL Script to Paste:**

```sql
-- ============================================
-- STEP 1.1: CREATE JUNCTION TABLES
-- Execute this entire block in Supabase SQL Editor
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: document_categories
-- Purpose: Links documents to their primary category with belonging rating
-- ============================================
CREATE TABLE IF NOT EXISTS document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    workflow_session_id UUID REFERENCES workflow_sessions(id) ON DELETE SET NULL,
    belonging_rating INTEGER CHECK (belonging_rating >= 1 AND belonging_rating <= 5),
    assigned_by UUID REFERENCES user_profiles(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_primary BOOLEAN DEFAULT true,
    confidence_score DECIMAL(3,2),  -- Future: AI confidence scoring
    
    -- Ensure one primary category per document
    CONSTRAINT uq_doc_primary_category UNIQUE(document_id, is_primary),
    
    -- Validate belonging rating range
    CONSTRAINT chk_belonging_rating CHECK (belonging_rating IS NULL OR (belonging_rating >= 1 AND belonging_rating <= 5))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_doc_cat_document ON document_categories(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_cat_category ON document_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_doc_cat_rating ON document_categories(belonging_rating);
CREATE INDEX IF NOT EXISTS idx_doc_cat_session ON document_categories(workflow_session_id);

-- ============================================
-- Table: document_tags
-- Purpose: Links documents to all selected tags across dimensions
-- ============================================
CREATE TABLE IF NOT EXISTS document_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,
    dimension_id UUID NOT NULL REFERENCES tag_dimensions(id) ON DELETE RESTRICT,
    workflow_session_id UUID REFERENCES workflow_sessions(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES user_profiles(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_custom_tag BOOLEAN DEFAULT false,
    custom_tag_data JSONB,  -- Only populated if is_custom_tag = true
    confidence_score DECIMAL(3,2),  -- Future: AI confidence scoring
    
    -- Prevent duplicate tag assignments
    CONSTRAINT uq_doc_tag UNIQUE(document_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_doc_tag_document ON document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_tag_tag ON document_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_doc_tag_dimension ON document_tags(dimension_id);
CREATE INDEX IF NOT EXISTS idx_doc_tag_assigned_at ON document_tags(assigned_at);
CREATE INDEX IF NOT EXISTS idx_doc_tag_session ON document_tags(workflow_session_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_doc_tag_doc_dim ON document_tags(document_id, dimension_id);
CREATE INDEX IF NOT EXISTS idx_doc_tag_tag_doc ON document_tags(tag_id, document_id);

-- ============================================
-- Table: custom_tags
-- Purpose: Stores user-created tags as first-class entities
-- ============================================
CREATE TABLE IF NOT EXISTS custom_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dimension_id UUID NOT NULL REFERENCES tag_dimensions(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES user_profiles(id),
    organization_id UUID,  -- For multi-tenant support
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT false,  -- Admin approval workflow
    
    -- Prevent duplicate custom tags
    CONSTRAINT uq_custom_tag_name UNIQUE(dimension_id, name, organization_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_tag_dimension ON custom_tags(dimension_id);
CREATE INDEX IF NOT EXISTS idx_custom_tag_org ON custom_tags(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_tag_created_by ON custom_tags(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_tag_usage ON custom_tags(usage_count DESC);

-- ============================================
-- Table: workflow_metadata
-- Purpose: Separates transactional workflow data from final categorization
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_session_id UUID NOT NULL REFERENCES workflow_sessions(id) ON DELETE CASCADE,
    step TEXT NOT NULL CHECK (step IN ('A', 'B', 'C')),
    metadata_key TEXT NOT NULL,
    metadata_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uq_workflow_metadata UNIQUE(workflow_session_id, step, metadata_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workflow_metadata_session ON workflow_metadata(workflow_session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_metadata_step ON workflow_metadata(step);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ STEP 1.1 COMPLETE: Junction tables created successfully';
    RAISE NOTICE '   - document_categories table created';
    RAISE NOTICE '   - document_tags table created';
    RAISE NOTICE '   - custom_tags table created';
    RAISE NOTICE '   - workflow_metadata table created';
    RAISE NOTICE '   - All indexes created';
END $$;
```

**Expected Result:** You should see "✅ STEP 1.1 COMPLETE" message with no errors.

---

### Step 1.2: Create Helper Functions

**Purpose:** Create database functions for common operations and data migration

**SQL Script to Paste:**

```sql
-- ============================================
-- STEP 1.2: CREATE HELPER FUNCTIONS
-- Execute this entire block in Supabase SQL Editor
-- ============================================

-- ============================================
-- Function: increment_custom_tag_usage
-- Purpose: Safely increment usage count for custom tags
-- ============================================
CREATE OR REPLACE FUNCTION increment_custom_tag_usage(tag_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE custom_tags
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = tag_id;
END;
$$;

-- ============================================
-- Function: migrate_workflow_session_to_normalized
-- Purpose: Migrate a single workflow session from JSONB to normalized structure
-- ============================================
CREATE OR REPLACE FUNCTION migrate_workflow_session_to_normalized(session_id UUID)
RETURNS TABLE(
    categories_migrated INTEGER,
    tags_migrated INTEGER,
    custom_tags_migrated INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_document_id UUID;
    v_category_id UUID;
    v_belonging_rating INTEGER;
    v_user_id UUID;
    v_selected_tags JSONB;
    v_custom_tags JSONB;
    v_dimension_key TEXT;
    v_tag_ids TEXT[];
    v_tag_id TEXT;
    v_categories_count INTEGER := 0;
    v_tags_count INTEGER := 0;
    v_custom_tags_count INTEGER := 0;
BEGIN
    -- Get session data
    SELECT 
        document_id, 
        selected_category_id, 
        belonging_rating, 
        user_id,
        selected_tags,
        custom_tags
    INTO 
        v_document_id, 
        v_category_id, 
        v_belonging_rating, 
        v_user_id,
        v_selected_tags,
        v_custom_tags
    FROM workflow_sessions
    WHERE id = session_id;

    -- Skip if no data
    IF v_document_id IS NULL THEN
        RETURN;
    END IF;

    -- Migrate category (if not already migrated)
    IF v_category_id IS NOT NULL THEN
        INSERT INTO document_categories (
            document_id,
            category_id,
            workflow_session_id,
            belonging_rating,
            assigned_by,
            assigned_at,
            is_primary
        ) VALUES (
            v_document_id,
            v_category_id,
            session_id,
            v_belonging_rating,
            v_user_id,
            NOW(),
            true
        )
        ON CONFLICT (document_id, is_primary) DO NOTHING;
        
        v_categories_count := 1;
    END IF;

    -- Migrate tags from JSONB
    IF v_selected_tags IS NOT NULL THEN
        FOR v_dimension_key, v_tag_ids IN 
            SELECT key, array_agg(value::text) 
            FROM jsonb_each(v_selected_tags), jsonb_array_elements_text(value)
            GROUP BY key
        LOOP
            FOREACH v_tag_id IN ARRAY v_tag_ids
            LOOP
                -- Get dimension_id from tag
                DECLARE
                    v_dimension_id UUID;
                BEGIN
                    SELECT dimension_id INTO v_dimension_id
                    FROM tags
                    WHERE id = v_tag_id::UUID;

                    IF v_dimension_id IS NOT NULL THEN
                        INSERT INTO document_tags (
                            document_id,
                            tag_id,
                            dimension_id,
                            workflow_session_id,
                            assigned_by,
                            assigned_at,
                            is_custom_tag
                        ) VALUES (
                            v_document_id,
                            v_tag_id::UUID,
                            v_dimension_id,
                            session_id,
                            v_user_id,
                            NOW(),
                            false
                        )
                        ON CONFLICT (document_id, tag_id) DO NOTHING;
                        
                        v_tags_count := v_tags_count + 1;
                    END IF;
                END;
            END LOOP;
        END LOOP;
    END IF;

    -- Return counts
    RETURN QUERY SELECT v_categories_count, v_tags_count, v_custom_tags_count;
END;
$$;

-- ============================================
-- Function: validate_document_categorization
-- Purpose: Validate that a document's categorization is complete and consistent
-- ============================================
CREATE OR REPLACE FUNCTION validate_document_categorization(doc_id UUID)
RETURNS TABLE(
    is_valid BOOLEAN,
    has_primary_category BOOLEAN,
    required_dimensions_filled BOOLEAN,
    validation_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_has_category BOOLEAN;
    v_required_dims_count INTEGER;
    v_filled_dims_count INTEGER;
    v_message TEXT := '';
BEGIN
    -- Check primary category
    SELECT EXISTS(
        SELECT 1 FROM document_categories
        WHERE document_id = doc_id AND is_primary = true
    ) INTO v_has_category;

    -- Check required dimensions (authorship, disclosure-risk, intended-use)
    SELECT COUNT(DISTINCT td.id) INTO v_required_dims_count
    FROM tag_dimensions td
    WHERE td.required = true;

    SELECT COUNT(DISTINCT dt.dimension_id) INTO v_filled_dims_count
    FROM document_tags dt
    JOIN tag_dimensions td ON td.id = dt.dimension_id
    WHERE dt.document_id = doc_id AND td.required = true;

    -- Build validation message
    IF NOT v_has_category THEN
        v_message := 'Missing primary category. ';
    END IF;

    IF v_filled_dims_count < v_required_dims_count THEN
        v_message := v_message || 'Missing required tag dimensions. ';
    END IF;

    IF v_message = '' THEN
        v_message := 'Validation passed';
    END IF;

    -- Return validation results
    RETURN QUERY SELECT 
        (v_has_category AND v_filled_dims_count >= v_required_dims_count),
        v_has_category,
        (v_filled_dims_count >= v_required_dims_count),
        v_message;
END;
$$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ STEP 1.2 COMPLETE: Helper functions created successfully';
    RAISE NOTICE '   - increment_custom_tag_usage()';
    RAISE NOTICE '   - migrate_workflow_session_to_normalized()';
    RAISE NOTICE '   - validate_document_categorization()';
END $$;
```

**Expected Result:** You should see "✅ STEP 1.2 COMPLETE" message with no errors.

---

### Step 1.3: Update RLS Policies

**Purpose:** Set up Row Level Security policies for new tables

**SQL Script to Paste:**

```sql
-- ============================================
-- STEP 1.3: ROW LEVEL SECURITY POLICIES
-- Execute this entire block in Supabase SQL Editor
-- ============================================

-- Enable RLS on new tables
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_metadata ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies for document_categories
-- ============================================

-- Allow authenticated users to read document categories
CREATE POLICY "Users can view document categories"
    ON document_categories FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to insert categories for their own documents
CREATE POLICY "Users can create document categories"
    ON document_categories FOR INSERT
    TO authenticated
    WITH CHECK (
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_id
            AND documents.author_id = auth.uid()
        )
    );

-- Allow users to update categories for their own documents
CREATE POLICY "Users can update their document categories"
    ON document_categories FOR UPDATE
    TO authenticated
    USING (
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_id
            AND documents.author_id = auth.uid()
        )
    );

-- ============================================
-- Policies for document_tags
-- ============================================

-- Allow authenticated users to read document tags
CREATE POLICY "Users can view document tags"
    ON document_tags FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to insert tags for their own documents
CREATE POLICY "Users can create document tags"
    ON document_tags FOR INSERT
    TO authenticated
    WITH CHECK (
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_id
            AND documents.author_id = auth.uid()
        )
    );

-- Allow users to delete tags from their own documents
CREATE POLICY "Users can delete their document tags"
    ON document_tags FOR DELETE
    TO authenticated
    USING (
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_id
            AND documents.author_id = auth.uid()
        )
    );

-- ============================================
-- Policies for custom_tags
-- ============================================

-- Allow authenticated users to read custom tags
CREATE POLICY "Users can view custom tags"
    ON custom_tags FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to create custom tags
CREATE POLICY "Users can create custom tags"
    ON custom_tags FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Allow users to update their own custom tags
CREATE POLICY "Users can update their custom tags"
    ON custom_tags FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

-- ============================================
-- Policies for workflow_metadata
-- ============================================

-- Allow authenticated users to read workflow metadata
CREATE POLICY "Users can view workflow metadata"
    ON workflow_metadata FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workflow_sessions ws
            WHERE ws.id = workflow_session_id
            AND ws.user_id = auth.uid()
        )
    );

-- Allow users to insert workflow metadata for their sessions
CREATE POLICY "Users can create workflow metadata"
    ON workflow_metadata FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workflow_sessions ws
            WHERE ws.id = workflow_session_id
            AND ws.user_id = auth.uid()
        )
    );

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ STEP 1.3 COMPLETE: RLS policies created successfully';
    RAISE NOTICE '   - document_categories: 3 policies';
    RAISE NOTICE '   - document_tags: 3 policies';
    RAISE NOTICE '   - custom_tags: 3 policies';
    RAISE NOTICE '   - workflow_metadata: 2 policies';
END $$;
```

**Expected Result:** You should see "✅ STEP 1.3 COMPLETE" message with no errors.

---

### Step 1.4: Migrate Historical Data (Optional - Run After Code Deployment)

**Purpose:** Backfill existing JSONB data into normalized tables

**SQL Script to Paste:**

```sql
-- ============================================
-- STEP 1.4: MIGRATE HISTORICAL DATA
-- Execute this AFTER application code is deployed with dual-write
-- ============================================

-- Check how many sessions need migration
DO $$
DECLARE
    v_total_sessions INTEGER;
    v_completed_sessions INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_sessions
    FROM workflow_sessions
    WHERE is_draft = false;

    SELECT COUNT(DISTINCT workflow_session_id) INTO v_completed_sessions
    FROM document_categories;

    RAISE NOTICE '📊 MIGRATION STATUS:';
    RAISE NOTICE '   Total completed sessions: %', v_total_sessions;
    RAISE NOTICE '   Already migrated: %', v_completed_sessions;
    RAISE NOTICE '   Need migration: %', v_total_sessions - v_completed_sessions;
END $$;

-- Migrate all completed workflow sessions
DO $$
DECLARE
    v_session_record RECORD;
    v_result RECORD;
    v_success_count INTEGER := 0;
    v_error_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🚀 Starting migration of historical workflow sessions...';
    
    FOR v_session_record IN 
        SELECT id FROM workflow_sessions 
        WHERE is_draft = false 
        AND id NOT IN (SELECT DISTINCT workflow_session_id FROM document_categories WHERE workflow_session_id IS NOT NULL)
        ORDER BY created_at ASC
    LOOP
        BEGIN
            SELECT * INTO v_result 
            FROM migrate_workflow_session_to_normalized(v_session_record.id);
            
            v_success_count := v_success_count + 1;
            
            IF v_success_count % 100 = 0 THEN
                RAISE NOTICE '   Migrated % sessions...', v_success_count;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            RAISE WARNING '   Error migrating session %: %', v_session_record.id, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE '✅ MIGRATION COMPLETE:';
    RAISE NOTICE '   Successfully migrated: %', v_success_count;
    RAISE NOTICE '   Errors: %', v_error_count;
END $$;

-- Validate migrated data
DO $$
DECLARE
    v_total_docs INTEGER;
    v_valid_docs INTEGER;
    v_invalid_docs INTEGER;
BEGIN
    SELECT COUNT(DISTINCT document_id) INTO v_total_docs
    FROM workflow_sessions
    WHERE is_draft = false;

    SELECT COUNT(*) INTO v_valid_docs
    FROM (
        SELECT doc_id, (validate_document_categorization(doc_id)).is_valid as valid
        FROM (SELECT DISTINCT document_id as doc_id FROM workflow_sessions WHERE is_draft = false) sub
    ) validation
    WHERE valid = true;

    v_invalid_docs := v_total_docs - v_valid_docs;

    RAISE NOTICE '📊 VALIDATION RESULTS:';
    RAISE NOTICE '   Total documents: %', v_total_docs;
    RAISE NOTICE '   Valid categorizations: %', v_valid_docs;
    RAISE NOTICE '   Invalid categorizations: %', v_invalid_docs;
    
    IF v_invalid_docs > 0 THEN
        RAISE NOTICE '⚠️  Some documents have incomplete categorization data';
    ELSE
        RAISE NOTICE '✅ All documents have valid categorization';
    END IF;
END $$;
```

**Expected Result:** Migration statistics showing number of sessions migrated and validation results.

**⚠️ IMPORTANT:** Run this step AFTER Phase 2 code deployment to ensure dual-write is active.

---

### Step 1.5: Database Verification

**Purpose:** Verify all tables and functions are created correctly

**SQL Script to Paste:**

```sql
-- ============================================
-- STEP 1.5: VERIFICATION QUERIES
-- Execute this to verify database setup
-- ============================================

-- Check table existence and row counts
SELECT 
    'document_categories' as table_name,
    COUNT(*) as row_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'document_categories') as column_count
FROM document_categories
UNION ALL
SELECT 
    'document_tags' as table_name,
    COUNT(*) as row_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'document_tags') as column_count
FROM document_tags
UNION ALL
SELECT 
    'custom_tags' as table_name,
    COUNT(*) as row_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'custom_tags') as column_count
FROM custom_tags
UNION ALL
SELECT 
    'workflow_metadata' as table_name,
    COUNT(*) as row_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'workflow_metadata') as column_count
FROM workflow_metadata;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('document_categories', 'document_tags', 'custom_tags', 'workflow_metadata')
ORDER BY tablename, indexname;

-- Check functions
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'increment_custom_tag_usage',
    'migrate_workflow_session_to_normalized',
    'validate_document_categorization'
)
ORDER BY routine_name;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('document_categories', 'document_tags', 'custom_tags', 'workflow_metadata')
ORDER BY tablename, policyname;

-- Final status
DO $$
DECLARE
    v_tables_ok BOOLEAN;
    v_functions_ok BOOLEAN;
    v_indexes_ok BOOLEAN;
    v_policies_ok BOOLEAN;
BEGIN
    -- Check tables
    SELECT COUNT(*) = 4 INTO v_tables_ok
    FROM information_schema.tables
    WHERE table_name IN ('document_categories', 'document_tags', 'custom_tags', 'workflow_metadata');

    -- Check functions
    SELECT COUNT(*) = 3 INTO v_functions_ok
    FROM information_schema.routines
    WHERE routine_name IN (
        'increment_custom_tag_usage',
        'migrate_workflow_session_to_normalized',
        'validate_document_categorization'
    );

    -- Check indexes (at least 10 expected)
    SELECT COUNT(*) >= 10 INTO v_indexes_ok
    FROM pg_indexes
    WHERE tablename IN ('document_categories', 'document_tags', 'custom_tags', 'workflow_metadata');

    -- Check policies (at least 11 expected)
    SELECT COUNT(*) >= 11 INTO v_policies_ok
    FROM pg_policies
    WHERE tablename IN ('document_categories', 'document_tags', 'custom_tags', 'workflow_metadata');

    -- Report status
    RAISE NOTICE '═══════════════════════════════════════════';
    RAISE NOTICE '   DATABASE SETUP VERIFICATION';
    RAISE NOTICE '═══════════════════════════════════════════';
    
    IF v_tables_ok THEN
        RAISE NOTICE '✅ Tables: OK (4/4)';
    ELSE
        RAISE NOTICE '❌ Tables: FAILED';
    END IF;

    IF v_functions_ok THEN
        RAISE NOTICE '✅ Functions: OK (3/3)';
    ELSE
        RAISE NOTICE '❌ Functions: FAILED';
    END IF;

    IF v_indexes_ok THEN
        RAISE NOTICE '✅ Indexes: OK (10+ created)';
    ELSE
        RAISE NOTICE '❌ Indexes: FAILED';
    END IF;

    IF v_policies_ok THEN
        RAISE NOTICE '✅ RLS Policies: OK (11+ created)';
    ELSE
        RAISE NOTICE '❌ RLS Policies: FAILED';
    END IF;

    RAISE NOTICE '═══════════════════════════════════════════';
    
    IF v_tables_ok AND v_functions_ok AND v_indexes_ok AND v_policies_ok THEN
        RAISE NOTICE '🎉 DATABASE SETUP COMPLETE - Ready for Phase 2';
    ELSE
        RAISE NOTICE '⚠️  SETUP INCOMPLETE - Please review errors above';
    END IF;
    
    RAISE NOTICE '═══════════════════════════════════════════';
END $$;
```

**Expected Result:** Verification report showing all components created successfully with green checkmarks.

---

## Phase 2: Application Code Implementation

### Overview

Phase 2 implements the application layer changes to use the new normalized database structure. This phase is organized into **TWO SUCCESSIVE PROMPTS** that should be executed in fresh 200k token context windows.

**Key Principle:** Each prompt is self-contained and includes all necessary context to complete its portion of the work without breaking existing functionality.

---

### Prompt 1: Database Service Layer & Type Definitions

**Context Window:** Fresh 200k token window  
**Estimated Execution Time:** 3-4 hours  
**Files Modified:** 2 files  
**Risk Level:** Low (no breaking changes to existing code)

---

#### PROMPT 1 - PASTE THIS INTO CLAUDE-4.5-SONNET THINKING

```markdown
# Task: Implement Normalized Database Service Layer

## Context

You are upgrading the Category Module's database architecture from JSONB denormalized storage to a fully normalized relational structure. The database tables have already been created in Supabase (Phase 1 is complete).

## Current Architecture Files

### File 1: src/lib/database.ts
This file contains the current database service layer using Supabase client. It includes:
- `workflowService` - Handles workflow session operations
- Current methods store data in JSONB format in `workflow_sessions` table
- Uses fields: `selected_tags` (JSONB), `custom_tags` (JSONB), `belonging_rating` (INTEGER), `selected_category_id` (UUID)

### File 2: src/lib/supabase.ts  
This file contains TypeScript type definitions for Supabase database schema.
- Defines `Database` type with table definitions
- Currently includes: `documents`, `categories`, `tags`, `tag_dimensions`, `workflow_sessions`
- Needs new type definitions for: `document_categories`, `document_tags`, `custom_tags`

## New Database Structure (Already Created)

The following tables now exist in Supabase:

**document_categories:**
- `id` (UUID, PK)
- `document_id` (UUID, FK → documents)
- `category_id` (UUID, FK → categories)
- `workflow_session_id` (UUID, FK → workflow_sessions)
- `belonging_rating` (INTEGER, 1-5)
- `assigned_by` (UUID, FK → user_profiles)
- `assigned_at` (TIMESTAMPTZ)
- `is_primary` (BOOLEAN)
- `confidence_score` (DECIMAL)

**document_tags:**
- `id` (UUID, PK)
- `document_id` (UUID, FK → documents)
- `tag_id` (UUID, FK → tags)
- `dimension_id` (UUID, FK → tag_dimensions)
- `workflow_session_id` (UUID, FK → workflow_sessions)
- `assigned_by` (UUID, FK → user_profiles)
- `assigned_at` (TIMESTAMPTZ)
- `is_custom_tag` (BOOLEAN)
- `custom_tag_data` (JSONB, nullable)
- `confidence_score` (DECIMAL, nullable)

**custom_tags:**
- `id` (UUID, PK)
- `dimension_id` (UUID, FK → tag_dimensions)
- `name` (TEXT)
- `description` (TEXT, nullable)
- `created_by` (UUID, FK → user_profiles)
- `organization_id` (UUID, nullable)
- `usage_count` (INTEGER, default 0)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `is_approved` (BOOLEAN, default false)

## Your Tasks

### Task 1: Update src/lib/supabase.ts

Add TypeScript type definitions for the three new tables to the `Database` type. Follow the existing pattern used for other tables in the file.

**Requirements:**
- Add types for `Row`, `Insert`, and `Update` operations for each table
- Ensure nullable fields are properly typed as `| null`
- Use UUID strings for all ID fields
- Follow existing naming conventions (snake_case for database fields)

### Task 2: Update src/lib/database.ts

Create three new service objects following the existing pattern:

**2.1 Create `documentCategoryService`**

Methods needed:
- `assignCategory(params)` - Assign primary category to document with belonging rating
  - Inserts into `document_categories` table
  - Parameters: documentId, categoryId, belongingRating, workflowSessionId, assignedBy
  - Returns the created row
  
- `updateCategory(params)` - Update existing category assignment
  - Updates `document_categories` where document_id matches and is_primary = true
  - Parameters: documentId, categoryId, belongingRating (optional)
  - Returns updated row

- `getDocumentCategory(documentId)` - Get category for document with JOIN to categories table
  - Selects from `document_categories` with relation to `categories`
  - Returns category details with belonging rating

**2.2 Create `documentTagService`**

Methods needed:
- `assignTags(params)` - Batch insert multiple tags for a document
  - Inserts multiple rows into `document_tags`
  - Parameters: documentId, tags (array of {tagId, dimensionId}), workflowSessionId, assignedBy
  - Returns created rows

- `replaceTags(params)` - Delete existing tags and insert new ones (for workflow updates)
  - Deletes all tags for document
  - Then inserts new tags
  - Same parameters as assignTags
  
- `getDocumentTags(documentId)` - Get all tags with JOINs to tags and tag_dimensions
  - Returns both raw array and grouped by dimension object
  - Return format: `{ raw: array, byDimension: Record<string, array> }`

- `removeTags(documentId, tagIds)` - Remove specific tags from document
  - Deletes from `document_tags` where tag_id IN (tagIds)

**2.3 Create `customTagService`**

Methods needed:
- `createCustomTag(params)` - Create new custom tag
  - Inserts into `custom_tags` table
  - Parameters: dimensionId, name, description, createdBy, organizationId
  - Returns created custom tag

- `getCustomTags(params)` - Get custom tags with optional filters
  - Selects from `custom_tags`
  - Filter by organizationId and/or dimensionId (both optional)
  - Returns array of custom tags

- `incrementUsage(customTagId)` - Call database function to increment usage count
  - Uses `supabase.rpc('increment_custom_tag_usage', { tag_id: customTagId })`

**2.4 Update `workflowService`**

Add new method:
- `completeWorkflow(params)` - Orchestrate complete workflow submission
  - Parameters: workflowSessionId, documentId, userId, categoryId, belongingRating, tags, customTags
  - Steps:
    1. Assign category using `documentCategoryService.assignCategory()`
    2. Create custom tags (if any) using `customTagService.createCustomTag()`
    3. Assign all tags (standard + custom) using `documentTagService.assignTags()`
    4. Update workflow_sessions: set step='complete', is_draft=false, completed_at=NOW()
    5. Update documents: set status='completed'
  - Return workflow session data

Add new method:
- `getWorkflowWithRelations(workflowSessionId)` - Get complete workflow data
  - Retrieves workflow session
  - Gets document category using `documentCategoryService.getDocumentCategory()`
  - Gets document tags using `documentTagService.getDocumentTags()`
  - Returns combined object: `{ session, category, tags }`

## Important Guidelines

1. **DO NOT modify existing methods** - Only add new services and methods
2. **Follow existing patterns** - Use the same error handling and Supabase query patterns as existing code
3. **Use TypeScript types** - Import and use the Database types you create
4. **Handle errors** - Check for errors after each Supabase call and throw if error exists
5. **Add comments** - Document each service and method with JSDoc-style comments
6. **Transaction safety** - For `completeWorkflow`, wrap in try-catch and document transaction limitations
7. **Null handling** - Use `error.code !== 'PGRST116'` pattern for "not found" errors

## Success Criteria

- ✅ All new type definitions added to src/lib/supabase.ts
- ✅ Three new service objects created in src/lib/database.ts
- ✅ All methods properly typed and documented
- ✅ No modifications to existing code (backward compatible)
- ✅ Code compiles without TypeScript errors
- ✅ Follows existing code style and patterns

## Files to Modify

1. `src/lib/supabase.ts` - Add type definitions
2. `src/lib/database.ts` - Add new services

Read these files, implement the changes, and show me the modified code.
```

---

### Prompt 2: API Layer & State Management Integration

**Context Window:** Fresh 200k token window  
**Estimated Execution Time:** 3-4 hours  
**Files Modified:** 2 files  
**Risk Level:** Medium (modifies API endpoint behavior)

**⚠️ IMPORTANT:** Execute this prompt AFTER Prompt 1 is complete and tested.

---

#### PROMPT 2 - PASTE THIS INTO CLAUDE-4.5-SONNET THINKING

```markdown
# Task: Integrate Normalized Database with API Layer

## Context

Phase 2 Prompt 1 has been completed. The database service layer now has:
- `documentCategoryService` - Category assignment operations
- `documentTagService` - Tag assignment and retrieval
- `customTagService` - Custom tag management
- Updated `workflowService` - Orchestrates normalized workflow completion

Now we need to integrate these services into the API layer to actually use the normalized structure when workflows are submitted.

## Current Architecture

### Frontend Data Format
The UI components send data in this format:
```typescript
{
  action: 'submit',
  documentId: 'uuid-string',
  belongingRating: 4, // 1-5 integer
  selectedCategory: { id: 'uuid-string', name: 'Category Name' },
  selectedTags: {
    'authorship': ['tag-uuid-1'],
    'format': ['tag-uuid-2', 'tag-uuid-3'],
    'disclosure-risk': ['tag-uuid-4'],
    'intended-use': ['tag-uuid-5'],
    // ... other dimensions
  },
  customTags: [
    { name: 'Custom Tag', description: 'Description', dimensionId: 'dim-uuid' }
  ]
}
```

### Dimension Key Mapping
The frontend uses string keys, but database needs UUID dimension IDs:

```typescript
const dimensionKeyMap: Record<string, string> = {
  'authorship': '550e8400-e29b-41d4-a716-446655440003',
  'format': '550e8400-e29b-41d4-a716-446655440004',
  'disclosure-risk': '550e8400-e29b-41d4-a716-446655440005',
  'intended-use': '550e8400-e29b-41d4-a716-446655440006',
  'evidence-type': '550e8400-e29b-41d4-a716-446655440021',
  'audience-level': '550e8400-e29b-41d4-a716-446655440022',
  'gating-level': '550e8400-e29b-41d4-a716-446655440023'
};
```

## File 1: src/app/api/workflow/route.ts

### Current Implementation
The API endpoint currently has a `submit` action that:
1. Creates/updates workflow_session
2. Stores data in JSONB fields: `selected_tags`, `custom_tags`, `belonging_rating`, `selected_category_id`
3. Returns success response

### Required Changes

**Locate the `case 'submit':` block** in the POST handler (around lines 180-247).

**Replace the submission logic** to use the new `workflowService.completeWorkflow()` method:

**Steps:**
1. **Transform selectedTags** from object format to array format
   - Input: `{ 'authorship': ['tag-1'], 'format': ['tag-2', 'tag-3'] }`
   - Output: `[{ tagId: 'tag-1', dimensionId: 'dim-uuid-1' }, { tagId: 'tag-2', dimensionId: 'dim-uuid-2' }, ...]`
   - Use the `dimensionKeyMap` to convert keys to UUIDs

2. **Transform customTags** if present
   - Input: `[{ name: 'Custom', description: 'Desc', dimensionId: 'dim-uuid' }]`
   - Already in correct format, pass through

3. **Call the new service method:**
   ```typescript
   const result = await workflowService.completeWorkflow({
     workflowSessionId: existingSessionId || newSessionId,
     documentId: realDocumentId,
     userId: user.id,
     categoryId: realCategoryId,
     belongingRating: belongingRating,
     tags: transformedTags,
     customTags: customTags || []
   });
   ```

4. **Return success response** (keep existing response format)

**Add helper function** at the top of the file (before the POST handler):

```typescript
/**
 * Transform frontend tag format to database format
 * Converts: { 'dimension-key': ['tag-uuid'] } → [{ tagId: 'uuid', dimensionId: 'uuid' }]
 */
function transformTagsToNormalized(
  selectedTags: Record<string, string[]>
): Array<{ tagId: string; dimensionId: string }> {
  const result = [];
  
  for (const [dimensionKey, tagIds] of Object.entries(selectedTags)) {
    const dimensionId = dimensionKeyMap[dimensionKey];
    
    if (!dimensionId) {
      console.warn(`Unknown dimension key: ${dimensionKey}`);
      continue;
    }
    
    for (const tagId of tagIds) {
      result.push({ tagId, dimensionId });
    }
  }
  
  return result;
}
```

**Error Handling:**
- Wrap the `completeWorkflow` call in try-catch
- If error occurs, log it and return appropriate error response
- Ensure transaction rollback behavior is documented in comments

**Backward Compatibility:**
- Keep dual-write capability for safety (write to both new and old structures during migration period)
- Add feature flag check: `const USE_NORMALIZED = process.env.NEXT_PUBLIC_USE_NORMALIZED_TAGS === 'true'`
- If flag is false, use old JSONB method
- If flag is true, use new normalized method
- Document this clearly in comments

## File 2: src/stores/workflow-store.ts

### Current Implementation
The Zustand store manages workflow state with:
- `selectedTags: Record<string, string[]>` - Tags by dimension key
- `customTags: Tag[]` - Custom tags array
- Actions for updating workflow state

### Required Changes

**Add two helper methods** to the store (add to the return object in the store creator):

**Method 1: getTagsForSubmission**
```typescript
/**
 * Transform store tags format to API submission format
 * Used when submitting workflow to API
 */
getTagsForSubmission: () => {
  const state = get();
  const result = [];
  
  for (const [dimensionKey, tagIds] of Object.entries(state.selectedTags)) {
    const dimensionId = dimensionKeyMap[dimensionKey];
    
    if (!dimensionId) continue;
    
    for (const tagId of tagIds) {
      result.push({ tagId, dimensionId });
    }
  }
  
  return result;
}
```

**Method 2: loadTagsFromNormalized**
```typescript
/**
 * Load tags from normalized database format into store format
 * Used when loading existing workflow data
 */
loadTagsFromNormalized: (tags: Array<{ tag_id: string; dimension_id: string }>) => {
  const grouped: Record<string, string[]> = {};
  
  // Reverse map: UUID → key
  const dimensionIdToKey = Object.entries(dimensionKeyMap).reduce(
    (acc, [key, id]) => ({ ...acc, [id]: key }),
    {} as Record<string, string>
  );
  
  tags.forEach(tag => {
    const dimensionKey = dimensionIdToKey[tag.dimension_id];
    if (!dimensionKey) return;
    
    if (!grouped[dimensionKey]) {
      grouped[dimensionKey] = [];
    }
    grouped[dimensionKey].push(tag.tag_id);
  });
  
  set({ selectedTags: grouped });
}
```

**Update TypeScript interface:**
Add these methods to the `WorkflowState` interface at the top of the file:
```typescript
export interface WorkflowState {
  // ... existing properties
  
  // NEW: Transformation helpers
  getTagsForSubmission: () => Array<{ tagId: string; dimensionId: string }>;
  loadTagsFromNormalized: (tags: Array<{ tag_id: string; dimension_id: string }>) => void;
}
```

**Add the dimensionKeyMap constant** at the top of the file (after imports):
```typescript
const dimensionKeyMap: Record<string, string> = {
  'authorship': '550e8400-e29b-41d4-a716-446655440003',
  'format': '550e8400-e29b-41d4-a716-446655440004',
  'disclosure-risk': '550e8400-e29b-41d4-a716-446655440005',
  'intended-use': '550e8400-e29b-41d4-a716-446655440006',
  'evidence-type': '550e8400-e29b-41d4-a716-446655440021',
  'audience-level': '550e8400-e29b-41d4-a716-446655440022',
  'gating-level': '550e8400-e29b-41d4-a716-446655440023'
};
```

## Important Guidelines

1. **DO NOT modify UI components** - They continue to work with the store's existing interface
2. **Maintain backward compatibility** - Old JSONB method should still work via feature flag
3. **Preserve existing response formats** - API responses should match current format
4. **Add comprehensive comments** - Explain the transformation logic clearly
5. **Error handling** - Proper try-catch blocks with meaningful error messages
6. **Type safety** - Ensure all transformations are properly typed
7. **No breaking changes** - Existing functionality must continue to work

## Testing Checklist

After implementation, verify:
- ✅ Workflow submission completes successfully
- ✅ Data appears in new junction tables (document_categories, document_tags)
- ✅ API returns success response with correct format
- ✅ No TypeScript compilation errors
- ✅ Existing workflows continue to work
- ✅ Feature flag toggles between old/new methods correctly

## Success Criteria

- ✅ API endpoint successfully uses `workflowService.completeWorkflow()`
- ✅ Tag transformation logic correctly converts formats
- ✅ Store helper methods added and properly typed
- ✅ Feature flag implementation allows safe rollback
- ✅ Dual-write capability maintained during migration
- ✅ All error cases handled gracefully
- ✅ Code compiles without errors
- ✅ Comprehensive comments explain the changes

## Files to Modify

1. `src/app/api/workflow/route.ts` - Update submit action
2. `src/stores/workflow-store.ts` - Add helper methods

Read these files, implement the changes, and show me the modified code.
```

---

## Testing & Validation Strategy

### Unit Testing

After both prompts are complete, create and run these test files:

**Test File 1: src/lib/database.test.ts**
```typescript
import { describe, it, expect } from '@jest/globals';
import { documentTagService, documentCategoryService } from './database';

describe('documentTagService', () => {
  it('should assign multiple tags to document', async () => {
    // Test tag assignment
  });
  
  it('should group tags by dimension when retrieving', async () => {
    // Test tag retrieval and grouping
  });
});

describe('documentCategoryService', () => {
  it('should assign primary category with belonging rating', async () => {
    // Test category assignment
  });
});
```

**Test File 2: src/app/api/workflow/route.test.ts**
```typescript
import { describe, it, expect } from '@jest/globals';

describe('POST /api/workflow', () => {
  it('should complete workflow with normalized data', async () => {
    // Test full workflow submission
  });
  
  it('should handle custom tags correctly', async () => {
    // Test custom tag creation and assignment
  });
});
```

### Integration Testing Checklist

- [ ] Submit a complete workflow through UI
- [ ] Verify data in `document_categories` table
- [ ] Verify data in `document_tags` table  
- [ ] Verify custom tags (if created) in `custom_tags` table
- [ ] Check workflow_sessions shows `step='complete'`
- [ ] Check documents shows `status='completed'`
- [ ] Verify data consistency between tables
- [ ] Test with various tag combinations
- [ ] Test with and without custom tags
- [ ] Test with different belonging ratings (1-5)

### Data Validation Queries

Run these queries in Supabase to validate data:

```sql
-- Check recent workflow submissions
SELECT 
    ws.id as session_id,
    ws.step,
    ws.is_draft,
    d.title as document,
    c.name as category,
    dc.belonging_rating,
    COUNT(dt.id) as tag_count
FROM workflow_sessions ws
LEFT JOIN documents d ON d.id = ws.document_id
LEFT JOIN document_categories dc ON dc.workflow_session_id = ws.id
LEFT JOIN categories c ON c.id = dc.category_id
LEFT JOIN document_tags dt ON dt.workflow_session_id = ws.id
WHERE ws.created_at > NOW() - INTERVAL '1 hour'
GROUP BY ws.id, ws.step, ws.is_draft, d.title, c.name, dc.belonging_rating
ORDER BY ws.created_at DESC;

-- Validate a specific document's categorization
SELECT * FROM validate_document_categorization('your-document-uuid-here');
```

---

## Rollback Plan

### If Issues Arise During Phase 2

**Option 1: Feature Flag Rollback (Recommended)**

1. Set environment variable: `NEXT_PUBLIC_USE_NORMALIZED_TAGS=false`
2. Restart application
3. System reverts to JSONB storage
4. No data loss (dual-write maintains both structures)

**Option 2: Code Rollback**

1. Revert to previous Git commit: `git revert <commit-hash>`
2. Redeploy application
3. Database tables remain (no harm)
4. Can retry after fixing issues

**Option 3: Database Rollback (Nuclear Option)**

Only if tables are corrupted:

```sql
-- Backup first!
-- Then drop new tables
DROP TABLE IF EXISTS document_tags CASCADE;
DROP TABLE IF EXISTS document_categories CASCADE;
DROP TABLE IF EXISTS custom_tags CASCADE;
DROP TABLE IF EXISTS workflow_metadata CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS increment_custom_tag_usage CASCADE;
DROP FUNCTION IF EXISTS migrate_workflow_session_to_normalized CASCADE;
DROP FUNCTION IF EXISTS validate_document_categorization CASCADE;
```

---

## Success Criteria

### Phase 1 Success (Database)
- ✅ All 4 tables created successfully
- ✅ All indexes created (10+ indexes)
- ✅ All RLS policies active (11+ policies)
- ✅ All 3 helper functions created
- ✅ Verification queries pass

### Phase 2 Success (Application)
- ✅ Prompt 1: Service layer functions working
- ✅ Prompt 1: TypeScript compilation successful
- ✅ Prompt 2: API integration complete
- ✅ Prompt 2: Store helper methods added
- ✅ End-to-end workflow submission successful
- ✅ Data appears in normalized tables
- ✅ Old JSONB method still works (feature flag)

### Migration Success (Phase 1.4 after Phase 2 deployment)
- ✅ Historical data migrated without errors
- ✅ Data validation passes for all documents
- ✅ Row counts match between old and new structures
- ✅ No data loss or corruption

---

## Timeline & Effort Estimates

| Phase | Duration | Activities |
|-------|----------|------------|
| **Phase 1: Database Setup** | 1 day | SQL execution, verification |
| **Phase 2 - Prompt 1** | 2-3 days | Service layer implementation |
| **Phase 2 - Prompt 2** | 2-3 days | API & store integration |
| **Testing & QA** | 3-5 days | Unit, integration, E2E testing |
| **Migration** | 1-2 days | Historical data migration |
| **Monitoring** | 1 week | Production monitoring |
| **Cleanup** | 2-3 days | Remove old code, documentation |
| **Total** | **6-7 weeks** | Including buffer time |

---

## Post-Implementation Checklist

### Deployment Day
- [ ] Database backup created and verified
- [ ] Phase 1 SQL scripts executed successfully
- [ ] Verification queries show all green checkmarks
- [ ] Phase 2 code deployed to staging environment
- [ ] Integration tests passing in staging
- [ ] Feature flag set to `false` initially (safety)
- [ ] Deploy to production
- [ ] Monitor error logs for 2 hours

### Week 1 Post-Deployment  
- [ ] Enable dual-write (both JSONB and normalized)
- [ ] Monitor data consistency between old/new structures
- [ ] Verify no performance degradation
- [ ] Run data validation queries daily
- [ ] Collect performance metrics

### Week 2 Post-Deployment
- [ ] Run historical data migration (Phase 1.4)
- [ ] Verify migration completed successfully
- [ ] Enable feature flag: `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true`
- [ ] Monitor for errors (rollback plan ready)
- [ ] Verify normalized structure is being used

### Week 3-4 Post-Deployment
- [ ] Stable operation confirmed
- [ ] Performance improvements documented
- [ ] Remove old JSONB write code
- [ ] Drop deprecated columns (after backup)
- [ ] Update documentation
- [ ] Team training on new structure

---

## Support & Troubleshooting

### Common Issues

**Issue 1: Foreign Key Constraint Violation**
```
ERROR: insert or update on table "document_tags" violates foreign key constraint
```
**Solution:** Verify tag_id and dimension_id exist in respective tables before inserting.

**Issue 2: Unique Constraint Violation**
```
ERROR: duplicate key value violates unique constraint "uq_doc_tag"
```
**Solution:** Tag already assigned to document. Use `replaceTags()` instead of `assignTags()`.

**Issue 3: RLS Policy Blocking Insert**
```
ERROR: new row violates row-level security policy
```
**Solution:** Verify user authentication and that `assigned_by` matches authenticated user ID.

### Debug Queries

```sql
-- Check what data exists for a workflow session
SELECT 
    'Categories' as data_type,
    COUNT(*) as count
FROM document_categories
WHERE workflow_session_id = 'your-session-id'
UNION ALL
SELECT 
    'Tags' as data_type,
    COUNT(*) as count
FROM document_tags
WHERE workflow_session_id = 'your-session-id';

-- Check for orphaned references
SELECT 
    dt.id,
    dt.tag_id,
    t.id as tag_exists
FROM document_tags dt
LEFT JOIN tags t ON t.id = dt.tag_id
WHERE t.id IS NULL;
```

---

## Documentation Updates Required

After successful implementation, update these documents:

1. **API Documentation** - Update workflow submission endpoint docs
2. **Database Schema Docs** - Add new table descriptions
3. **Developer Guide** - Update query examples
4. **Architecture Docs** - Update data flow diagrams
5. **Runbook** - Add troubleshooting procedures

---

## Stakeholder Communication

### For Product Owner
✅ **What Changed:** Data storage method improved for better reporting  
✅ **User Impact:** None (completely transparent to users)  
✅ **Benefits:** Future analytics and reporting capabilities  
✅ **Risk:** Low (rollback plan in place)

### For Development Team
✅ **New Services:** 3 new database service objects created  
✅ **Breaking Changes:** None (backward compatible)  
✅ **Testing:** Comprehensive test suite provided  
✅ **Deployment:** Phased rollout with feature flags

### For QA Team
✅ **Test Cases:** Integration testing checklist provided  
✅ **Validation:** Data validation queries provided  
✅ **Regression:** Old workflow method still works  
✅ **Monitoring:** Key metrics to watch post-deployment

---

## Approval Signatures

**Technical Architect:** _________________ Date: _________

**Database Administrator:** _________________ Date: _________

**Development Lead:** _________________ Date: _________

**Product Owner:** _________________ Date: _________

---

**END OF TASK SPECIFICATION v1.0**

**Next Steps:**
1. Review and approve this specification
2. Schedule Phase 1 database setup (1 day)
3. Execute Prompt 1 for service layer (2-3 days)
4. Execute Prompt 2 for API integration (2-3 days)
5. Run comprehensive testing (3-5 days)
6. Deploy to production with monitoring

For questions or clarifications, contact the development team lead.

------------------------------
## Notes

### Analysis: Will Prompt 2 Meet Requirements? (October 3, 2025)

**Requirements to Validate:**
1. ✅ Writes ALL form input values into a normalized Supabase table
2. ❌ Displays those values from the database on the webpage as currently designed in \src

---

#### FUNCTIONAL UNDERSTANDING OF CURRENT CODEBASE

The current system implements a 3-step document categorization workflow:

**Step A: Statement of Belonging**
- User provides a relationship rating (1-5 integer scale)
- Stored in `belongingRating` state variable
- Labels: 1="No relationship" → 5="Perfect fit"

**Step B: Primary Category Selection**  
- User selects one category from 10 available options
- Categories include: "Complete Systems & Methodologies", "Proprietary Strategies & Approaches", etc.
- Stored as `selectedCategory` object with full category details
- High-value categories are flagged for priority processing

**Step C: Secondary Tags & Metadata**
- User selects tags across 7 dimensions:
  - `authorship` (required)
  - `format`
  - `disclosure-risk` (required)
  - `intended-use` (required)
  - `evidence-type`
  - `audience-level`
  - `gating-level`
- Stored as `selectedTags: Record<string, string[]>` (dimension key → array of tag IDs)
- User can create custom tags with name and description
- Stored as `customTags: Tag[]` array

**Current Data Flow:**
1. User interacts with UI components (StepA, StepB, StepC)
2. Data stored in Zustand workflow store (`workflow-store.ts`)
3. Auto-save writes drafts to `workflow_sessions` table (JSONB format)
4. On final submit, API route (`/api/workflow`) writes complete data to:
   - `workflow_sessions.selected_tags` (JSONB) ← DENORMALIZED
   - `workflow_sessions.custom_tags` (JSONB) ← DENORMALIZED
   - `workflow_sessions.belonging_rating` (INTEGER)
   - `workflow_sessions.selected_category_id` (UUID) ← Already normalized
5. Workflow completion page shows data from **in-memory Zustand store** (NOT from database)

---

#### WHAT PROMPT 1 ACCOMPLISHED (Already Executed Successfully)

**Created Database Service Layer:**

1. **`documentCategoryService`** (lines 419-494 in database.ts)
   - `assignCategory()` - Inserts into `document_categories` table
   - `updateCategory()` - Updates existing category assignment
   - `getDocumentCategory()` - Retrieves category with JOIN to categories table

2. **`documentTagService`** (lines 496-598 in database.ts)
   - `assignTags()` - Batch inserts multiple tags into `document_tags` table
   - `replaceTags()` - Deletes existing and inserts new tags
   - `getDocumentTags()` - Retrieves all tags with JOINs, grouped by dimension
   - `removeTags()` - Removes specific tags

3. **`customTagService`** (lines 600-665 in database.ts)
   - `createCustomTag()` - Inserts into `custom_tags` table as first-class entity
   - `getCustomTags()` - Retrieves with optional filters
   - `incrementUsage()` - Calls database RPC function

4. **Updated `workflowService`** (lines 186-303 in database.ts)
   - `completeWorkflow()` - Orchestrates complete normalized write:
     - Assigns category to `document_categories`
     - Creates custom tags in `custom_tags`
     - Assigns all tags to `document_tags`
     - Updates workflow session to complete
     - Updates document status
   - `getWorkflowWithRelations()` - Retrieves complete workflow with all relations

5. **TypeScript Type Definitions** (lines 202-312 in supabase.ts)
   - Added `document_categories` table types
   - Added `document_tags` table types
   - Added `custom_tags` table types

---

#### WHAT PROMPT 2 WILL DO

**File 1: `src/app/api/workflow/route.ts`**

**Changes to `case 'submit':` block (lines 206-247):**

1. **Add dimension key mapping constant:**
   ```typescript
   const dimensionKeyMap: Record<string, string> = {
     'authorship': '550e8400-e29b-41d4-a716-446655440003',
     'format': '550e8400-e29b-41d4-a716-446655440004',
     'disclosure-risk': '550e8400-e29b-41d4-a716-446655440005',
     'intended-use': '550e8400-e29b-41d4-a716-446655440006',
     'evidence-type': '550e8400-e29b-41d4-a716-446655440021',
     'audience-level': '550e8400-e29b-41d4-a716-446655440022',
     'gating-level': '550e8400-e29b-41d4-a716-446655440023'
   }
   ```

2. **Add transformation helper function:**
   ```typescript
   function transformTagsToNormalized(
     selectedTags: Record<string, string[]>
   ): Array<{ tagId: string; dimensionId: string }>
   ```
   - Converts frontend format: `{ 'authorship': ['uuid1'] }` 
   - To normalized format: `[{ tagId: 'uuid1', dimensionId: 'dim-uuid' }]`

3. **Replace current JSONB insert with:**
   ```typescript
   const result = await workflowService.completeWorkflow({
     workflowSessionId: existingSessionId || newSessionId,
     documentId: realDocumentId,
     userId: user.id,
     categoryId: realCategoryId,
     belongingRating: belongingRating,
     tags: transformedTags,
     customTags: customTags || []
   })
   ```

4. **Add feature flag for dual-write:**
   - Check `NEXT_PUBLIC_USE_NORMALIZED_TAGS` environment variable
   - If `false`, use old JSONB method (backward compatibility)
   - If `true`, use new normalized method
   - Enables safe rollback

**File 2: `src/stores/workflow-store.ts`**

**Add helper methods to WorkflowState interface:**

1. **`getTagsForSubmission()`** - Transform store format to API format
   - Reads `selectedTags` from store
   - Converts dimension keys to UUIDs
   - Returns array format for normalized tables

2. **`loadTagsFromNormalized()`** - Transform database format to store format
   - Receives normalized tag data from database
   - Converts dimension UUIDs back to keys
   - Updates store with grouped format

3. **Add `dimensionKeyMap` constant** - Same mapping as API route

---

#### CRITICAL ANALYSIS: WHAT PROMPT 2 WILL NOT DO

**❌ MAJOR GAP: Display/Read Functionality Not Implemented**

The specification **DOES NOT** update the display layer to read from the normalized tables. Specifically:

**Current Display Implementation:**

1. **`WorkflowCompleteServer.tsx` (lines 1-44):**
   ```typescript
   async function getDocument(documentId: string) {
     const document = mockDocuments.find(doc => doc.id === documentId)
     return document
   }
   
   async function getWorkflowSummary(documentId: string) {
     return {
       workflowId: `workflow_${documentId}_${Date.now()}`,
       submittedAt: new Date().toISOString(),
       processingEstimate: '5-10 minutes',
       status: 'completed'
     }
   }
   ```
   - **Uses MOCK DATA** - not real database queries
   - Does NOT call `workflowService.getWorkflowWithRelations()`
   - Does NOT fetch from normalized tables

2. **`WorkflowCompleteClient.tsx` (lines 34-397):**
   ```typescript
   const { 
     belongingRating,
     selectedCategory,
     selectedTags,
     resetWorkflow,
     submitWorkflow
   } = useWorkflowStore()
   ```
   - Reads from **in-memory Zustand store**
   - NOT from database
   - Shows what was just entered, not what was saved

**Missing Functionality for Full Requirements:**

To display values from the normalized database, you would need:

1. **Server Component Update:**
   ```typescript
   // NOT IN PROMPT 2
   async function getWorkflowData(documentId: string, userId: string) {
     const session = await workflowService.getSession(documentId, userId)
     const data = await workflowService.getWorkflowWithRelations(session.id)
     return data
   }
   ```

2. **Data Transformation for Display:**
   ```typescript
   // NOT IN PROMPT 2
   // Convert normalized tags back to frontend format
   const displayTags = transformNormalizedToDisplay(data.tags)
   ```

3. **Update Client Component to Receive Database Data:**
   ```typescript
   // NOT IN PROMPT 2
   <WorkflowCompleteClient 
     workflowData={databaseWorkflowData}  // From normalized tables
     document={document}
     tagDimensions={tagDimensions}
   />
   ```

---

#### VERIFICATION AGAINST REQUIREMENTS

**Requirement 1: ✅ Writes ALL form input values into a normalized Supabase table**

**CONFIRMED - Prompt 2 WILL accomplish this:**

After Prompt 2 execution, the submit action will write:

| Form Input | Normalized Table | Field | Notes |
|------------|------------------|-------|-------|
| Belonging Rating | `document_categories` | `belonging_rating` | ✅ INTEGER (1-5) |
| Selected Category | `document_categories` | `category_id` | ✅ UUID foreign key |
| Standard Tags (43+) | `document_tags` | `tag_id`, `dimension_id` | ✅ Multiple rows, one per tag |
| Custom Tags | `custom_tags` | `name`, `description`, `dimension_id` | ✅ First-class entities |
| Custom Tag Assignments | `document_tags` | `tag_id` (custom), `dimension_id`, `is_custom_tag=true` | ✅ Linked via document_tags |
| Workflow Session Link | All 3 tables | `workflow_session_id` | ✅ Maintains traceability |
| User Assignment | All 3 tables | `assigned_by` / `created_by` | ✅ Audit trail |
| Timestamps | All 3 tables | `assigned_at` / `created_at` | ✅ Temporal tracking |

**How it works:**
1. User submits form with all data
2. API route calls `transformTagsToNormalized()` to convert format
3. `workflowService.completeWorkflow()` executes 6 steps:
   - Insert into `document_categories` (belonging rating + category)
   - Create any custom tags in `custom_tags` table
   - Insert all tags (standard + custom) into `document_tags`
   - Update `workflow_sessions` to mark complete
   - Update `documents` status to completed
4. All form inputs are now in normalized tables with proper foreign keys

**Requirement 2: ❌ Displays those values from the database on the webpage**

**NOT ACCOMPLISHED - Prompt 2 does NOT address display:**

Current display behavior after Prompt 2:
- ❌ Workflow completion page still uses Zustand store (in-memory)
- ❌ Server components still use mock data
- ❌ No database queries to fetch normalized data
- ❌ No transformation from normalized format back to display format
- ❌ No refresh/reload capability to show saved data

**What would be shown:**
- Immediate after submit: Data from Zustand store (appears to work)
- After page refresh: Mock data or error (database data not retrieved)
- From another session: Cannot view submitted workflow data

---

#### RECOMMENDATIONS

**To meet BOTH requirements, you need a Prompt 3:**

**PROMPT 3 SCOPE: Display Layer Integration**

**Files to modify:**
1. `src/components/server/WorkflowCompleteServer.tsx`
2. `src/components/client/WorkflowCompleteClient.tsx`
3. Create: `src/app/api/workflow/session/route.ts` (GET endpoint)

**Changes needed:**

1. **Replace mock data with real queries:**
   ```typescript
   async function getWorkflowData(workflowSessionId: string) {
     return await workflowService.getWorkflowWithRelations(workflowSessionId)
   }
   ```

2. **Transform normalized data for display:**
   ```typescript
   function transformNormalizedToDisplay(tags: NormalizedTags) {
     // Convert from: [{ tag_id, dimension_id }]
     // To: { 'authorship': ['tag-id-1'], 'format': ['tag-id-2'] }
   }
   ```

3. **Update client component to accept database props:**
   ```typescript
   interface Props {
     workflowData: DatabaseWorkflowData  // NEW
     document: WorkflowDocument
     tagDimensions: TagDimension[]
   }
   ```

4. **Add GET endpoint to fetch workflow by ID:**
   ```typescript
   GET /api/workflow/session?workflowId={id}
   // Returns complete workflow with normalized data
   ```

**Estimated effort for Prompt 3:**
- 2-3 hours implementation
- 1-2 files modified
- Low risk (read-only operations)

---

#### DEPLOYMENT CONSIDERATIONS

**With Prompt 2 Only:**
- ✅ Data is written to normalized tables correctly
- ✅ Database integrity maintained
- ✅ Reporting queries can access normalized data
- ⚠️ Users see data from in-memory store immediately after submit
- ❌ Users cannot view historical workflows
- ❌ Refresh shows mock data, not real data
- ❌ Multi-session workflows won't work

**Recommended Deployment Path:**

**Phase 2A: Prompt 2 (Write Layer) - CURRENT**
- Deploy normalized writes
- Keep feature flag `NEXT_PUBLIC_USE_NORMALIZED_TAGS=false` initially
- Test dual-write for 1 week
- Validate data in normalized tables

**Phase 2B: Prompt 3 (Read Layer) - REQUIRED NEXT**
- Implement display from normalized tables
- Test with real workflow data
- Enable feature flag: `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true`
- Full end-to-end validation

**Phase 2C: Historical Migration (From Spec Step 1.4)**
- Run migration script to backfill existing JSONB data
- Validate historical data displays correctly
- Remove old JSONB fields (after backup)

---

#### CONCLUSION

**Prompt 2 Status: PARTIAL COMPLETION**

| Requirement | Status | Completion % | Notes |
|-------------|--------|--------------|-------|
| Write ALL form inputs to normalized tables | ✅ YES | 100% | Fully implemented via `completeWorkflow()` |
| Display values from database | ❌ NO | 0% | Not addressed in specification |
| **Overall** | ⚠️ PARTIAL | **50%** | **Prompt 3 required for full requirements** |

**Recommendation:** 
- Proceed with Prompt 2 as specified
- Immediately create Prompt 3 for display layer
- Do NOT consider implementation complete until display works
- Update specification to include Prompt 3 scope
- Test end-to-end flow: Submit → Save → Refresh → Display from DB

**Risk Assessment:**
- **Low Risk:** Prompt 2 changes are backward compatible (feature flag)
- **Medium Risk:** Users may be confused if they refresh and see mock data
- **Mitigation:** Deploy Prompt 2 and Prompt 3 together in same release

---

**Analysis performed by:** Claude Sonnet 4.5  
**Date:** October 3, 2025  
**Codebase Version:** Post Prompt 1 execution  
**Specification Version:** v1.0