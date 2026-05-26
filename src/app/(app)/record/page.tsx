'use client'

import { useEffect, useState } from 'react'
import { AudioProvider, useAudio } from '@/contexts/AudioContext'
import { AudioDeviceSelector } from '@/components/audio/AudioDeviceSelector'
import { VolumeMeter } from '@/components/audio/VolumeMeter'
import { AudioRecorder } from '@/components/audio/AudioRecorder'
import { SermonImport } from '@/components/k-voice/SermonImport'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileAudio, Volume2, Settings, Mic, Upload } from 'lucide-react'

function RecordTabContent({
  title,
  preacher,
}: {
  title: string
  preacher: string
}) {
  const { enumerateDevices } = useAudio()

  useEffect(() => {
    void enumerateDevices()
  }, [enumerateDevices])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" />
              Configuration audio
            </CardTitle>
            <CardDescription>
              Sélectionnez l’entrée et surveillez les niveaux en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <AudioDeviceSelector />
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <VolumeMeter />
            </div>
          </CardContent>
        </Card>

        <AudioRecorder
          uploadFormDefaults={{
            title: title.trim() || undefined,
            speaker: preacher.trim() || undefined,
          }}
        />
      </div>

      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileAudio className="h-5 w-5 text-indigo-600" />
              Moteur & traitement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>
              L’enregistrement utilise l’API Web Audio, puis l’upload vers K-Voice pour
              transcription et résumé automatiques.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-indigo-900">
              <Volume2 className="h-5 w-5" />
              Conseils
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-indigo-900/90">
              <li>• Ciblez des niveaux d’entrée entre -20 dB et -6 dB.</li>
              <li>• Un micro USB ou une prise ligne directe offre de meilleurs résultats.</li>
              <li>• Désactivez la réduction de bruit système si possible.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RecordPageInner() {
  const [title, setTitle] = useState('')
  const [preacher, setPreacher] = useState('')

  const formDefaults = {
    title: title.trim() || undefined,
    speaker: preacher.trim() || undefined,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Prédication</h1>
        <p className="mt-1 text-slate-600">
          Enregistrez en direct ou importez un fichier audio existant
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>
            Ces champs préremplissent l’envoi ; vous pourrez les modifier avant l’upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rec-title">Titre de la prédication</Label>
              <Input
                id="rec-title"
                placeholder="Ex. : La foi en action"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rec-preacher">Prédicateur</Label>
              <Input
                id="rec-preacher"
                placeholder="Ex. : Pasteur Jean Dupont"
                value={preacher}
                onChange={(e) => setPreacher(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="record" className="gap-2">
            <Mic className="h-4 w-4" />
            Enregistrer
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" />
            Importer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="mt-6">
          <AudioProvider>
            <RecordTabContent title={title} preacher={preacher} />
          </AudioProvider>
        </TabsContent>

        <TabsContent value="import" className="mt-6 max-w-2xl">
          <SermonImport uploadFormDefaults={formDefaults} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function RecordPage() {
  return <RecordPageInner />
}
