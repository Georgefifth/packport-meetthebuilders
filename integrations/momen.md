# Momen (optional)

Momen is a no-code platform whose backend can also be used on its own as a hosted backend (PostgreSQL database, auth, workflows, AI agents) reached over GraphQL. Its docs describe a "headless" mode for connecting an AI coding tool to that backend through an MCP integration: [Connect to Momen Backend](https://docs.momen.app/account_community/headless_vibe_coding/).

It is not part of the default pipeline. Use it when it earns its place.

## Use it when

- The product needs persistent data, user accounts or a server-side AI agent that the judge's session must keep, and you do not want to host that yourself.
- You have credits, and the free-plan limits fit (check them before the spec; earlier runs hit a single-workflow limit).

## Do not use it when

- The product is a client-side tool. A static front end that runs in the browser is the easiest thing for a judge to open and for the fresh-clone test to run.
- The judge's experience would break if the hosted project is paused, over quota or credit-limited. Judges look at entries for weeks after the deadline.

## If you use it

1. State in `project/spec.md` why the product needs a backend, and the fallback if Momen is unreachable (a demo mode with recorded data).
2. Keep the front end in your own repository, with the design direction from `design/direction.md`. Do not move UI into a visual editor and lose the repository evidence judges look for.
3. Record the project id and endpoints in `README.md`. Never commit tokens or `.momen-mcp/`.
4. Put the claim in `project/claims.md` with a `url` or `cmd` evidence row that hits the endpoint.
5. If a hosted site is part of the deliverable, test it with `scripts/browser/probe.mjs` like any other URL.

## As a design aid

If you use Momen's editor or templates to explore a layout, capture the result into `design/references/` and write what you borrow (layout, flow, state handling). Treat it like any other reference: adapt, do not copy, and do not describe it as your own design.
