'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

export function PricingPage() {
  return (
    <div className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-slate-900">
            Des tarifs simples, adaptés à votre rythme
          </h1>
          <p className="text-xl text-slate-600">
            Choisissez le plan qui correspond à la fréquence de vos réunions. Profitez de toute la
            puissance de notre IA dès le premier jour.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <div className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="mb-2 text-2xl font-bold text-slate-900">Essentiel</h3>
            <p className="mb-6 h-12 text-slate-500">
              Le plan idéal pour les églises organisant un culte principal par semaine.
            </p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-slate-900">25$</span>
              <span className="font-medium text-slate-500"> / mois</span>
            </div>

            <ul className="mb-8 flex-1 space-y-4">
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <span className="font-medium text-slate-700">Jusqu&apos;à 4 prédications / mois</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <span className="text-slate-700">Enregistrement audio en direct</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <span className="text-slate-700">Transcription IA intégrale (Whisper)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <span className="text-slate-700">Résumé pastoral &amp; Points clés</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <span className="text-slate-700">Détection des versets bibliques</span>
              </li>
            </ul>

            <Link
              href="/login?plan=essentiel"
              className="block w-full rounded-xl bg-blue-50 py-3 px-4 text-center font-semibold text-blue-700 transition-colors hover:bg-blue-100"
            >
              Sélectionner ce plan
            </Link>
          </div>

          <div className="relative flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl ring-4 ring-blue-600 ring-opacity-20 md:-translate-y-4">
            <div className="absolute right-6 top-0 -translate-y-1/2">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Le plus populaire
              </span>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">Avancé</h3>
            <p className="mb-6 h-12 text-slate-400">
              Parfait pour les églises dynamiques ayant plusieurs réunions par semaine.
            </p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-white">55$</span>
              <span className="font-medium text-slate-400"> / mois</span>
            </div>

            <ul className="mb-8 flex-1 space-y-4">
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                <span className="font-medium text-white">Jusqu&apos;à 8 prédications / mois</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                <span className="text-slate-300">Toutes les fonctionnalités du plan Essentiel</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                <span className="text-slate-300">Support prioritaire de notre équipe</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                <span className="text-slate-300">Stockage audio étendu</span>
              </li>
            </ul>

            <Link
              href="/login?plan=avance"
              className="block w-full rounded-xl bg-blue-600 py-3 px-4 text-center font-semibold text-white shadow-lg shadow-blue-900 transition-colors hover:bg-blue-500"
            >
              Sélectionner ce plan
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500">
            Vous avez des besoins plus importants ?{' '}
            <a
              href="mailto:contact@kvoice.com"
              className="font-medium text-blue-600 hover:underline"
            >
              Contactez-nous pour un plan sur-mesure
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
