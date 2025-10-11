import { NextRequest, NextResponse } from 'next/server';
import { ChunkExtractor } from '../../../../lib/chunk-extraction/extractor';
import { DimensionGenerator } from '../../../../lib/dimension-generation/generator';
import { chunkExtractionJobService, chunkService } from '../../../../lib/database';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { documentId, forceReExtract } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured in environment variables');
      return NextResponse.json(
        { 
          error: 'AI service not configured. Please set ANTHROPIC_API_KEY in Vercel environment variables.',
          details: 'Missing ANTHROPIC_API_KEY'
        },
        { status: 500 }
      );
    }

    // Get server-side Supabase client
    const supabase = createServerSupabaseClient();
    
    // Get current user (optional - will use null if not authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // NEW: Check if chunks already exist
    const existingChunkCount = await chunkService.getChunkCount(documentId);
    
    if (existingChunkCount > 0 && forceReExtract !== true) {
      // Chunks already exist and forceReExtract not set
      return NextResponse.json(
        { 
          error: 'Chunks already exist for this document',
          existingChunks: existingChunkCount,
          hint: 'Set forceReExtract=true to delete existing chunks and re-extract'
        },
        { status: 400 }
      );
    }

    // NEW: If forceReExtract is true, delete all existing chunks and dimensions
    if (forceReExtract === true && existingChunkCount > 0) {
      console.log(`🗑️ Deleting ${existingChunkCount} existing chunks for document ${documentId}`);
      
      // Delete all chunk_dimensions first (foreign key constraint)
      const chunks = await chunkService.getChunksByDocument(documentId);
      for (const chunk of chunks) {
        await supabase
          .from('chunk_dimensions')
          .delete()
          .eq('chunk_id', chunk.id);
      }
      
      // Delete all chunks
      await chunkService.deleteChunksByDocument(documentId);
      console.log(`✅ Deleted all chunks and dimensions for document ${documentId}`);
    }

    // Start extraction
    const extractor = new ChunkExtractor();
    const chunks = await extractor.extractChunksForDocument(documentId, userId);

    // Get the extraction job to update its status
    const job = await chunkExtractionJobService.getLatestJob(documentId);
    
    if (job) {
      // Update job status to generating_dimensions
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'generating_dimensions',
        current_step: 'Generating AI dimensions for chunks',
      });
    }

    // Automatically trigger dimension generation
    const generator = new DimensionGenerator();
    const runId = await generator.generateDimensionsForDocument({
      documentId,
      userId,
    });

    // Update job to completed
    if (job) {
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'completed',
        current_step: 'Dimension generation complete',
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      chunksExtracted: chunks.length,
      reExtracted: forceReExtract === true,
      runId,
      chunks,
    });

  } catch (error: any) {
    console.error('Chunk extraction error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Extraction failed' },
      { status: 500 }
    );
  }
}

