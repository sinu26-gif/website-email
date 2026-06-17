# Himova — AI Email Support for Salons

A real, deployable prototype: **Next.js (Node) frontend + a Python serverless drafting engine**, built to run on **Vercel**.

- 🇳🇵 Built in Kathmandu, Nepal
- ✉️ Contact: contact@himova.work.gd

## What's inside

```
himova-app/
├─ app/                 # Next.js App Router frontend
│  ├─ layout.tsx        # Metadata + root layout
│  ├─ page.tsx          # Landing page + live interactive demo (client component)
│  └─ globals.css       # Styling
├─ api/
│  └─ draft.py          # Python serverless function: the grounded drafting engine
├─ package.json
├─ next.config.js
├─ tsconfig.json
├─ vercel.json
└─ requirements.txt     # (stdlib only — tells Vercel to build the Python function)
```

## The drafting engine (`api/draft.py`)

No external dependencies — pure Python standard library, so it deploys instantly on Vercel.

Given a customer email + a salon knowledge base, it:

1. **Detects intent** (hours / price / booking / location) via keyword scoring.
2. **Matches FAQs** using TF-IDF-style cosine similarity.
3. **Generates a grounded reply** from the knowledge base (never invents facts).
4. **Scores confidence** and decides `ready` (send) vs `review` (escalate to a human).

Example request:

```bash
curl -X POST https://YOUR-DOMAIN/api/draft \
  -H 'Content-Type: application/json' \
  -d '{"email":"Are you open Saturday?"}'
```

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

> Note: the Python function runs on Vercel's runtime. To exercise the engine
> locally without Vercel, run `python3 api/draft.py` to see sample drafts, or
> use `vercel dev` (recommended) to serve both the Next.js app and the Python
> function together.

## Deploy to Vercel

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. Import it at https://vercel.com/new — Vercel auto-detects **Next.js** and the
   **Python** function in `/api`.
3. Click **Deploy**.
4. Add your custom domain **himova.work.gd** under Project → Settings → Domains
   (recommended so your website domain matches your email domain for startup
   credit applications).

Or from the CLI:

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

## Environment variables

Copy `.env.example` and set what you need:

| Variable | Purpose | Default |
|---|---|---|
| `USE_BEDROCK` | `1` to draft with Amazon Bedrock (Claude); falls back to the rules engine on any error | `0` |
| `AWS_REGION` | Bedrock region | `us-east-1` |
| `BEDROCK_MODEL_ID` | Bedrock model id | Claude 3.5 Sonnet |
| `GMAIL_TOKEN_PATH` | OAuth token file for the ingest worker | `token.json` |
| `GMAIL_CREDENTIALS_PATH` | OAuth client secrets | `credentials.json` |
| `HIMOVA_KB_PATH` | Optional JSON knowledge base for the worker | built-in demo KB |

On Vercel, set these under **Project → Settings → Environment Variables**. When you have AWS Activate credits, Bedrock usage draws from them.

## Local dev with the Python function (`vercel dev`)

`next dev` alone won't serve the Python function. To run the Next.js app **and** `/api/draft.py` together locally:

```bash
npm i -g vercel
npm install
vercel dev        # http://localhost:3000 with the Python API live
```

You can also exercise the engine directly, no server needed:

```bash
python3 api/draft.py                 # prints sample drafts (rules engine)
USE_BEDROCK=1 python3 api/draft.py   # requires boto3 + AWS creds
```

## Amazon Bedrock drafting

`api/draft.py` includes `bedrock_draft()`. With `USE_BEDROCK=1`, the rules engine still decides **intent, confidence, and escalation** (so the human-in-the-loop safety is deterministic), and Bedrock rewrites the reply prose grounded in the same knowledge base. Any Bedrock error falls back to the rules reply, and the JSON response includes `"engine": "bedrock" | "rules"`.

## Gmail ingest worker

`scripts/gmail_ingest.py` polls unread Gmail messages, drafts a grounded reply, and **saves it as a Gmail draft (never sends)**:

```bash
pip install -r scripts/requirements-ingest.txt
python scripts/gmail_ingest.py --auth      # one-time OAuth (needs credentials.json)
python scripts/gmail_ingest.py --max 10    # draft replies for unread mail
```

It reuses the exact same drafting engine as the website demo, so behavior is consistent everywhere.

## Roadmap (beyond this prototype)

- Gmail API ingest of real incoming emails
- Supabase (Postgres + Auth) for accounts + knowledge bases
- Amazon Bedrock (Claude) drafting with the same grounding + confidence logic
- One-click send + audit log from the review dashboard

© 2026 Himova · Thamel, Kathmandu, Nepal
