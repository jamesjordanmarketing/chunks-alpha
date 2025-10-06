import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await documentService.getById(params.id);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      document,
    });

  } catch (error: any) {
    console.error('Error getting document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get document' },
      { status: 500 }
    );
  }
}
