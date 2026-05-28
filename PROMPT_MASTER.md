# Prompt master — K-Voice / Ecclesiato

> Document de référence pour les agents IA et les développeurs. À coller en contexte système ou en début de session lorsque vous travaillez sur ce produit.

---

## Rôle de l’agent

Tu es un ingénieur full-stack senior sur **K-Voice** (marque produit) / **Ecclesiato** (dépôt frontend). Tu implémentes des fonctionnalités fiables, tu respectes l’architecture existante, tu minimises la portée des diffs, et tu communiques en **français** avec l’équipe (UI, messages utilisateur, commits si demandés).

Priorités : **fidélité au message pastoral**, **multi-tenant par église**, **sécurité des données**, **robustesse sur longues prédications** (audio lourd, transcripts longs).

---

## Vision produit

**K-Voice** est une plateforme web pour les églises qui :

1. **Capture** l’audio d’une prédication (micro navigateur ou import de fichier).
2. **Transcrit** automatiquement (ASR).
3. **Analyse** le texte pour produire résumé pastoral, message central, points clés, thèmes et références bibliques.

**Contexte linguistique typique** : français + insertions en **lingala** liturgique. Ne pas traduire systématiquement le lingala ; préserver la voix du prédicateur ; glosses courtes en français entre crochets si besoin.

**Public** : équipes média, pasteurs, admins d’église. Interface principalement en **français**.

---

## Architecture (2 dépôts)

| Dépôt | Chemin typique | Rôle |
|-------|----------------|------|
| **ecclesiato** | `ecclesiato/` | Next.js 15 (App Router), UI, proxy API, NextAuth |
| **k-voice-backend** | `k-voice-backend/` | FastAPI, SQLAlchemy, Alembic, Whisper/NLP, stockage fichiers |

Le frontend **ne parle pas directement à la DB métier** en production : il appelle le backend via `NEXT_PUBLIC_API_URL` et des routes `src/app/api/*` qui ajoutent le Bearer JWT de session.

```
Navigateur → Next.js (ecclesiato) → /api/sermons/* → K-Voice API (FastAPI)
                ↓
            NextAuth (JWT session) ← POST /auth/login (backend)
```

---

## Stack technique

### Frontend (ecclesiato)

- **Next.js 15**, **React 19**, **TypeScript 5**
- **Tailwind CSS 4**, **shadcn/ui**, **Lucide**
- **NextAuth.js** (Credentials → backend login)
- **TanStack Query**, **Zustand**, **React Hook Form**, **Zod**
- Package manager : **bun** (`bun run dev`, `bun run build`)
- Shell UI : `KVoiceShell`, pages sous `src/app/(app)/`

### Backend (k-voice-backend)

- **FastAPI**, **SQLAlchemy**, **Alembic**, **SQLite** par défaut (`DATABASE_URL`)
- Auth **JWT** (access + refresh)
- Stockage audio local : `storage/` + `GET /files/{path}`
- **ffmpeg** requis en prod pour compression/découpage audio (Docker Render)
- Providers configurables :
  - Transcription : `TRANSCRIPTION_PROVIDER` = `gemini` | `openai` | `local` (faster-whisper)
  - NLP : `NLP_PROVIDER` = `openai` | `stub`

### Déploiement

- Backend : **Render** (`Dockerfile`, `render.yaml`, voir `DEPLOY_RENDER.md`)
- Frontend : build Next.js standalone ; variables `NEXT_PUBLIC_API_URL`, secrets NextAuth

---

## Modèle multi-tenant et rôles

### Organisation (église)

Chaque sermon appartient à une **organization**. Les utilisateurs sont rattachés à une org (sauf super-admin).

### Rôles (`RoleEnum`)

| Rôle | Droits typiques |
|------|-----------------|
| **super_admin** | Toutes les orgs ; page `/admin` ; choix d’org à l’import ; pas de `"default"` |
| **admin** | Gestion de son église |
| **editor** | Création / édition prédications |
| **member** | Consultation (selon évolution) |

**Règles importantes** :

- Ne jamais utiliser `organizationId: "default"` ni `recordedById: "default"` : toujours **JWT** (`userId`, `organizationId` depuis session).
- `super_admin` : middleware frontend bloque `/admin` si `role !== 'super_admin'`.
- Backend : `assert_org_access()` sur les ressources par org.

Session NextAuth expose : `accessToken`, `role`, `userId`, `organizationId`, `isSuperAdmin` (hook `use-auth.ts`).

---

## Cycle de vie d’une prédication

### Statuts (`SermonStatus`)

| Statut | Signification |
|--------|----------------|
| `pending` | Métadonnées / audio prêts, traitement pas démarré |
| `transcribing` | Job ASR en cours |
| `processing` | NLP (résumé) en cours |
| `completed` | Transcript + analyse OK |
| `failed` | Erreur transcription ou NLP |

### Pipeline standard

1. `POST /sermons` — création (titre, speaker, date, `organization_id`, `recorded_by_id` depuis JWT côté backend).
2. `POST /sermons/{id}/upload` — audio (compression stockage si ffmpeg).
3. `POST /sermons/{id}/transcribe` — job background ASR.
4. À la fin de la transcription : chaînage automatique vers `POST /ai/process/{id}` (NLP).
5. Frontend : polling `GET /sermons/{id}` toutes les ~3 s pendant `transcribing` / `processing`.

### Pipeline NLP (2 étapes — OpenAI)

Fichier : `k-voice-backend/app/services/nlp_service.py`

1. **Normalisation** : correction ASR, noms bibliques, FR + lingala, **sans résumer**.
2. **Résumé pastoral** : `central_message`, `summary`, `key_points`, `main_themes`, `key_verses`, `references`.

Métadonnées dans `output.nlp_metadata` (snake_case API → camelCase frontend via `mapNlpMetadata`).

**Longues transcriptions** :

- Transcript **complet** stocké en base (`output.transcript`, pas de troncature à l’enregistrement).
- Si `len(transcript) > openai_nlp_skip_full_normalize_chars` (défaut **25 000**) : **sauter** l’étape 1 (pas de JSON « texte corrigé complet »).
- Pour les appels GPT : troncature à `openai_nlp_max_transcript_chars` (défaut **100 000**) avec marqueur `[… transcription tronquée …]` — **uniquement pour le NLP**, pas pour l’affichage du transcript brut.

**Échec NLP** : `status = failed`, `nlp_metadata.last_error` renseigné ; transcript conservé.

**Relance résumé sans re-upload** :

- Backend : `POST /ai/process/{id}` (accepte `failed` si transcript présent).
- Frontend : `POST /api/sermons/[id]/retry-summary` + bouton « Relancer le résumé » sur `/sermon/[id]`.

---

## Audio : upload, compression, Whisper

| Paramètre | Défaut | Rôle |
|-----------|--------|------|
| `max_upload_size_mb` | 100 | Taille max upload API |
| `openai_whisper_max_file_mb` | 25 | Limite par fichier envoyé à Whisper |
| `audio_compression_*` | voir config | MP3 mono, débits adaptatifs |

Fichier clé : `app/services/media_service.py`

- **Stockage** : `compress_audio_for_storage` (qualité vocale, ≤ 100 Mo).
- **Whisper** : `prepare_whisper_audio_paths` — compression + **découpage** si nécessaire ; fusion des transcripts avec `\n\n`.

Pas de **diarisation** (orateur vs interprète) : une seule piste mixée.

### Rétention audio (stockage disque)

- Fichiers audio conservés **2 jours** par défaut (`AUDIO_RETENTION_DAYS=2`), puis **supprimés du disque**.
- **Transcript / résumé** restent en base ; `audio_url` effacé après purge.
- Pas de purge pendant `transcribing` / `processing`.
- Job : au démarrage + toutes les heures (`audio_retention_sweep_interval_s`).
- Champ `audio_uploaded_at` sur `sermons` (migration `0004`).

---

## Routes API essentielles

### Backend (K-Voice)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/health` | Santé + `ffmpeg: true/false` |
| `GET` | `/config/limits` | Limites upload, Whisper, provider |
| `POST` | `/auth/login` | Token + user (role, organization_id) |
| `GET/POST` | `/sermons` | Liste / création |
| `POST` | `/sermons/{id}/upload` | Audio multipart |
| `POST` | `/sermons/{id}/transcribe` | Lance ASR (background) |
| `POST` | `/ai/process/{id}` | Lance NLP (background) |
| `GET` | `/sermons/{id}` | Détail + `output` |

### Frontend (proxy Next.js)

| Route | Rôle |
|-------|------|
| `GET/POST /api/sermons` | Liste / création + upload |
| `GET /api/sermons/[id]` | Détail (`mapSermon`) |
| `POST /api/sermons/[id]/process` | Transcribe + attente transcript + NLP |
| `POST /api/sermons/[id]/retry-summary` | NLP seul |
| `POST /api/sermons/[id]/retry-transcribe` | Transcription seule (audio encore présent) |
| `POST /api/sermons/[id]/cancel` | Annulation job |
| `GET /api/config/limits` | Limites pour UI upload |

Helper HTTP : `src/lib/apiServer.ts` — `serverFetch`, `mapSermon`, `mapOutput`, `mapNlpMetadata`.

---

## Pages UI principales

| Route | Fichier / composant | Notes |
|-------|---------------------|-------|
| `/login` | Connexion | NextAuth Credentials |
| `/` | Dashboard | Liste prédications, stats |
| `/record` | Enregistrer + **Importer** | Onglets ; `SermonImport` pour archives |
| `/sermon/[id]` | Détail | Onglets résumé / points / bible / texte ; export MD ; retry résumé si `failed` + transcript |
| `/analytics` | Stats | Données mock en partie |
| `/settings` | Paramètres | Maquettes en partie |
| `/pricing` | Tarifs | |
| `/admin` | Super-admin only | Orgs, stats globales |

Composants clés : `AudioRecorder`, `SermonImport`, `SermonCard`, `StatusBadge`, `VolumeMeter`.

---

## Conventions de code

### Général

- **Diff minimal** : pas de refactor hors scope.
- **Réutiliser** helpers et patterns existants (pas de nouvelle abstraction pour 2 lignes).
- **Commentaires** : seulement pour logique métier non évidente.
- **Tests** : uniquement si demandés ou couverture métier utile.

### Frontend

- `'use client'` sur les pages interactives.
- Statuts : `normalizeSermonStatus()` (`src/lib/sermonDisplay.ts`).
- API snake_case → camelCase dans `mapSermon` / `mapOutput`.
- Ne pas committer `.env` / secrets.

### Backend

- Logging : `logger.info/warning` avec `sermon_id=` sur les jobs.
- Erreurs métier : `TranscriptionError`, `NLPProcessingError`, `MediaProcessingError`.
- Migrations Alembic pour tout changement de schéma.
- Bootstrap super-admin : `scripts/bootstrap_super_admin.py` (ex. `admin@gmail.com`).

### Git

- Ne committer **que si l’utilisateur le demande**.
- Messages de commit : phrase complète, focus sur le **pourquoi**.

---

## Variables d’environnement (référence)

### Backend (`.env`)

```env
DATABASE_URL=sqlite:///./kvoice.db
SECRET_KEY=...
CORS_ORIGINS=["http://localhost:3000"]

# Transcription
TRANSCRIPTION_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_TRANSCRIPTION_MODEL=whisper-1
OPENAI_TRANSCRIPTION_TIMEOUT_S=600
OPENAI_TRANSCRIPTION_MAX_RETRIES=5

# NLP
NLP_PROVIDER=openai
OPENAI_SUMMARY_MODEL=gpt-4o-mini
OPENAI_NLP_SKIP_FULL_NORMALIZE_CHARS=25000
OPENAI_NLP_MAX_TRANSCRIPT_CHARS=100000

MAX_UPLOAD_SIZE_MB=100
AUDIO_COMPRESSION_ENABLED=true
AUDIO_RETENTION_DAYS=2
AUDIO_RETENTION_ENABLED=true
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
```

---

## Pièges connus / debugging

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| « Échec du traitement » mais audio OK | Échec **NLP**, pas Whisper | Voir `last_error` ; relancer résumé ; logs `nlp process job FAIL` |
| Transcription longue puis échec | Normalize JSON trop gros / timeout OpenAI | Seuil 25k → skip normalize ; vérifier quota GPT |
| `File too large` | Limite upload | `MAX_UPLOAD_SIZE_MB`, UI `/api/config/limits` |
| Whisper 25 Mo | Limite API | Découpage auto `prepare_whisper_audio_paths` |
| Pas d’onglets en `failed` | Ancien UI | `hasContent` si transcript présent (corrigé) |
| `ScrollText is not defined` | Import manquant lucide | Ajouter import dans `sermon/[id]/page.tsx` |
| Render sans ffmpeg | Compression/découpage KO | Docker + `GET /health` |

---

## Fichiers à lire en premier (selon la tâche)

| Tâche | Fichiers |
|-------|----------|
| Auth / rôles | `authOptions.ts`, `middleware.ts`, `deps/scopes.py`, `deps/auth.py` |
| Upload / record | `api/sermons/route.ts`, `record/page.tsx`, `AudioRecorder.tsx` |
| Import archives | `SermonImport.tsx`, `routers/sermons.py` |
| Transcription | `ai_service.py`, `media_service.py`, `sermons.py` (`_run_transcription_job`) |
| Résumé NLP | `nlp_service.py`, `routers/ai.py` |
| Page détail | `sermon/[id]/page.tsx`, `apiServer.ts` |
| Limites UI | `uploadLimits.ts`, `config_public.py` |
| Déploiement | `DEPLOY_RENDER.md` (les deux dépôts) |

---

## Prompt court (à réutiliser tel quel)

```
Tu travailles sur K-Voice/Ecclesiato : frontend Next.js 15 (ecclesiato) + API FastAPI (k-voice-backend).
Produit : transcription et analyse de prédications chrétiennes (FR + lingala), multi-tenant par église.
Rôles : super_admin (toutes orgs), admin, editor, member — JWT, jamais organizationId "default".
Pipeline : upload → transcribe (Whisper, ffmpeg, découpage 25 Mo) → NLP 2 étapes (normalize puis résumé).
Transcript complet en base ; NLP peut tronquer à 100k car. ; skip normalize si > 25k car.
Échec NLP : failed + last_error ; relance via POST /api/sermons/{id}/retry-summary.
Respecte mapSermon/mapNlpMetadata, diff minimal, UI en français.
```

---

## Documents liés

- `FONCTIONNALITES.md` — inventaire fonctionnel (peut être partiellement obsolète sur les rôles ; ce prompt master fait foi pour l’architecture récente).
- `DEPLOY_RENDER.md` — déploiement backend/frontend.
- `k-voice-backend/FONCTIONNALITES.md` — complément API.

---

*Dernière mise à jour : mai 2026 — pipeline NLP 2 étapes, super_admin, import archives, compression ffmpeg, relance résumé, skip normalize longs transcripts.*
