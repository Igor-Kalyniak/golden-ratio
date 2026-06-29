---
name: nextjs-frontend
description: Apply Next.js 16.2 App Router best practices (React 19, TypeScript, Tailwind v4) — Server vs Client Components, data fetching, Cache Components, Server Actions, routing conventions, streaming, Route Handlers, error handling, and performance. Use whenever writing, reviewing, or refactoring Next.js App Router code in this project.
license: Apache-2.0
metadata:
  version: "1.0.0"
  updated: 2026-06-29
  category: frontend
  frameworks: [nextjs-16, react-19, typescript, tailwind-v4]
  source: AGENTS.md
---
# Next.js App Router Best Practices

This project uses **Next.js 16.2** with the **App Router**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. The App Router lives in `app/` at the repo root (there is no `src/` directory).

## When to Use

When using this skill ALWAYS output to chat emodji - 🔨

- Writing any new Next.js component, page, layout, route handler, or server action
- Reviewing or refactoring existing App Router code
- Deciding between Server and Client Components, caching strategies, or data-fetching patterns
- Debugging rendering, caching, streaming, or error-boundary behavior

## Documentation First — This is NOT the Next.js you know

**This version has breaking changes** — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key references under `node_modules/next/dist/docs/01-app/`:
- Getting started: `01-getting-started/`
- Guides: `02-guides/`
- API reference: `03-api-reference/`

## Server vs Client Components

- All components are **Server Components by default**. Only add `'use client'` when you need state, event handlers, lifecycle effects, or browser APIs.
- Keep `'use client'` boundaries as narrow as possible — mark the specific interactive leaf component, not the whole tree.
- Third-party components that use client features must be wrapped in a `'use client'` re-export file.
- Pass Server Components as `children` to Client Components to keep them server-rendered.
- Context providers must be Client Components; render them as deep in the tree as possible.
- Use `server-only` and `client-only` packages to enforce environment boundaries and prevent leaking secrets.

## Data Fetching

- Fetch data in **Server Components** using `async`/`await` with `fetch` or direct database/ORM calls.
- `fetch` requests are **not cached by default** and block rendering. Use `'use cache'` directive to cache results, or wrap in `<Suspense>` to stream.
- Identical `fetch` calls in the React tree are automatically memoized — fetch where needed, don't prop-drill.
- Use `Promise.all()` for parallel independent requests; avoid sequential `await` chains when requests don't depend on each other.
- For client-side data, pass a promise from a Server Component and resolve it with React's `use()` API, or use SWR/React Query.
- Use `React.cache()` to share data across Server and Client Components without duplicate fetches.

## Caching (Cache Components)

- Enable via `cacheComponents: true` in `next.config.ts`.
- Use `'use cache'` directive at the function or component level with `cacheLife()` to set TTL profiles (e.g., `'hours'`, `'days'`).
- Use `cacheTag()` to tag cached entries, then `revalidateTag()` or `updateTag()` to invalidate after mutations.
- Components accessing runtime APIs (`cookies()`, `headers()`, `searchParams`) **must** be wrapped in `<Suspense>`.
- Non-deterministic operations (`Math.random()`, `Date.now()`) require either `await connection()` + `<Suspense>` for per-request values, or `'use cache'` to freeze them.
- `'use cache'` cannot go directly in Route Handler bodies — extract to a helper function.

## Mutations (Server Actions)

- Define Server Functions with `'use server'` directive — either inline in Server Components or in dedicated `actions.ts` files.
- Client Components **cannot define** Server Functions — import them from `'use server'` files.
- Always verify **authentication and authorization** inside every Server Function; they are directly reachable via POST.
- Model expected errors as **return values** (not thrown exceptions) and consume them with `useActionState`.
- After mutation: call `revalidatePath()` / `revalidateTag()` to bust cache, or `refresh()` from `next/cache` for full page refresh.
- `redirect()` throws internally — call `revalidatePath`/`revalidateTag` **before** `redirect()`.
- Show pending state with `useActionState` hook's `pending` boolean.

## Routing & File Conventions

- `page.tsx` exposes a route; `layout.tsx` wraps child segments; `loading.tsx` provides Suspense skeletons; `error.tsx` creates error boundaries.
- `route.ts` defines API endpoints (Route Handlers). Cannot coexist with `page.tsx` in the same segment.
- Dynamic params: `[slug]`, `[...slug]`, `[[...slug]]`. Access via `params` prop — `params` is a **Promise**, must be awaited: `const { slug } = await params`.
- Route groups `(group)` organize without affecting URLs. Private folders `_folder` are excluded from routing.
- `error.tsx` files **must** be Client Components (`'use client'`).
- Prefer the error boundary's `unstable_retry` prop to recover (re-fetches and re-renders the children); `reset` still exists but only clears the error state without re-fetching.

## Streaming & Loading

- Use `loading.tsx` for route-level streaming, or `<Suspense>` for granular component-level streaming.
- `loading.tsx` wraps the page in a Suspense boundary automatically — layouts accessing uncached data will block rendering, not fall through to `loading.tsx`.
- Design meaningful loading states (skeletons, cover photos) rather than generic spinners.

## Route Handlers (API Routes)

- Define in `route.ts` files. Export named functions: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
- Not cached by default. Use `export const dynamic = 'force-static'` for caching, or `'use cache'` with Cache Components enabled.
- Use `NextRequest`/`NextResponse` for advanced use cases.
- Type route context with the `RouteContext` helper: `ctx: RouteContext<'/users/[id]'>`.

## Error Handling

- **Expected errors**: return error state from Server Functions, consume with `useActionState`. Don't throw.
- **Uncaught exceptions**: handled by `error.tsx` error boundaries. Use `global-error.tsx` for root-level errors (must include `<html>` and `<body>`).
- For component-level error recovery: use `unstable_catchError` from `next/error`.
- Event handler errors are not caught by error boundaries — catch manually and update state.

## TypeScript

- Run `next dev`, `next build`, or `next typegen` to generate route types.
- Use the `RouteContext` type helper for Route Handler params.

## Performance

- Keep Client Component bundles small — push interactivity to leaf components.
- Use `<Image>` from `next/image` with `priority` for above-the-fold images.
- Use `next/font` for self-hosted fonts (already set up with Geist).
- Prefer `<Link>` from `next/link` for client-side navigation.
