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
        output: true,
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
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
    
    return NextResponse.json({
      success: true,
      sermon
    })
  } catch (error) {
    console.error('Error fetching sermon:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sermon' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sermon = await db.sermon.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Sermon deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting sermon:', error)
    return NextResponse.json(
      { error: 'Failed to delete sermon' },
      { status: 500 }
    )
  }
}
