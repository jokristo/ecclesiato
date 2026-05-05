import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Zap, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Gratuit',
    price: '0€',
    period: '/ mois',
    description: 'Parfait pour découvrir K-Voice',
    icon: Zap,
    features: [
      '5 prédications par mois',
      'Transcription automatique',
      'Résumé basique',
      'Stockage 1 mois',
      '1 utilisateur',
      'Support courriel',
    ],
    buttonText: 'Plan actuel',
    buttonVariant: 'outline' as const,
    current: true,
  },
  {
    name: 'Premium',
    price: '29€',
    period: '/ mois',
    description: 'Pour les églises actives',
    icon: Crown,
    popular: true,
    features: [
      'Prédications illimitées',
      'Transcription avancée',
      'Résumé détaillé + points clés',
      'Stockage illimité',
      '5 utilisateurs',
      'Export PDF / Word',
      'Partage et collaboration',
      'Support prioritaire',
      'Statistiques détaillées',
    ],
    buttonText: 'Passer à Premium',
    buttonVariant: 'default' as const,
    current: false,
  },
  {
    name: 'Entreprise',
    price: 'Sur mesure',
    period: '',
    description: 'Pour les grandes organisations',
    icon: Building2,
    features: [
      'Tout le plan Premium',
      'Utilisateurs illimités',
      'Multi-églises',
      'API complète',
      'Image de marque personnalisée',
      'Support téléphonique 24/7',
      'Formation dédiée',
      'SLA garanti',
      'Serveur dédié (option)',
    ],
    buttonText: 'Nous contacter',
    buttonVariant: 'outline' as const,
    current: false,
  },
]

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Choisissez votre plan</h1>
        <p className="text-lg text-slate-600">
          Commencez gratuitement et passez à un plan supérieur quand vous êtes prêt
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? 'border-2 border-indigo-600 shadow-xl' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-indigo-600 px-4 py-1 text-white">Plus populaire</Badge>
                </div>
              )}

              <CardHeader className="pb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  {plan.period && <span className="text-slate-600">{plan.period}</span>}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  variant={plan.buttonVariant}
                  className={cn(
                    'w-full',
                    plan.buttonVariant === 'default' && 'bg-indigo-600 hover:bg-indigo-600/90',
                  )}
                  size="lg"
                  disabled={plan.current}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="mx-auto mt-16 max-w-3xl space-y-6">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">Questions fréquentes</h2>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comment fonctionne l&apos;essai gratuit ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Le plan gratuit permet jusqu&apos;à 5 prédications par mois avec transcription
              automatique. Aucune carte bancaire n&apos;est requise pour commencer.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Puis-je changer de plan à tout moment ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Oui, vous pouvez mettre à niveau ou rétrograder à tout moment. Les changements prennent
              effet immédiatement et la facturation est proratisée.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Que se passe-t-il pour mes données si j&apos;annule ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Vos prédications restent accessibles 30 jours après l&apos;annulation. Vous pouvez les
              exporter à tout moment durant cette période.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Y a-t-il des frais cachés ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Non, tous les tarifs sont transparents. Le prix affiché est le prix final, sans frais
              cachés.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
