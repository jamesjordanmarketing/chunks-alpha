import { NextRequest, NextResponse } from 'next/server';
import { DimensionGenerator } from '../../../../lib/dimension-generation/generator';
import { userService } from '../../../../lib/database';

/**
 * POST /api/chunks/regenerate
 * 
 * Regenerates dimensions for specified chunks
 * Creates a new run_id and preserves all historical runs
 * 
 * Body:
 * - documentId: string (required)
 * - chunkIds: string[] (optional - if not provided, regenerates all chunks)
 * - templateIds: string[] (optional - if not provided, uses all applicable templates)
 * - aiParams: { temperature?: number; model?: string } (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const { documentId, chunkIds, templateIds, aiParams } = await request.json();
    
    // Validate inputs
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
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }
    
    // Log regeneration request
    console.log('Starting dimension regeneration:', {
      documentId,
      chunkCount: chunkIds?.length || 'all',
      templateCount: templateIds?.length || 'all',
      aiParams,
      userId: user.id,
    });
    
    // Generate dimensions for specified chunks
    const generator = new DimensionGenerator();
    const runId = await generator.generateDimensionsForDocument({
      documentId,
      userId: user.id,
      chunkIds,  // Optional: specific chunks only
      templateIds,  // Optional: specific templates only
      aiParams,  // Optional: AI parameters override
    });
    
    return NextResponse.json({
      success: true,
      runId,
      message: 'Regeneration complete',
    });
    
  } catch (error: any) {
    console.error('Regeneration error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Regeneration failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

