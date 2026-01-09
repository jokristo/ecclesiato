import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sermon = await db.sermon.findUnique({
      where: { id: params.id },
      include: {
        output: true
      }
    })
    
    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      )
    }
    
    if (!sermon.output) {
      return NextResponse.json(
        { error: 'Output not available yet' },
        { status: 404 }
      )
    }
    
    // Parse JSON fields
    const output = {
      ...sermon.output,
      keyPoints: JSON.parse(sermon.output.keyPoints || '[]'),
      mainThemes: JSON.parse(sermon.output.mainThemes || '[]'),
      keyVerses: JSON.parse(sermon.output.keyVerses || '[]'),
      references: JSON.parse(sermon.output.references || '[]')
    }
    
    return NextResponse.json({
      success: true,
      sermon: {
        id: sermon.id,
        title: sermon.title,
        speaker: sermon.speaker,
        date: sermon.date,
        audioUrl: sermon.audioUrl,
        status: sermon.status
      },
      output
    })
  } catch (error) {
    console.error('Error fetching sermon output:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sermon output' },
      { status: 500 }
    )
  }
}
