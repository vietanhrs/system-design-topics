# System Design Topics

Interactive workbook for practicing **product feature system design interviews**.

The structure mirrors the `senior-front-end-topics` workbook style: a Bun workspace with a shared
workbook package and one hosted hub web app. Each level contains subsections, and every subsection
has three parts:

- **Theory** - concepts, constraints, failure modes, and senior-level trade-offs.
- **Example** - a concrete architecture sketch for a product feature.
- **Exercise** - prompts and expected checkpoints for whiteboard practice.

The workbook is optimized for interviews where the prompt is "Design a system/feature architecture"
for a product, such as friends suggestions, connection recommendations, feeds, notifications,
search autocomplete, messaging, or rate limiting.

## 24-hour fast track

If you only have one day, focus on all `P0` topics first:

1. Problem framing, requirements, and back-of-envelope estimates.
2. API contracts, data model, read/write path, and capacity bottlenecks.
3. Caching, queues, partitioning, indexes, idempotency, observability, and failure modes.
4. The full friends/connection suggestions case study.
5. The answer template and follow-up checklist in Level 8.

## Repository structure

```txt
system-design-topics/
├── packages/
│   └── workbook/              # shared workbook UI engine
├── apps/
│   └── workbook-hub/          # hosted SPA with all levels
├── .github/workflows/deploy.yml
└── package.json
```

## Running locally

Requires **Bun >= 1.3**.

```bash
bun install
bun run dev
bun run build
```

The app uses hash routing, so it can be hosted as a static GitHub Pages site without rewrite rules.

## Levels

1. Interview Operating System
2. Core Architecture Building Blocks
3. Data Modeling and Consistency
4. Social Graph and Recommendation Systems
5. Designing Product Features
6. Scalability, Reliability, and Operations
7. Security, Privacy, and Abuse
8. 24-Hour Interview Sprint

## Study method

For each subsection:

1. Read **24h Must Know** first.
2. Explain the theory out loud in 2 minutes.
3. Walk through the example architecture as a request/write/read flow.
4. Do the exercise without looking at the expected checkpoints.
5. Re-answer the prompt with one explicit trade-off and one failure mode.

