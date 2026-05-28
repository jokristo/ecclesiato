'use client';

import Link from 'next/link';
import { Mic, FileText, Sparkles, ArrowRight, Activity } from 'lucide-react';

export function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-white pb-32 pt-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" />
            <span>L&apos;IA au service de votre message pastoral</span>
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            Valorisez chaque prédication <br className="hidden md:block" />
            <span className="text-blue-600">sans effort supplémentaire.</span>
          </h1>
          <p className="mx-auto mb-10 mt-4 max-w-2xl text-xl text-slate-600">
            K-Voice capture l&apos;audio de vos cultes, retranscrit fidèlement votre message et
            génère automatiquement des résumés, des points clés et des références bibliques.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login?callbackUrl=/record"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700"
            >
              <Mic className="h-5 w-5" />
              Commencer l&apos;enregistrement
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Voir les offres
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Une technologie invisible, des résultats concrets
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Pensé pour les équipes média et les pasteurs, K-Voice simplifie votre flux de
              travail.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Activity className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Enregistrement Studio</h3>
              <p className="text-slate-600">
                Enregistrez directement depuis votre navigateur avec un monitoring vocal en temps
                réel. Qualité audio optimale garantie.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Transcription Fidèle</h3>
              <p className="text-slate-600">
                Conversion précise de l&apos;audio en texte. L&apos;IA respecte le contexte
                liturgique, y compris les insertions en lingala.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Analyse Intelligente</h3>
              <p className="text-slate-600">
                Génération automatique d&apos;un résumé pastoral, extraction des thèmes clés et
                détection des versets bibliques cités.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex-1">
            <h2 className="mb-6 text-3xl font-bold text-slate-900">
              Ne perdez plus jamais la trace d&apos;un message fort.
            </h2>
            <p className="mb-6 text-justify text-lg text-slate-600">
              Grâce à notre tableau de bord intuitif, retrouvez facilement l&apos;historique de
              toutes vos prédications. Partagez les notes générées avec votre communauté,
              alimentez vos réseaux sociaux et vos newsletters en quelques clics.
            </p>
            <ul className="mb-8 space-y-4">
              <li className="flex items-center gap-3 text-slate-700">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <ArrowRight className="h-4 w-4" />
                </div>
                Espaces isolés et sécurisés par église.
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <ArrowRight className="h-4 w-4" />
                </div>
                Gestion fine des rôles (Admin, Éditeur, Membre).
              </li>
            </ul>
          </div>
          <div className="flex-1">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop"
                alt="Table de mixage et logiciel d'enregistrement audio"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
