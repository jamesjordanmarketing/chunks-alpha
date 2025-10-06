import { NextRequest, NextResponse } from 'next/server';
import { ChunkExtractor } from '../../../../lib/chunk-extraction/extractor';
import { DimensionGenerator } from '../../../../lib/dimension-generation/generator';
import { userService, chunkExtractionJobService } from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await userService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Start extraction
    const extractor = new ChunkExtractor();
    const chunks = await extractor.extractChunksForDocument(documentId, user.id);

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
      userId: user.id,
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
      runId,
      chunks,
    });

  } catch (error: any) {
    console.error('Chunk extraction error:', error);
    
    // Try to update job status to failed
    try {
      const { documentId } = await request.json();
      const job = await chunkExtractionJobService.getLatestJob(documentId);
      if (job) {
        await chunkExtractionJobService.updateJob(job.id, {
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        });
      }
    } catch (updateError) {
      console.error('Failed to update job status:', updateError);
    }
    
    return NextResponse.json(
      { error: error.message || 'Extraction failed' },
      { status: 500 }
    );
  }
}

