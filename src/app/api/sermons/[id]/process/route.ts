import { NextRequest, NextResponse } from 'next/server'
import { sermonProcessingService } from '@/lib/services/sermonProcessing'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify sermon exists
    const sermon = await db.sermon.findUnique({
      where: { id: params.id }
    })
    
    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      )
    }
    
    // Check if already processing or completed
    if (sermon.status === 'processing' || sermon.status === 'transcribing') {
      return NextResponse.json(
        { error: 'Sermon is already being processed' },
        { status: 400 }
      )
    }
    
    if (sermon.status === 'completed') {
      return NextResponse.json(
        { error: 'Sermon has already been processed' },
        { status: 400 }
      )
    }
    
    // Get processing options from request body
    const body = await request.json().catch(() => ({}))
    const options = {
      generateSummary: body.generateSummary !== false,
      extractKeyPoints: body.extractKeyPoints !== false,
      extractBiblicalReferences: body.extractBiblicalReferences !== false
    }
    
    // Start processing (fire and forget - will run asynchronously)
    sermonProcessingService.processSermon(params.id, options).catch(error => {
      console.error('Sermon processing failed:', error)
    })
    
    return NextResponse.json({
      success: true,
      message: 'Sermon processing started',
      sermonId: params.id,
      options
    })
  } catch (error) {
    console.error('Error starting sermon processing:', error)
    return NextResponse.json(
      { error: 'Failed to start processing' },
      { status: 500 }
    )
  }
}
