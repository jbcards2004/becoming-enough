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
