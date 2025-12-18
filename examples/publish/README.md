# Publish

Publishes and deploys a Framer project. Designed to run as a one-shot script, making it ideal for cron jobs, CI/CD pipelines, and systemd timers.

## Usage

```bash
node --env-file=../../.env index.ts

bun --env-file=../../.env run index.ts

deno --env-file=../../.env run index.ts
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXAMPLE_PROJECT_URL` | Yes | Your Framer project URL |

## Scheduling Examples

### Cron

Publish every 4 hours:

```bash
# Edit crontab
crontab -e

# Add this line (adjust paths as needed)
0 */4 * * * cd /path/to/examples/publish && node --env-file=../../.env index.ts >> /var/log/framer-publish.log 2>&1
```

Common cron schedules:

```bash
0 */4 * * *     # Every 4 hours
0 9-18/2 * * 1-5  # Every 2 hours between 9:00 and 18:00, mon-fri
0 9 * * *       # Daily at 9:00
0 9 * * 1-5     # Weekdays at 9:00
```
