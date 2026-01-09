'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  BookOpen, 
  List, 
  Clock, 
  ChevronRight,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SermonOutputProps {
  sermonId: string
}

interface SermonOutputData {
  success: boolean
  sermon: {
    id: string
    title: string
    speaker: string
    date: string
    audioUrl: string
    status: string
  }
  output: {
    transcript: string
    transcriptWords: number
    summary: string
    keyPoints: string[]
    mainThemes: string[]
    keyVerses: Array<{
      reference: string
      quote?: string
      context?: string
    }>
    references: string[]
    wordCount: number
    estimatedReadTime: number
  }
}

interface SermonStatus {
  currentStatus: string
  progress: number
  hasTranscript: boolean
  hasSummary: boolean
}

export function SermonOutput({ sermonId }: SermonOutputProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SermonOutputData | null>(null)
  const [status, setStatus] = useState<SermonStatus | null>(null)
  
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(() => {
      if (status && status.currentStatus !== 'completed') {
        fetchStatus()
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [sermonId])
  
  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/sermons/${sermonId}/status`)
      const result = await response.json()
      
      if (result.success) {
        setStatus(result.status)
        
        if (result.status.currentStatus === 'completed') {
          fetchOutput()
        }
      }
    } catch (err) {
      console.error('Error fetching status:', err)
    }
  }
  
  const fetchOutput = async () => {
    try {
      const response = await fetch(`/api/sermons/${sermonId}/output`)
      const result = await response.json()
      
      if (result.success) {
        setData(result)
      } else {
        setError(result.error || 'Failed to load sermon output')
      }
    } catch (err) {
      setError('Failed to load sermon output')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }
  
  if (loading) {
    return <ProcessingStatus status={status || { currentStatus: 'pending', progress: 0, hasTranscript: false, hasSummary: false }} />
  }
  
  if (error) {
    return <ErrorState error={error} />
  }
  
  if (!data) {
    return <EmptyState />
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{data.sermon.title}</CardTitle>
              <CardDescription className="mt-1">
                by {data.sermon.speaker} • {new Date(data.sermon.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </CardDescription>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
        </CardHeader>
      </Card>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Words"
          value={data.output.wordCount.toLocaleString()}
        />
        <StatCard
          icon={Clock}
          label="Read Time"
          value={`${data.output.estimatedReadTime} min`}
        />
        <StatCard
          icon={List}
          label="Key Points"
          value={data.output.keyPoints.length.toString()}
        />
        <StatCard
          icon={BookOpen}
          label="Verses"
          value={data.output.keyVerses.length.toString()}
        />
      </div>
      
      {/* Content Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="keypoints">Key Points</TabsTrigger>
              <TabsTrigger value="verses">Biblical Verses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Sermon Summary</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(data.output.summary)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {data.output.summary}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transcript" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Full Transcript</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(data.output.transcript)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[500px] rounded-md border border-slate-200 dark:border-slate-700 p-4">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {data.output.transcript}
                    </p>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
            
            <TabsContent value="keypoints" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Key Points</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(data.output.keyPoints.join('\n'))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="space-y-3">
                  {data.output.keyPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed flex-1 pt-0.5">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <h3 className="text-lg font-semibold">Main Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {data.output.mainThemes.map((theme, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-sm px-4 py-1.5"
                    >
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="verses" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Key Biblical Verses</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(
                      data.output.keyVerses.map(v => v.reference).join('\n')
                    )}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <ScrollArea className="h-[500px] rounded-md border border-slate-200 dark:border-slate-700 p-4">
                  <div className="space-y-4">
                    {data.output.keyVerses.map((verse, index) => (
                      <div
                        key={index}
                        className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-semibold text-sm">
                            {verse.reference}
                          </span>
                        </div>
                        {verse.quote && (
                          <blockquote className="pl-4 border-l-4 border-slate-300 dark:border-slate-600 italic text-sm text-slate-700 dark:text-slate-300">
                            "{verse.quote}"
                          </blockquote>
                        )}
                        {verse.context && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                            Context: {verse.context}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {data.output.references.length > data.output.keyVerses.length && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">All References Mentioned</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.output.references.map((ref, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {label}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ProcessingStatusProps {
  status: SermonStatus
}

function ProcessingStatus({ status }: ProcessingStatusProps) {
  const statusMessages: Record<string, string> = {
    pending: 'Waiting to start...',
    transcribing: 'Transcribing audio with AI...',
    processing: 'Generating summary and extracting insights...',
    completed: 'Processing completed!',
    failed: 'Processing failed'
  }
  
  const getStatusColor = () => {
    switch (status.currentStatus) {
      case 'completed':
        return 'bg-emerald-500'
      case 'failed':
        return 'bg-red-500'
      case 'processing':
      case 'transcribing':
        return 'bg-amber-500'
      default:
        return 'bg-slate-400'
    }
  }
  
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        {status.currentStatus !== 'completed' && status.currentStatus !== 'failed' ? (
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
        ) : status.currentStatus === 'completed' ? (
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-4" />
        ) : (
          <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        )}
        
        <h3 className="text-lg font-semibold mb-2">
          {statusMessages[status.currentStatus] || 'Processing...'}
        </h3>
        
        {/* Progress Bar */}
        {status.currentStatus !== 'completed' && status.currentStatus !== 'failed' && (
          <div className="w-full max-w-md mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-medium">{status.progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all duration-500', getStatusColor())}
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Failed to Load
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 text-center max-w-md">
          {error}
        </p>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          No Output Available
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-xs">
          This sermon hasn't been processed yet. Start the AI processing to generate transcripts and summaries.
        </p>
      </CardContent>
    </Card>
  )
}
