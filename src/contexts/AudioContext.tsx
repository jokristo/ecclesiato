'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

export interface AudioDevice {
  deviceId: string
  label: string
  kind: string
}

export interface AudioRecording {
  id: string
  timestamp: Date
  duration: number
  blob: Blob
  url: string
}

export interface AudioVolume {
  level: number // 0-100
  peak: number // 0-100, highest level in recent seconds
  clipped: boolean // true if level exceeded -1dB
}

interface AudioContextType {
  // Device management
  devices: AudioDevice[]
  selectedDeviceId: string | null
  isLoading: boolean
  error: string | null
  
  // Recording state
  isRecording: boolean
  recordingDuration: number
  recordings: AudioRecording[]
  
  // Audio monitoring
  volume: AudioVolume
  
  // Methods
  enumerateDevices: () => Promise<void>
  selectDevice: (deviceId: string) => void
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  discardRecording: (id: string) => void
  deleteRecording: (id: string) => void
  playRecording: (id: string) => void
  stopPlayback: () => void
  clearError: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<AudioDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordings, setRecordings] = useState<AudioRecording[]>([])
  
  const [volume, setVolume] = useState<AudioVolume>({ level: 0, peak: 0, clipped: false })
  
  // Refs for audio streams
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const recordingStartTimeRef = useRef<number>(0)
  const volumeAnimationFrameRef = useRef<number>()
  const peakVolumeRef = useRef(0)
  const peakTimeoutRef = useRef<NodeJS.Timeout>()
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopMonitoring()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (volumeAnimationFrameRef.current) {
        cancelAnimationFrame(volumeAnimationFrameRef.current)
      }
      if (peakTimeoutRef.current) {
        clearTimeout(peakTimeoutRef.current)
      }
    }
  }, [])
  
  const enumerateDevices = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Request permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      
      // Get devices
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = allDevices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}...`,
          kind: device.kind
        }))
      
      setDevices(audioInputs)
      
      // Auto-select first device if none selected
      if (!selectedDeviceId && audioInputs.length > 0) {
        setSelectedDeviceId(audioInputs[0].deviceId)
      }
    } catch (err) {
      setError('Failed to access microphone. Please grant permission.')
      console.error('Error enumerating devices:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDeviceId])
  
  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId)
  }, [])
  
  const startMonitoring = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext
      
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      
      source.connect(analyser)
      analyserRef.current = analyser
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const analyzeVolume = () => {
        if (!analyserRef.current) return
        
        analyserRef.current.getByteFrequencyData(dataArray)
        
        // Calculate RMS (root mean square) for volume level
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i]
        }
        const rms = Math.sqrt(sum / dataArray.length)
        
        // Convert to 0-100 scale
        const level = Math.min(100, Math.round((rms / 255) * 100))
        
        // Update peak volume (highest level in last 3 seconds)
        if (level > peakVolumeRef.current) {
          peakVolumeRef.current = level
          
          // Reset peak after 3 seconds
          if (peakTimeoutRef.current) {
            clearTimeout(peakTimeoutRef.current)
          }
          peakTimeoutRef.current = setTimeout(() => {
            peakVolumeRef.current = 0
            setVolume(prev => ({ ...prev, peak: 0 }))
          }, 3000)
        }
        
        // Check for clipping (level > 95%)
        const clipped = level > 95
        
        setVolume({
          level,
          peak: peakVolumeRef.current,
          clipped
        })
        
        volumeAnimationFrameRef.current = requestAnimationFrame(analyzeVolume)
      }
      
      analyzeVolume()
    } catch (err) {
      console.error('Error starting audio monitoring:', err)
    }
  }, [])
  
  const stopMonitoring = useCallback(() => {
    if (volumeAnimationFrameRef.current) {
      cancelAnimationFrame(volumeAnimationFrameRef.current)
    }
    if (peakTimeoutRef.current) {
      clearTimeout(peakTimeoutRef.current)
    }
    setVolume({ level: 0, peak: 0, clipped: false })
    peakVolumeRef.current = 0
  }, [])
  
  const startRecording = useCallback(async () => {
    if (!selectedDeviceId) {
      setError('Please select a microphone device first.')
      return
    }
    
    setError(null)
    setIsLoading(true)
    
    try {
      // Get audio stream from selected device
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: { exact: selectedDeviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      // Start monitoring volume
      startMonitoring(stream)
      
      // Setup MediaRecorder
      const mimeType = 'audio/webm;codecs=opus'
      let mediaRecorder: MediaRecorder
      
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType })
      } catch (err) {
        // Fallback to default mime type
        mediaRecorder = new MediaRecorder(stream)
      }
      
      mediaRecorderRef.current = mediaRecorder
      recordingChunksRef.current = []
      
      // Collect data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordingChunksRef.current.push(event.data)
        }
      }
      
      // Handle recording completion
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        const recording: AudioRecording = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          duration: Date.now() - recordingStartTimeRef.current,
          blob,
          url
        }
        
        setRecordings(prev => [recording, ...prev])
        setRecordingDuration(0)
      }
      
      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      recordingStartTimeRef.current = Date.now()
      setIsRecording(true)
      
      // Update duration every second
      const durationInterval = setInterval(() => {
        setRecordingDuration(Date.now() - recordingStartTimeRef.current)
      }, 100)
      
      // Store interval ID for cleanup
      ;(mediaRecorder as any).durationInterval = durationInterval
      
    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.')
      console.error('Error starting recording:', err)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedDeviceId, startMonitoring])
  
  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return
    
    try {
      // Stop MediaRecorder
      mediaRecorderRef.current.stop()
      
      // Clear duration interval
      const interval = (mediaRecorderRef.current as any).durationInterval
      if (interval) {
        clearInterval(interval)
      }
      
      // Stop monitoring
      stopMonitoring()
      
      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      setIsRecording(false)
    } catch (err) {
      console.error('Error stopping recording:', err)
      setError('Failed to stop recording properly.')
    }
  }, [stopMonitoring])
  
  const discardRecording = useCallback((id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id))
  }, [])
  
  const deleteRecording = useCallback((id: string) => {
    const recording = recordings.find(r => r.id === id)
    if (recording) {
      URL.revokeObjectURL(recording.url)
    }
    setRecordings(prev => prev.filter(r => r.id !== id))
  }, [recordings])
  
  const playRecording = useCallback((id: string) => {
    const recording = recordings.find(r => r.id === id)
    if (recording) {
      const audio = new Audio(recording.url)
      audio.play()
    }
  }, [recordings])
  
  const stopPlayback = useCallback(() => {
    // Stop all audio elements
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
  }, [])
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  return (
    <AudioContext.Provider
      value={{
        devices,
        selectedDeviceId,
        isLoading,
        error,
        isRecording,
        recordingDuration,
        recordings,
        volume,
        enumerateDevices,
        selectDevice,
        startRecording,
        stopRecording,
        discardRecording,
        deleteRecording,
        playRecording,
        stopPlayback,
        clearError
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
