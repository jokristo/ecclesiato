import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sermon = await db.sermon.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        speaker: true,
        status: true,
        createdAt: true,
        transcribedAt: true,
        processedAt: true,
        output: {
          select: {
            id: true,
            transcript: true,
            summary: true,
            transcriptWords: true,
            processingTime: true
          }
        }
      }
    })
    
    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      )
    }
    
    // Calculate progress based on status
    const progressMap: Record<string, number> = {
      pending: 0,
      transcribing: 30,
      processing: 60,
      completed: 100,
      failed: 0
    }
    
    return NextResponse.json({
      success: true,
      status: {
        id: sermon.id,
        title: sermon.title,
        speaker: sermon.speaker,
        currentStatus: sermon.status,
        progress: progressMap[sermon.status] || 0,
        hasTranscript: !!sermon.output?.transcript,
        hasSummary: !!sermon.output?.summary,
        transcriptWords: sermon.output?.transcriptWords || 0,
        createdAt: sermon.createdAt,
        transcribedAt: sermon.transcribedAt,
        processedAt: sermon.processedAt,
        processingTime: sermon.output?.processingTime
      }
    })
  } catch (error) {
    console.error('Error fetching sermon status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sermon status' },
      { status: 500 }
    )
  }
}
