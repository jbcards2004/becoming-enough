# Becoming Enough

Anonymous story sharing with a Cloudflare Worker and Sites-managed D1 database.

- `public/`: site content and browser journal. Drafts and older local entries stay in the browser; they are never uploaded automatically.
- `worker/index.js`: consent-required, same-origin story submissions and paginated community reading. Sharing requires Sites sign-in; no identity or email is stored with stories or returned to readers.
- `drizzle/`: versioned schema-only database migrations, applied by Sites on publication.
- `npm run build`: embeds assets in the Worker.
- `node scripts/check-stories.mjs`: exercises the Worker against in-memory SQLite.
- `npm run dev`: local preview with a separate SQLite database and simulated local visitor identity. Local stories are never deployed.

Preserve `.openai/hosting.json` project identity, DB binding, and site audience. Shared stories are visible to visitors who have access to the site. Writers must omit identifying details; anonymity cannot remove details they type themselves.

## GitHub copy

This repository contains source code and the database schema only. The live story database remains with the existing Sites deployment; it is not stored in GitHub. Building this repository does not move the live site or its data. Hosting elsewhere requires provisioning a compatible D1 database and replacing the Sites-managed sign-in and trusted identity integration before story submissions will work.

Requires Node.js 24 or later for local SQLite preview and checks. Run `npm run build`, `npm run validate`, and `node scripts/check-stories.mjs`. There are no package dependencies to install.

## Vercel deployment

The repository root is the Vercel project root. Use Other as the framework, Node.js 24.x, `npm run build:vercel` as the build command, and `vercel-dist` as the output directory. `vercel.json` defines these settings. Vercel detects `api/stories.js` as a Node.js function separately from the static output. No package dependencies are required.

The existing private Sites deployment retains the live D1 story database. The Vercel API gateway connects server-side, using `STORIES_BACKEND_URL`, `STORIES_BACKEND_TOKEN`, and `STORIES_BRIDGE_KEY` in Production only. The Sites backend must have the matching `VERCEL_STORY_BRIDGE_KEY` and bridge authorization code deployed. Credentials must never be committed or exposed in browser assets. Until authorized credentials are configured, the API returns a clear 503 and writing drafts still works. Preview deployments deliberately have no access to the production story database.

Keep Vercel Authentication enabled for **all** deployments, including production, to preserve the site's private audience. Making the site public is a separate access decision.

Validation: `npm run build`, `npm test`, `npm run build:sites`, `npm run validate`, and `node scripts/check-stories.mjs`.
