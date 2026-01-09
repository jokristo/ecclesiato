import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const speaker = formData.get('speaker') as string
    const date = formData.get('date') as string
    const description = formData.get('description') as string
    const organizationId = formData.get('organizationId') as string
    const recordedById = formData.get('recordedById') as string
    const audioFile = formData.get('audio') as File
    
    if (!title || !speaker || !date || !audioFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'sermons')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = audioFile.name.split('.').pop() || 'webm'
    const filename = `${timestamp}.${fileExtension}`
    const filepath = join(uploadsDir, filename)
    
    // Save file
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)
    
    // Get audio duration from form data or estimate
    const audioDuration = parseInt(formData.get('duration') as string) || 0
    const audioSize = audioFile.size
    
    // Create sermon record
    const sermon = await db.sermon.create({
      data: {
        title,
        speaker,
        date: new Date(date),
        description: description || null,
        audioUrl: `/uploads/sermons/${filename}`,
        audioSize,
        audioDuration,
        audioFormat: audioFile.type,
        status: 'pending',
        organizationId: organizationId || 'default',
        recordedById: recordedById || 'default',
      }
    })
    
    return NextResponse.json({
      success: true,
      sermon: {
        id: sermon.id,
        title: sermon.title,
        speaker: sermon.speaker,
        audioUrl: sermon.audioUrl,
        status: sermon.status,
        createdAt: sermon.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating sermon:', error)
    return NextResponse.json(
      { error: 'Failed to create sermon' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where: any = {}
    if (organizationId) {
      where.organizationId = organizationId
    }
    if (status) {
      where.status = status
    }
    
    const [sermons, total] = await Promise.all([
      db.sermon.findMany({
        where,
        include: {
          output: true,
          recordedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        take: limit,
        skip: offset
      }),
      db.sermon.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      sermons,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + sermons.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching sermons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sermons' },
      { status: 500 }
    )
  }
}
