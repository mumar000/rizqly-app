# Offline + Sync — Plan

> Drafted before coding. Level 1 (read offline) + Level 2 (queue writes, auto-sync on reconnect). Scoped to stay small.

---

## TL;DR — where does my data live?

```
┌──────────────────────────┐
│  React Query in-memory   │   ← what your components read from
│  cache (RAM)             │
└──────────┬───────────────┘
           │ persisted continuously
           ▼
┌──────────────────────────┐
│  IndexedDB in the browser│   ← survives tab close, reboot, airplane mode
│  (rizqly-cache database) │
└──────────┬───────────────┘
           │ when online: flushed to server
           ▼
┌──────────────────────────┐
│  MongoDB on the server   │   ← source of truth
│  (via Next.js API routes)│
└──────────────────────────┘
```

- **While online**: user adds tx → it goes into RAM cache (instant UI) → fires `POST /api/transactions` → server confirms → cache reconciles.
- **While offline**: user adds tx → it goes into RAM cache (instant UI) → the mutation is **queued in IndexedDB** instead of fired → UI shows "1 pending change" hint → user keeps using the app, totals/charts already reflect it.
- **Reconnect**: queued mutations replay automatically, in order. Server confirms. Cache reconciles. Hint disappears. **No data is ever lost** — the queue persists across tab close, browser restart, even system reboot.
- **If browser storage is cleared** (user manually clears site data): the queue is gone. This is a documented user action, not a silent failure.

---

## What gets persisted

| What | Where | Lifetime |
|---|---|---|
| Query results (transactions, banks, categories, bills, etc.) | IndexedDB → key `rizqly-query-cache.v1` | 30 days (then gc'd) |
| Mutation queue (pending writes) | IndexedDB → same store, key `mutations` | Until flushed or user clears |
| Auth session (NextAuth JWT cookie) | Cookie (already there) | 30 days |
| `localStorage` items already in use | Untouched | — |

We do **not** persist:
- Selection state (UI ephemeral)
- Open/closed sheet state (UI ephemeral)
- Period filter choice (already trivial)

---

## Dependencies

| Package | Why | Size (gz) |
|---|---|---|
| `@tanstack/react-query-persist-client` | Official persistence harness | ~4 KB |
| `idb-keyval` | Tiny IndexedDB wrapper (no schema, just kv) | ~1 KB |

That's it. Both are widely used, maintained, type-safe.

---

## Files this touches

### New

- `lib/queryPersister.ts` — wraps `idb-keyval` as a storage adapter for `persistQueryClient`. ~30 lines.
- `hooks/useOnlineStatus.ts` — wraps `navigator.onLine` + listens to `online`/`offline` events, also seeds React Query's `onlineManager`. ~25 lines.
- `components/mobile/SyncStatusBanner.tsx` — slim top-of-screen pill: "📡 Offline · changes saved" / "Syncing 3 changes…" / hidden when nothing to say. ~50 lines.
- `lib/idempotency.ts` — generates a client-side UUID per mutation, used for server-side dedupe. ~10 lines.

### Modified

- `app/providers.tsx` — wrap `QueryClientProvider` with `PersistQueryClientProvider`; pass the IndexedDB persister.
- `app/api/transactions/route.ts` — `POST` accepts an optional `clientId` field; if present and a row with that `clientId` already exists for the user, return the existing row instead of creating a duplicate (idempotent insert).
- `app/api/bills/route.ts` — same treatment.
- `lib/mongodb/models.ts` — add a sparse-indexed `clientId: string | null` column on `Transaction` and `Bill`.
- `services/transaction.service.ts` + `services/bill.service.ts` — generate `clientId` before sending; pass through.
- `hooks/mutations/*` — no logic change; the existing optimistic updates *are* the offline UX already. React Query's persist plugin handles the queue automatically.

### Untouched

- All UI components except for mounting the `SyncStatusBanner` once in `app/layout.tsx`.
- Tests (none currently for this surface).
- Server logic beyond the two idempotency tweaks.

---

## How the mutation queue actually works

TanStack Query has **mutation pause/resume built in**:

1. `onlineManager.setOnline(false)` (we wire this to `navigator.onLine` events) → all new mutations enter a `paused` state instead of running.
2. The mutation, including its `mutationFn` reference and variables, is serialized to the persister (IndexedDB).
3. On reconnect → `onlineManager.setOnline(true)` → `queryClient.resumePausedMutations()` → queue flushes in submission order.
4. Each mutation's existing optimistic update + onError/onSettled fires exactly as if it had happened online.

The only wiring **we** write is:
- The `useOnlineStatus` hook that flips `onlineManager` based on browser events.
- A startup `resumePausedMutations()` call so a queue from a previous session resumes when the user reopens the tab while online.

That's the whole offline-write story. ~10 lines of glue.

---

## Idempotency design (the duplicate-prevention bit)

The risk: user adds a tx offline on phone, also adds one on web, reconnects → both POST → two rows.

Fix:
1. Service generates a `clientId` (UUID v4) before calling `fetch()`.
2. `POST /api/transactions` reads `clientId` from body.
3. Mongo lookup: `Transaction.findOne({ userId, clientId })`.
4. If found → return that row (200), don't create.
5. If not found → create, set `clientId`, return new row (201).

Trade-offs:
- One extra Mongo read per POST. Negligible (`clientId` is indexed).
- Old data has no `clientId` (null). Sparse index handles that fine.
- A future "edit transaction" mutation would need a different idempotency strategy (PATCH is idempotent by id, so this works out of the box).

---

## SyncStatusBanner UX

Three states, only one visible at a time:

| State | Trigger | Look |
|---|---|---|
| Hidden | Online, no queue | (nothing) |
| Offline | `navigator.onLine === false` | Thin lime-yellow pill top: "📡 Offline · changes saved locally" |
| Syncing | Online but `getMutationCache().getAll().filter(m => m.state.status === 'pending').length > 0` | Thin lime pill top: "Syncing N changes…" |

- Position: `fixed top-0 inset-x-0 z-[60]`, ~32px tall, slides down from top.
- No emojis in the syncing state (clean SVG spinner) per your direction earlier.
- Auto-dismisses 1s after queue drains.

---

## Edge cases I've thought about

| Case | Behavior |
|---|---|
| User offline, adds tx, closes tab, reopens tab still offline | Queue persisted in IndexedDB; cache shows the optimistic tx; banner says "Offline · changes saved" |
| User offline, adds tx, closes tab, reopens tab online | On mount → `resumePausedMutations()` → flushes; banner briefly shows "Syncing 1 change…" |
| User offline, adds same tx on two devices | When both reconnect, server dedupes by `clientId`; only one row in DB |
| User offline, deletes a tx that was created online before | DELETE queues; replays normally on reconnect (server returns 404 if it was already deleted elsewhere — we handle that as success) |
| Server returns 401 (session expired) during replay | Mutation fails; React Query marks failed; banner stays as "X changes failed — tap to retry" (defer this UI to v2 if too much) |
| User clears site data | All offline data + queue gone (documented; nothing we can do) |
| Cache > 5MB | Configure persister `maxAge: 30 days` so old queries get pruned automatically |
| Pre-render / SSR | Persister only runs client-side (`typeof window === 'undefined'` guard) |

---

## Out of scope (deliberately)

- **Background sync** (Service Worker `sync` event) — Level 3 territory.
- **Conflict resolution UI** — for a personal finance app with one user, conflicts are vanishingly rare; we use last-write-wins.
- **Optimistic delete merge** — already handled by existing `onError` rollback in delete mutations.
- **Multi-tab coordination** — two open tabs editing simultaneously may show stale data briefly; React Query's cross-tab sync handles convergence.

---

## Verification checklist

When done, all of these should work:

- [ ] `npx tsc --noEmit` clean
- [ ] Open app online → reload offline (DevTools → Network → Offline) → app still loads with last-known data, no spinner-of-death
- [ ] Offline: add a transaction → it appears in the list instantly → top banner says "Offline · changes saved locally"
- [ ] Go back online (DevTools → Network → Online) → banner briefly says "Syncing 1 change…" → banner disappears → server has the transaction
- [ ] Offline: add a tx → close the tab → reopen offline → tx still visible, banner still says offline
- [ ] Offline: add a tx → close tab → come back online → reopen tab → banner syncs → tx persists
- [ ] Add the same tx description+amount on two browsers (one offline, one online) → reconnect both → only ONE row in DB (idempotency works)
- [ ] Offline: delete a tx → it disappears → banner shows "Syncing 1 change…" on reconnect
- [ ] Bills, transactions, banks, categories, daily rizq — all readable offline
- [ ] Adding a bill works offline same as a tx

---

## Open questions for you

1. **Banner copy / placement**: I'm going with a thin top bar that auto-dismisses. If you'd rather a tiny corner pill (like the existing "🧮 Groups" floating button), say so before I code it.
2. **Should the modal block submit when offline, or just queue silently?** My plan: queue silently and tell the user via the banner. The modal closes normally so the flow feels native. Override?
3. **Idempotency on bills too?** Plan says yes. Doubles a few lines of work but keeps the model consistent. (If you say "transactions only" I'll skip bills.)
