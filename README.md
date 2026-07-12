# Makeup Try-On TMS

Virtual makeup try-on frontend for the Try My Style mirror platform. Built from the `flux_version_3` hair VTO foundation and wired to the shared `ADMIN---DJANGO` backend.

## Features

- **Lipstick** — 10 shades with RGB-accurate prompts
- **Blush** — 10 subtle cheek shades
- **Eyeshadow** — 10 eye makeup shades
- **Layering** — apply multiple effects in one Proceed, or chain more from the results screen
- Image edit pipeline via `salon/makeup/change/`

## Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS 4
- next-intl, axios, react-webcam
- Django REST API (`ADMIN---DJANGO`)

## Setup

```bash
cd makeup_tms
npm install
npm run dev
```

Set API base URL in `core/constants/url-constants.ts` (defaults to `http://localhost:8000/api`).

Run the Django backend from `../ADMIN---DJANGO`:

```bash
python manage.py migrate
python manage.py runserver
```

## API

`POST /api/salon/makeup/change/`

| Field | Description |
|-------|-------------|
| `image` | User photo (multipart) |
| `session_id` | Salon session UUID |
| `prompt` | Shade prompt from `makeup_prompts.json` |
| `makeup_name` | Shade label (e.g. "Classic Red") |
| `makeup_type` | `lipstick`, `blush`, or `eyeshadow` |
| `gender` | Optional — stored on session for analytics |

## User flow

1. Login → capture photo → select **MAKEUP TRY-ON**
2. Select one or more effects (Lipstick / Blush / Eyeshadow)
3. Pick a shade for each → **Proceed** → view result
4. Multiple effects are layered in one run; use **+** on results to add more

## Prompt data

Shade prompts live in `features/makeup-advisor/data/makeup_prompts.json`.
# TMS_MAKEUP
# TMS_MAKEUP
# TMS_MAKEUP
