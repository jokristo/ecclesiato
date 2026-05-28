# Rapport — tests cœur produit & rétention audio

*Généré le 28 mai 2026*

## Rétention audio (nouvelle règle métier)

| Paramètre | Défaut | Description |
|-----------|--------|-------------|
| `AUDIO_RETENTION_ENABLED` | `true` | Active la purge |
| `AUDIO_RETENTION_DAYS` | `2` | Durée de conservation des fichiers sur disque |
| `AUDIO_RETENTION_SWEEP_INTERVAL_S` | `3600` | Passage du job toutes les heures |

**Comportement :**

- À l’**upload** : `audio_uploaded_at` est renseigné.
- Après **2 jours** : le fichier est **supprimé du disque** ; `audio_url`, taille, durée, format sont effacés en base.
- La **transcription et le résumé** restent dans `sermon_outputs`.
- **Pas de purge** pendant `transcribing` ou `processing`.
- Migration : `alembic upgrade head` (révision `0004_audio_uploaded_at`).

## Tests exécutés

### Backend — unitaires (pytest)

```
8 passed (0.49s)
```

| Test | Résultat |
|------|----------|
| Pas de purge si `transcribing` | OK |
| Purge si audio > 2 jours | OK |
| Pas de purge si upload récent | OK |
| Repli `updated_at` sans `audio_uploaded_at` | OK |
| `purge_expired_audio` commit + 1 fichier | OK |
| Troncature NLP | OK |
| Skip normalize si texte > seuil | OK |

Commande :

```bash
cd k-voice-backend
python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/python -m pytest tests/ -v
```

### Backend — imports modules cœur

```
[OK] nlp_service, ai_service, audio_retention, routers.ai, routers.sermons
```

### Frontend — routes & UI cœur (statique)

```
[OK] api/sermons, process, retry-summary, cancel, config/limits
[OK] page détail : retry-summary, Relancer le résumé, failed+hasTranscript
```

Commande :

```bash
node scripts/smoke-core-routes.mjs
```

### API live (HTTP) — 28 mai 2026

Serveur `http://localhost:8000` — **tous OK** :

| Test | Résultat |
|------|----------|
| `GET /health` | `ok`, `ffmpeg: true` |
| `GET /config/limits` | `audio_retention_days: 2`, upload 100 Mo |
| `POST /auth/login` | 200 |
| `GET /sermons` | 3 prédications |

**Relance résumé (E2E)** sur prédication `failed` (~30k caractères) :

- `POST /ai/process/{id}` → `Processing started`
- Après ~27 s → **`completed`**, résumé ~1049 caractères
- `normalize_skipped: true` (texte > 25k)
- `last_error` effacé

Commande :

```bash
API_URL=http://localhost:8000 SMOKE_EMAIL=admin@gmail.com SMOKE_PASSWORD=admin \
  k-voice-backend/.venv/bin/python k-voice-backend/scripts/smoke_test_core.py --live
```

## Ce qui n’est pas couvert par ces tests

- Upload réel multipart + Whisper + OpenAI (nécessite clés API et ffmpeg).
- Parcours navigateur complet (enregistrement micro, polling UI).
- Relance résumé E2E sur une prédication `failed` réelle.
- Charge / concurrence / Render production.

## Checklist manuelle recommandée

1. [ ] `GET /health` → `ffmpeg: true`
2. [ ] `GET /config/limits` → `audio_retention_days: 2`
3. [ ] Courte prédication → `completed`
4. [ ] Prédication en `failed` avec transcript → **Relancer le résumé**
5. [ ] Après 2 jours (ou test en baissant `AUDIO_RETENTION_DAYS=0` en dev) : fichier absent, transcript toujours là

## Déploiement

1. `alembic upgrade head` sur Render
2. Redémarrer le service backend (lifespan + job horaire)
3. Redéployer le frontend (limites + message import)
