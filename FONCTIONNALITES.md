# K-Voice (Ecclesiato) — Fonctionnalités de l'application

**K-Voice** est une plateforme web de transcription et d'analyse de prédications pour les églises. Elle permet d'enregistrer l'audio d'un sermon, de le transcrire automatiquement via l'IA, puis d'en extraire un résumé, des points clés et des références bibliques.

---

## Vue d'ensemble

| Élément | Détail |
|--------|--------|
| **Nom** | K-Voice |
| **Projet** | Ecclesiato |
| **Public cible** | Églises, équipes média, pasteurs |
| **Langue de l'interface** | Français (principalement) |
| **Architecture** | Frontend Next.js 15 + backend K-Voice (API REST) |

---

## Navigation et pages

L'application est organisée autour d'un shell commun (`KVoiceShell`) avec une barre de navigation :

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Connexion | Authentification par email / mot de passe |
| `/` | Dashboard | Vue d'ensemble des prédications et statistiques rapides |
| `/record` | Enregistrer | Capture audio et envoi vers le serveur |
| `/sermon/[id]` | Détail prédication | Consultation du résumé, points clés et transcription |
| `/analytics` | Statistiques | Graphiques et métriques d'activité |
| `/pricing` | Abonnement | Plans tarifaires et FAQ |
| `/settings` | Paramètres | Profil, organisation, notifications, sécurité, facturation |

---

## Authentification et sécurité

### Connexion
- Page de connexion dédiée (`/login`) avec formulaire email / mot de passe
- Affichage / masquage du mot de passe
- Messages d'erreur en cas d'identifiants incorrects
- Redirection vers le dashboard après connexion réussie

### Gestion de session
- Authentification via **NextAuth.js** (stratégie JWT, session 7 jours)
- Connexion au backend K-Voice via `POST /auth/login`
- Stockage du token Bearer (`accessToken`) et du rôle utilisateur dans la session
- Déconnexion depuis la barre de navigation

### Protection des routes
- Middleware NextAuth protégeant toutes les routes sauf :
  - `/login`
  - `/api/auth/*`
  - Assets publics (`_next`, `favicon`, `robots.txt`, etc.)

### Rôles utilisateur
- **admin** — administrateur
- **editor** — éditeur
- **member** — membre (par défaut)

> Les rôles sont exposés côté client (`isAdmin`, `isEditor`) mais les permissions granulaires par page ne sont pas encore appliquées.

---

## Enregistrement audio

### Configuration du micro
- Détection automatique des périphériques d'entrée audio (Web Audio API)
- Sélection du microphone via un menu déroulant
- Bouton de rafraîchissement de la liste des périphériques
- Demande de permission micro au navigateur
- Indicateur « périphérique prêt »

### Monitoring en temps réel
- **VolumeMeter** : jauge de niveau d'entrée en temps réel
- Affichage approximatif en décibels
- Détection du **clipping** (saturation audio) avec alerte visuelle
- Indicateur de pic sur 3 secondes
- Marqueurs de repère (-∞, -20, -10, -6, 0 dB)
- Conseils d'enregistrement (niveaux cibles, type de micro, réduction de bruit)

### Contrôles d'enregistrement
- Démarrer / arrêter l'enregistrement
- Format audio : `audio/webm;codecs=opus` (48 kHz, sans echo cancellation / noise suppression)
- Chronomètre de durée pendant l'enregistrement
- Liste des enregistrements locaux avec :
  - Horodatage
  - Durée
  - Lecteur audio intégré (preview)
  - Lecture rapide
  - Suppression / abandon

### Métadonnées du sermon
- Saisie du **titre**, du **prédicateur** et de la **date** avant upload
- Préremplissage depuis la page d'enregistrement
- Validation des champs obligatoires via une boîte de dialogue

### Upload et traitement
- Upload multipart vers `POST /api/sermons`
- Barre de progression simulée pendant l'upload
- Déclenchement automatique du pipeline IA via `POST /api/sermons/[id]/process`
- États visuels : idle → uploading → processing → done / error
- Possibilité de réessayer en cas d'échec
- Affichage en direct des résultats (`SermonOutput`) après envoi

---

## Gestion des prédications

### Dashboard (`/`)
- **Statistiques rapides** :
  - Total des prédications
  - Terminées (transcrites et résumées)
  - En traitement (transcription ou analyse)
  - En attente
- **Liste des prédications récentes** sous forme de cartes (`SermonCard`)
- Bouton « Nouvelle prédication » vers `/record`
- État vide avec message d'invitation

### Carte prédication (`SermonCard`)
- Titre, prédicateur, date, durée
- Badge de statut coloré
- Thème principal (si disponible)
- Lien vers la page de détail

### Statuts de traitement
| Statut | Label | Description |
|--------|-------|-------------|
| `pending` | En attente | Audio uploadé, traitement non démarré |
| `transcribing` | Transcription… | Conversion audio → texte en cours |
| `processing` | Traitement… | Génération du résumé et des insights |
| `completed` | Terminé | Traitement terminé avec succès |
| `failed` | Échec | Erreur lors de la transcription ou de l'analyse |

### Page de détail (`/sermon/[id]`)
- Informations : prédicateur, date, durée
- Alertes contextuelles selon le statut
- Onglets :
  - **Résumé** — synthèse de la prédication
  - **Points clés** — liste numérotée
  - **Transcription** — texte intégral par paragraphes
- Affichage du thème principal (si terminé)
- Boutons **Partager** et **Exporter** (interface présente, logique non connectée)

### Filtrage API (backend)
- Filtrage par `organizationId`, `status`, `speaker` via query params sur `GET /api/sermons`

---

## Traitement par intelligence artificielle

### Pipeline de traitement
1. **Upload audio** — création du sermon + fichier audio sur le backend K-Voice
2. **Transcription (ASR)** — `POST /sermons/{id}/transcribe` (modèle Whisper v3)
3. **Attente du transcript** — polling jusqu'à disponibilité (max ~3 min)
4. **Analyse NLP** — `POST /ai/process/{id}` pour résumé, points clés, thèmes et versets

### Résultats générés (`SermonOutput`)
| Donnée | Description |
|--------|-------------|
| **Transcription complète** | Texte intégral du sermon |
| **Résumé** | Synthèse en 2–3 paragraphes |
| **Points clés** | 5 à 7 idées principales |
| **Thèmes principaux** | 3 à 5 thèmes (badges) |
| **Versets bibliques** | Références avec citation et contexte |
| **Références mentionnées** | Liste complète des références détectées |
| **Métadonnées** | Nombre de mots, temps de lecture estimé, durée de traitement |

### Affichage des résultats
- Polling automatique toutes les 2 secondes (`/api/sermons/[id]/status`)
- Barre de progression (% selon le statut)
- Onglets : Summary, Transcript, Key Points, Biblical Verses
- Cartes statistiques (mots, temps de lecture, points clés, versets)
- **Copier** le contenu dans le presse-papier (résumé, transcription, points, versets)
- Bouton **Télécharger** la transcription (interface présente)

### Service local alternatif
Un service `SermonProcessingService` existe dans le code (`src/lib/services/sermonProcessing.ts`) avec :
- Transcription ASR via `z-ai-web-dev-sdk`
- Résumé et extraction via LLM (GPT-4)
- Extraction des références bibliques
- Persistance Prisma locale

> En production, le frontend s'appuie principalement sur le **backend K-Voice** ; le service local sert de pipeline alternatif / de développement.

---

## Statistiques (`/analytics`)

Page de visualisation des métriques d'activité :

### Indicateurs clés (KPI)
- Total prédications (+ évolution %)
- Durée moyenne par prédication
- Nombre de prédicateurs actifs
- Fréquence (prédications / semaine)

### Graphiques (Recharts)
- **Évolution mensuelle** — courbe du nombre de prédications
- **Durée totale par mois** — histogramme en minutes
- **Répartition par prédicateur** — diagramme circulaire
- **Thèmes les plus abordés** — barres horizontales

### Filtres
- Sélecteur de période : semaine, mois, trimestre, année

### Classement
- Top des prédications « populaires » (vues / partages)

> **Note :** les données affichées sont actuellement des **données de démonstration** (mock). La connexion aux vraies données du backend n'est pas encore implémentée.

---

## Paramètres (`/settings`)

Interface organisée en 5 onglets :

### Profil
- Photo de profil (avatar)
- Prénom, nom, email, rôle, téléphone
- Bouton « Enregistrer les modifications » (toast de confirmation)

### Organisation
- Nom de l'église, adresse, email, téléphone, site web
- Liste des membres de l'équipe avec rôles (Administrateur, Éditeur)
- Bouton « Inviter un membre »

### Notifications
- Notifications par email (on/off)
- Alerte « transcription terminée »
- Rapport hebdomadaire

### Sécurité
- Changement de mot de passe
- Authentification à deux facteurs (2FA)
- Gestion des sessions actives (révoquer)

### Facturation
- Plan actuel (Gratuit — 5 prédications / mois)
- Historique de facturation
- Ajout d'une carte bancaire
- Bouton « Passer à Premium »

> **Note :** la plupart de ces écrans sont des **maquettes UI** avec des valeurs par défaut. La persistance réelle des paramètres n'est pas encore connectée au backend.

---

## Abonnement et tarification (`/pricing`)

### Plans disponibles

| Plan | Prix | Caractéristiques |
|------|------|------------------|
| **Gratuit** | 0 €/mois | 5 prédications/mois, transcription auto, résumé basique, stockage 1 mois, 1 utilisateur, support email |
| **Premium** | 29 €/mois | Prédications illimitées, transcription avancée, résumé détaillé + points clés, stockage illimité, 5 utilisateurs, export PDF/Word, partage, stats détaillées, support prioritaire |
| **Entreprise** | Sur mesure | Tout Premium + utilisateurs illimités, multi-églises, API, marque blanche, support 24/7, formation, SLA, serveur dédié |

### FAQ intégrée
- Fonctionnement de l'essai gratuit
- Changement de plan
- Conservation des données après annulation
- Transparence des tarifs

---

## API REST (proxy Next.js)

Le frontend expose des routes API qui relaient les appels vers le backend K-Voice (`NEXT_PUBLIC_API_URL`) avec le token Bearer de la session.

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/sermons` | Liste des prédications (filtres : org, status, speaker) |
| `POST` | `/api/sermons` | Création + upload audio |
| `GET` | `/api/sermons/[id]` | Détail d'une prédication |
| `DELETE` | `/api/sermons/[id]` | Non supporté (501) |
| `GET` | `/api/sermons/[id]/status` | Statut et progression du traitement |
| `GET` | `/api/sermons/[id]/output` | Résultats IA (transcription, résumé, etc.) |
| `POST` | `/api/sermons/[id]/process` | Lance transcription + analyse NLP |
| `*` | `/api/auth/[...nextauth]` | Endpoints NextAuth |

---

## Modèle de données (Prisma / SQLite)

Architecture **multi-tenant** orientée églises :

### Organization (Église)
- Nom, slug, adresse, téléphone, email, logo
- Relation : utilisateurs, prédications

### User (Membre d'équipe)
- Email, nom, mot de passe, rôle, avatar
- Appartenance à une organisation

### Sermon (Prédication)
- Titre, prédicateur (`speaker`), date, description
- Métadonnées audio : URL, taille, durée, format
- Statut de traitement + horodatages (`transcribedAt`, `processedAt`)
- Liens : organisation, enregistreur

### SermonOutput (Résultats IA)
- Transcription, nombre de mots
- Résumé, points clés (JSON), thèmes (JSON)
- Versets clés et références (JSON)
- Temps de lecture estimé, durée de traitement, modèle IA

---

## Stack technique

### Frontend
- **Next.js 15** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (Radix UI)
- **Framer Motion**, **Lucide React**, **Recharts**
- **React Hook Form** + **Zod**
- **TanStack Query** + **Zustand**
- **NextAuth.js** pour l'authentification
- **next-intl** (prévu pour l'i18n)

### Audio
- Web Audio API (`AnalyserNode`) — monitoring du volume
- MediaRecorder API — capture audio WebM/Opus
- `navigator.mediaDevices` — sélection du micro

### Backend / IA
- API REST K-Voice (FastAPI ou équivalent sur port 8000)
- ASR Whisper v3 pour la transcription
- LLM pour résumé, points clés et références bibliques
- SDK `z-ai-web-dev-sdk` (pipeline local alternatif)

### Base de données
- **Prisma ORM** + **SQLite** (schéma local)
- Backend K-Voice avec sa propre persistance

### Déploiement
- Build standalone Next.js
- Scripts : `bun run dev`, `bun run build`, `bun start`
- Commandes Prisma : `db:push`, `db:migrate`, `db:reset`

---

## Récapitulatif : implémenté vs prévu

| Fonctionnalité | Statut |
|----------------|--------|
| Connexion / déconnexion | ✅ Implémenté |
| Protection des routes | ✅ Implémenté |
| Enregistrement audio navigateur | ✅ Implémenté |
| Sélection micro + monitoring volume | ✅ Implémenté |
| Upload et création de sermon | ✅ Implémenté |
| Pipeline transcription + NLP | ✅ Implémenté (via backend K-Voice) |
| Dashboard et liste des prédications | ✅ Implémenté |
| Détail prédication avec onglets | ✅ Implémenté |
| Polling statut et résultats en temps réel | ✅ Implémenté |
| Copier transcription / résumé | ✅ Implémenté |
| Statistiques analytics | 🟡 UI avec données mock |
| Paramètres (profil, org, notifs, sécu) | 🟡 UI seulement |
| Partager / exporter une prédication | 🟡 Boutons UI non connectés |
| Télécharger la transcription | 🟡 Bouton UI non connecté |
| Gestion des membres / invitations | 🟡 UI seulement |
| Facturation / paiement Stripe | 🟡 UI seulement |
| Plans Premium / Entreprise | 🟡 Affichage tarifaire |
| Suppression de prédication | ❌ Non supporté (501) |
| Permissions par rôle (admin/editor) | 🟡 Rôles exposés, non appliqués |
| Multi-églises (Entreprise) | 🔜 Prévu dans le plan Entreprise |
| Export PDF / Word | 🔜 Prévu plan Premium |
| API publique documentée | 🔜 Prévu plan Entreprise |

**Légende :** ✅ Fonctionnel · 🟡 Partiel / maquette · ❌ Non disponible · 🔜 Prévu

---

## Variables d'environnement

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_API_URL` | URL du backend K-Voice (défaut : `http://localhost:8000`) |
| `NEXTAUTH_SECRET` | Secret de chiffrement des sessions NextAuth |
| `DATABASE_URL` | Connexion SQLite pour Prisma |

---

*Document généré à partir de l'analyse du code source du projet Ecclesiato / K-Voice.*
