import { NextRequest, NextResponse } from 'next/server';
import { DimensionGenerator } from '../../../../lib/dimension-generation/generator';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Get server-side Supabase client
    const supabase = createServerSupabaseClient();
    
    // Get current user (optional - will use system user if not authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'system';

    // Generate dimensions
    const generator = new DimensionGenerator();
    const runId = await generator.generateDimensionsForDocument({
      documentId,
      userId,
    });

    return NextResponse.json({
      success: true,
      runId,
    });

  } catch (error: any) {
    console.error('Dimension generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}

