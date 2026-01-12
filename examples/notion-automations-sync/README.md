# Notion → Framer Sync

Cloudflare Worker that syncs a Notion database to a Framer CMS collection.

## How it works

Uses `framer-api` with the `using` keyword for automatic resource cleanup:

```ts
using framer = await connect(projectUrl, apiKey);
const collections = await framer.getManagedCollections();
// connection automatically closed when scope exits
```

## Setup

1. `npm install`
2. `cp .env.example .env` and fill in your values
3. `npm run setup` - creates Framer collection (one-time)

## Local Development

```bash
npm run dev
```

To test with Notion webhooks, expose your local server:

```bash
cloudflared tunnel --url http://localhost:8787
```

## Deploy

```bash
wrangler secret bulk .env
npm run deploy
```

Your worker URL will be printed after deploy.

## Notion Automation Setup

1. Add "Deleted" checkbox property (for soft-deletes)
2. Click ⚡ → New automation
3. Trigger: "When page added" or "When property edited"
4. Action: "Send webhook"
   - URL: your worker URL
   - Headers: `Authorization: <your WEBHOOK_TOKEN>`

Repeat for each trigger type you need.

## Config

Edit `src/config.ts`:

- `TOMBSTONE_PROPERTY` - checkbox property for soft-delete
- `FIELD_MAPPING` - maps Notion properties to Framer fields

## Notion Automations vs REST API

This example uses Notion Automations (webhook actions), not the Notion API.

| | Automation Webhooks | REST API + Webhooks |
|---|---|---|
| Setup | UI-based, per-database | Programmatic integration |
| Payload | Full page properties | Webhook sends IDs only, must fetch |
| Auth | Custom header (optional) | OAuth / integration token |
| Triggers | Page add, property edit, button | Subscribe to events programmatically |
| Rate limits | Max 5 webhooks per automation | 3 req/sec |
| Page content | Properties only | Full blocks access |
| Bulk sync | Not supported | Query database endpoint |
| Plan | Paid plans only | Free tier available |

When to use Automations:
- Simple property sync
- No initial bulk import needed
- UI-based configuration preferred

When to use REST API:
- Need page content (blocks)
- Bulk/initial sync required
- Free tier
- Multiple databases from one integration

Note: Notion's webhook features are evolving. Verify current capabilities in the official docs.

Sources: [Notion Webhook Actions](https://www.notion.com/help/webhook-actions), [Notion API Webhooks](https://developers.notion.com/reference/webhooks)
