'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Bell, Lock, Building2, CreditCard } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { toast } = useToast()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [transcriptionComplete, setTranscriptionComplete] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)

  const handleSave = () => {
    toast({ title: 'Paramètres enregistrés avec succès' })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
        <p className="mt-1 text-slate-600">Gérez vos préférences et votre compte</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid h-auto w-full max-w-2xl grid-cols-2 gap-1 sm:grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            Organisation
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Facturation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-indigo-100 text-2xl text-indigo-700">JD</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Changer la photo
                  </Button>
                  <p className="mt-1 text-sm text-slate-500">JPG, PNG ou GIF. Max 2 Mo.</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" defaultValue="Jean" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue="Dupont" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="jean.dupont@eglise.fr" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle dans l&apos;église</Label>
                <Input id="role" defaultValue="Pasteur principal" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" defaultValue="+33 6 12 34 56 78" />
              </div>

              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-600/90">
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l&apos;organisation</CardTitle>
              <CardDescription>Gérez les informations de votre église</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nom de l&apos;église</Label>
                <Input id="orgName" defaultValue="Église Évangélique de Paris" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgAddress">Adresse</Label>
                <Input id="orgAddress" defaultValue="123 rue de la Paix, 75001 Paris" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgEmail">Email de contact</Label>
                  <Input id="orgEmail" type="email" defaultValue="contact@eglise.fr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgPhone">Téléphone</Label>
                  <Input id="orgPhone" type="tel" defaultValue="+33 1 23 45 67 89" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgWebsite">Site web</Label>
                <Input id="orgWebsite" defaultValue="https://www.eglise-paris.fr" />
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 text-lg font-semibold">Membres de l&apos;équipe</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Jean Dupont', email: 'jean.dupont@eglise.fr', role: 'Administrateur' },
                    { name: 'Marie Martin', email: 'marie.martin@eglise.fr', role: 'Éditeur' },
                    { name: 'Pierre Durand', email: 'pierre.durand@eglise.fr', role: 'Éditeur' },
                  ].map((member, index) => (
                    <div
                      key={index}
                      className="flex flex-col justify-between gap-2 rounded-lg border p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-slate-100">
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">{member.role}</span>
                        <Button variant="ghost" size="sm">
                          Gérer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4">
                  Inviter un membre
                </Button>
              </div>

              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-600/90">
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>Configurez la façon dont vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Notifications par email</p>
                  <p className="text-sm text-slate-500">Recevoir des courriels de notification</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Événements à notifier</h3>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Transcription terminée</p>
                    <p className="text-sm text-slate-500">Lorsqu&apos;une prédication est transcrite</p>
                  </div>
                  <Switch checked={transcriptionComplete} onCheckedChange={setTranscriptionComplete} />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Rapport hebdomadaire</p>
                    <p className="text-sm text-slate-500">Résumé de vos prédications chaque semaine</p>
                  </div>
                  <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
                </div>
              </div>

              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-600/90">
                Enregistrer les préférences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du compte</CardTitle>
              <CardDescription>Gérez la sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium">Changer le mot de passe</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-600/90">Mettre à jour le mot de passe</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 font-medium">Authentification à deux facteurs</h3>
                <p className="mb-4 text-sm text-slate-600">
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </p>
                <Button variant="outline">Activer 2FA</Button>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 font-medium">Sessions actives</h3>
                <div className="space-y-3">
                  <div className="flex flex-col justify-between gap-2 rounded-lg border p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-medium">Paris, France</p>
                      <p className="text-sm text-slate-500">Chrome sur Windows — actif maintenant</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Révoquer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan actuel</CardTitle>
              <CardDescription>Gérez votre abonnement et vos paiements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
                <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Plan gratuit</h3>
                    <p className="text-slate-600">5 prédications par mois</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-3xl font-bold text-indigo-600">0€</p>
                    <p className="text-sm text-slate-600">/ mois</p>
                  </div>
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-600/90">Passer à Premium</Button>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 font-medium">Historique de facturation</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Aucune facture</p>
                      <p className="text-sm text-slate-500">Vous utilisez le plan gratuit</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 font-medium">Moyen de paiement</h3>
                <p className="mb-4 text-sm text-slate-600">Aucune méthode de paiement enregistrée</p>
                <Button variant="outline">Ajouter une carte</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
