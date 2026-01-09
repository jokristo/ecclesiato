import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'

interface TranscriptionResult {
  transcript: string
  wordCount: number
  processingTime: number
}

interface ProcessingOptions {
  generateSummary?: boolean
  extractKeyPoints?: boolean
  extractBiblicalReferences?: boolean
}

export class SermonProcessingService {
  private zai: ZAI | null = null
  
  async initialize() {
    if (!this.zai) {
      this.zai = await ZAI.create()
    }
  }
  
  /**
   * Transcribe audio file using ASR
   */
  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
    await this.initialize()
    
    const startTime = Date.now()
    
    try {
      // Read audio file
      const audioBuffer = await readFile(audioFilePath)
      const base64Audio = audioBuffer.toString('base64')
      
      // Transcribe using ASR
      const response = await this.zai!.audio.asr.create({
        file_base64: base64Audio
      })
      
      const transcript = response.text || ''
      const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length
      const processingTime = Date.now() - startTime
      
      return {
        transcript,
        wordCount,
        processingTime
      }
    } catch (error) {
      console.error('Transcription error:', error)
      throw new Error('Failed to transcribe audio')
    }
  }
  
  /**
   * Generate summary using LLM
   */
  async generateSummary(transcript: string): Promise<{
    summary: string
    keyPoints: string[]
    mainThemes: string[]
  }> {
    await this.initialize()
    
    const prompt = `Analyze the following sermon transcript and provide:
1. A concise summary (2-3 paragraphs)
2. 5-7 key points
3. 3-5 main themes

Transcript:
${transcript}

Format your response as JSON:
{
  "summary": "the summary",
  "keyPoints": ["point 1", "point 2", ...],
  "mainThemes": ["theme 1", "theme 2", ...]
}`
    
    try {
      const response = await this.zai!.llm.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant specialized in analyzing Christian sermons. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })
      
      const content = response.choices[0]?.message?.content || '{}'
      const result = JSON.parse(content)
      
      return {
        summary: result.summary || '',
        keyPoints: result.keyPoints || [],
        mainThemes: result.mainThemes || []
      }
    } catch (error) {
      console.error('Summary generation error:', error)
      // Return defaults on error
      return {
        summary: '',
        keyPoints: [],
        mainThemes: []
      }
    }
  }
  
  /**
   * Extract biblical references from transcript
   */
  async extractBiblicalReferences(transcript: string): Promise<{
    keyVerses: Array<{
      reference: string
      quote?: string
      context?: string
    }>
    allReferences: string[]
  }> {
    await this.initialize()
    
    const prompt = `Extract all biblical references from this sermon transcript.
For each reference, identify:
1. The verse reference (e.g., "John 3:16")
2. If quoted in the sermon, the actual quote
3. The context in which it was used

Transcript:
${transcript}

Format your response as JSON:
{
  "keyVerses": [
    {
      "reference": "John 3:16",
      "quote": "For God so loved the world...",
      "context": "Discussed God's love for humanity"
    }
  ],
  "allReferences": ["John 3:16", "Romans 8:28", ...]
}`
    
    try {
      const response = await this.zai!.llm.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant specialized in biblical analysis. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2
      })
      
      const content = response.choices[0]?.message?.content || '{}'
      const result = JSON.parse(content)
      
      return {
        keyVerses: result.keyVerses || [],
        allReferences: result.allReferences || []
      }
    } catch (error) {
      console.error('Biblical references extraction error:', error)
      // Return defaults on error
      return {
        keyVerses: [],
        allReferences: []
      }
    }
  }
  
  /**
   * Full processing pipeline
   */
  async processSermon(
    sermonId: string,
    options: ProcessingOptions = {
      generateSummary: true,
      extractKeyPoints: true,
      extractBiblicalReferences: true
    }
  ) {
    await this.initialize()
    
    try {
      // Update status to transcribing
      await db.sermon.update({
        where: { id: sermonId },
        data: { status: 'transcribing' }
      })
      
      // Get sermon details
      const sermon = await db.sermon.findUnique({
        where: { id: sermonId }
      })
      
      if (!sermon) {
        throw new Error('Sermon not found')
      }
      
      // Construct audio file path
      const audioPath = join(process.cwd(), 'public', sermon.audioUrl)
      
      // Step 1: Transcribe
      console.log(`Transcribing sermon ${sermonId}...`)
      const transcriptionResult = await this.transcribeAudio(audioPath)
      
      await db.sermon.update({
        where: { id: sermonId },
        data: {
          status: 'processing',
          transcribedAt: new Date()
        }
      })
      
      // Step 2: Generate summary and extracts
      let summary = ''
      let keyPoints: string[] = []
      let mainThemes: string[] = []
      let keyVerses: Array<{
        reference: string
        quote?: string
        context?: string
      }> = []
      let allReferences: string[] = []
      
      if (options.generateSummary || options.extractKeyPoints || options.extractBiblicalReferences) {
        console.log(`Generating analysis for sermon ${sermonId}...`)
        
        if (options.generateSummary || options.extractKeyPoints) {
          const summaryResult = await this.generateSummary(transcriptionResult.transcript)
          summary = summaryResult.summary
          keyPoints = summaryResult.keyPoints
          mainThemes = summaryResult.mainThemes
        }
        
        if (options.extractBiblicalReferences) {
          const referencesResult = await this.extractBiblicalReferences(transcriptionResult.transcript)
          keyVerses = referencesResult.keyVerses
          allReferences = referencesResult.allReferences
        }
      }
      
      // Step 3: Create or update output
      const wordCount = transcriptionResult.wordCount
      const estimatedReadTime = Math.ceil(wordCount / 200) // Average reading speed
      
      await db.sermonOutput.upsert({
        where: { sermonId },
        create: {
          sermonId,
          transcript: transcriptionResult.transcript,
          transcriptWords: wordCount,
          summary,
          keyPoints: JSON.stringify(keyPoints),
          mainThemes: JSON.stringify(mainThemes),
          keyVerses: JSON.stringify(keyVerses),
          references: JSON.stringify(allReferences),
          wordCount,
          estimatedReadTime,
          processingTime: transcriptionResult.processingTime,
          aiModel: 'whisper-v3'
        },
        update: {
          transcript: transcriptionResult.transcript,
          transcriptWords: wordCount,
          summary,
          keyPoints: JSON.stringify(keyPoints),
          mainThemes: JSON.stringify(mainThemes),
          keyVerses: JSON.stringify(keyVerses),
          references: JSON.stringify(allReferences),
          wordCount,
          estimatedReadTime,
          processingTime: transcriptionResult.processingTime
        }
      })
      
      // Update sermon status to completed
      await db.sermon.update({
        where: { id: sermonId },
        data: {
          status: 'completed',
          processedAt: new Date()
        }
      })
      
      console.log(`Sermon ${sermonId} processing completed`)
      
      return {
        success: true,
        sermonId,
        transcriptWords: wordCount,
        processingTime: transcriptionResult.processingTime
      }
    } catch (error) {
      console.error('Error processing sermon:', error)
      
      // Update sermon status to failed
      await db.sermon.update({
        where: { id: sermonId },
        data: {
          status: 'failed'
        }
      })
      
      throw error
    }
  }
}

// Singleton instance
export const sermonProcessingService = new SermonProcessingService()
