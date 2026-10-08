# BANG! Deck Modules Monorepo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current Event-card React Router app into an npm monorepo with four independently buildable local-first websites for Character, Role, Play, and Event decks.

**Architecture:** Four React Router Framework Mode apps consume pure TypeScript deck/data packages and a presentational React package. Every app owns its state machine and versioned local-storage document, while shared packages remain independent of application routes and browser-owned game state.

**Tech Stack:** npm workspaces, React 19, React Router 8 Framework Mode, TypeScript 5.9, Vite 8, Tailwind CSS 4, Vitest, Testing Library, jsdom

**Spec:** `docs/superpowers/specs/2026-10-09-bang-deck-monorepo-design.md`

## Global Constraints

- Initial card scope is the base BANG! set from `Bang/Bang/downloaded_cards/id_01_bang` plus the existing 28 Event cards.
- No account, backend, room, matchmaking, realtime synchronization, or cross-app state sharing.
- Players manually apply card rules, character abilities, damage, and the Sheriff health bonus.
- Character, Role, and Event names and rules text are available in Vietnamese and labeled as unofficial translations.
- Each app is mobile-first, independently buildable, independently deployable, and uses its own versioned local-storage namespace.
- Only referenced artwork is copied into an owning app's `public/cards/<deck>/` directory; never commit the raw `Bang/` archive.
- New production behavior follows red-green-refactor: a test must fail for the expected missing behavior before implementation is added.
- Implementation commits follow Conventional Commits and contain one independently reviewable deliverable.

## Review Focus

- Duplicate card definitions with multiple copies must receive stable unique instance IDs; covered in Task 1 deck-core tests.
- Corrupt or old local-storage documents must fall back without crashing; covered in Task 1 persistence tests and each app restoration test.
- Disabling every Play card is valid and creates an explicitly empty deck; covered in Task 6 settings/model tests.
- Missing artwork must render translated text rather than a broken image; covered in Task 3 shared-card tests.
- Browser-only shuffling must not cause SSR hydration differences; covered by deterministic fresh-state factories in Tasks 4–7 and production-build verification in Task 8.

---

## File Map

```text
package.json                         workspace scripts and shared dev tools
vitest.config.ts                    unit/component test projects and aliases
vitest.setup.ts                     Testing Library cleanup and DOM matchers
packages/deck-core/                 generic immutable deck and persistence primitives
packages/card-data/                 typed Character, Role, Play, and Event metadata
packages/shared-ui/                 accessible presentational components and styles
apps/character-deck/                character state model and website
apps/role-deck/                     role state model and website
apps/play-deck/                     personal play zones, health, and settings website
apps/event-deck/                    migrated Event state model and website
docs/                               design, plan, and workspace usage
```

## Task 1: Establish the workspace and deck-core contract

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `packages/deck-core/package.json`
- Create: `packages/deck-core/tsconfig.json`
- Create: `packages/deck-core/src/index.ts`
- Create: `packages/deck-core/src/deck.ts`
- Create: `packages/deck-core/src/persistence.ts`
- Test: `packages/deck-core/src/deck.test.ts`
- Test: `packages/deck-core/src/persistence.test.ts`

**Interfaces:**
- Produces: `CardDefinition`, `CardInstance<T>`, `expandDeck<T>()`, `shuffle<T>()`, `drawCards<T>()`, `moveCard<T>()`, `filterEnabledDefinitions<T>()`, `parseVersionedState<T>()`, and `serializeVersionedState<T>()` from `@bang/deck-core`.
- Consumes: no application code or BANG!-specific data.

- [ ] **Step 1: Add failing deck behavior tests**

Test that `expandDeck([{ id: "bang", count: 2 }])` creates `bang#0` and `bang#1`; `shuffle` preserves every instance without mutating input; `drawCards` clamps negative/excess counts; `moveCard` conserves cards and ignores a missing UID; and filtering removes every copy of disabled definitions.

- [ ] **Step 2: Run the deck-core tests and verify RED**

Run: `npx vitest run packages/deck-core/src/deck.test.ts`
Expected: FAIL because `@bang/deck-core` primitives do not exist.

- [ ] **Step 3: Implement immutable deck primitives**

Use these signatures in `packages/deck-core/src/deck.ts`:

```ts
export type CardDefinition = { id: string; count?: number };
export type CardInstance<T extends CardDefinition> = Omit<T, "count"> & { uid: string };
export function expandDeck<T extends CardDefinition>(definitions: readonly T[]): CardInstance<T>[];
export function shuffle<T>(items: readonly T[], random?: () => number): T[];
export function drawCards<T>(deck: readonly T[], count?: number): { drawn: T[]; deck: T[] };
export function moveCard<T extends { uid: string }>(source: readonly T[], target: readonly T[], uid: string): { source: T[]; target: T[] };
export function filterEnabledDefinitions<T extends CardDefinition>(definitions: readonly T[], disabledIds: ReadonlySet<string>): T[];
```

- [ ] **Step 4: Run deck tests and verify GREEN**

Run: `npx vitest run packages/deck-core/src/deck.test.ts`
Expected: PASS with no warnings.

- [ ] **Step 5: Add failing versioned-persistence tests**

Test supported envelopes, invalid JSON, wrong versions, failing validators, `null`, and valid serialization without browser APIs.

- [ ] **Step 6: Run persistence tests and verify RED**

Run: `npx vitest run packages/deck-core/src/persistence.test.ts`
Expected: FAIL because persistence functions are missing.

- [ ] **Step 7: Implement pure persistence helpers**

Use these signatures in `packages/deck-core/src/persistence.ts`:

```ts
export type VersionedEnvelope<T> = { version: number; state: T };
export function parseVersionedState<T>(raw: string | null, version: number, validate: (value: unknown) => value is T): T | null;
export function serializeVersionedState<T>(version: number, state: T): string;
```

- [ ] **Step 8: Configure npm workspaces and test tooling**

Set root workspaces to `apps/*` and `packages/*`; add `test`, `typecheck`, `build`, and per-app dev scripts; install Vitest, jsdom, Testing Library, and DOM matchers; ignore `/Bang/`, all workspace `node_modules`, `.react-router`, `build`, and coverage output.

- [ ] **Step 9: Run workspace foundation checks**

Run: `npx vitest run packages/deck-core`
Expected: all deck-core tests PASS.

Run: `npm run typecheck --workspace @bang/deck-core`
Expected: exit 0.

- [ ] **Step 10: Commit the foundation**

```bash
git add .gitignore package.json package-lock.json vitest.config.ts vitest.setup.ts packages/deck-core
git commit -m "feat(core): establish monorepo deck foundation"
```

## Task 2: Add typed base-game data, Vietnamese text, and curated assets

**Files:**
- Create: `packages/card-data/package.json`
- Create: `packages/card-data/tsconfig.json`
- Create: `packages/card-data/src/types.ts`
- Create: `packages/card-data/src/characters.ts`
- Create: `packages/card-data/src/roles.ts`
- Create: `packages/card-data/src/play-cards.ts`
- Create: `packages/card-data/src/events.ts`
- Create: `packages/card-data/src/index.ts`
- Test: `packages/card-data/src/card-data.test.ts`
- Create: curated images under each future app's `public/cards/<deck>/`

**Interfaces:**
- Consumes: `CardDefinition` from `@bang/deck-core`.
- Produces: `LocalizedCardDefinition`, `CharacterDefinition`, `RoleDefinition`, `PlayCardDefinition`, `EventCardDefinition`, `CHARACTERS`, `ROLES`, `PLAY_CARDS`, `EVENT_CARDS`, and `getRoleDefinitions(playerCount)` from `@bang/card-data`.

- [ ] **Step 1: Add failing dataset-contract tests**

Assert 16 translated characters with unique IDs and valid base health; four translated role definitions; role pools of 4/5/6/7 cards with the standard distributions; 22 unique play-card definitions totaling 80 instances; 28 translated Event definitions; valid `/cards/...` image paths; and no empty Vietnamese names or text.

- [ ] **Step 2: Run card-data tests and verify RED**

Run: `npx vitest run packages/card-data/src/card-data.test.ts`
Expected: FAIL because the package and datasets do not exist.

- [ ] **Step 3: Define card-data types and datasets**

Use discriminated categories and these public fields:

```ts
export type LocalizedCardDefinition = CardDefinition & {
  originalName: string;
  nameVi: string;
  textVi: string;
  image: string;
};
export type CharacterDefinition = LocalizedCardDefinition & { category: "character"; baseHealth: number };
export type RoleDefinition = LocalizedCardDefinition & { category: "role"; role: "sheriff" | "deputy" | "outlaw" | "renegade" };
export type PlayCardDefinition = LocalizedCardDefinition & { category: "action" | "equipment" | "weapon" };
export type EventCardDefinition = LocalizedCardDefinition & { category: "event"; effect: "positive" | "negative" };
```

`getRoleDefinitions` supports only integer counts 4–7 and throws `RangeError` otherwise. Play-card counts follow the 80-card base deck represented by the available base artwork. Event text migrates exactly from the existing translation file.

- [ ] **Step 4: Copy only referenced images**

Copy and normalize 16 character images, four role images, 22 play-card images, and 28 existing Event images into their owning app public directories. Preserve source aspect ratios; do not copy `box/`, `assets/`, expansions, logos, or duplicate catalog images.

- [ ] **Step 5: Run data tests and verify GREEN**

Run: `npx vitest run packages/card-data/src/card-data.test.ts`
Expected: all dataset assertions PASS.

Run: `npm run typecheck --workspace @bang/card-data`
Expected: exit 0.

- [ ] **Step 6: Commit data and curated assets**

```bash
git add packages/card-data apps/*/public/cards
git commit -m "feat(data): add translated base card catalog"
```

## Task 3: Build shared mobile card UI primitives

**Files:**
- Create: `packages/shared-ui/package.json`
- Create: `packages/shared-ui/tsconfig.json`
- Create: `packages/shared-ui/src/index.ts`
- Create: `packages/shared-ui/src/card-artwork.tsx`
- Create: `packages/shared-ui/src/counter.tsx`
- Create: `packages/shared-ui/src/deck-stats.tsx`
- Create: `packages/shared-ui/src/confirm-dialog.tsx`
- Create: `packages/shared-ui/src/app-shell.tsx`
- Create: `packages/shared-ui/src/styles.css`
- Test: `packages/shared-ui/src/shared-ui.test.tsx`

**Interfaces:**
- Consumes: localized display fields and app-owned event handlers; no app state.
- Produces: `AppShell`, `CardArtwork`, `Counter`, `DeckStats`, and `ConfirmDialog` from `@bang/shared-ui`, plus `@bang/shared-ui/styles.css`.

- [ ] **Step 1: Add failing accessibility and fallback tests**

Test accessible counter button names and 44px targets, semantic dialog labeling/focus behavior, deck-stat labels, and `CardArtwork` switching to a translated text fallback after image error.

- [ ] **Step 2: Run shared-ui tests and verify RED**

Run: `npx vitest run packages/shared-ui/src/shared-ui.test.tsx`
Expected: FAIL because shared components do not exist.

- [ ] **Step 3: Implement stateless UI components and tokens**

Keep components controlled through props. Use CSS custom properties for shared color/spacing/radius tokens and Tailwind utilities inside apps for composition. `CardArtwork` preserves aspect ratio and exposes `onError`; `ConfirmDialog` uses the native `dialog` element with explicit cancel/confirm actions.

- [ ] **Step 4: Run shared-ui checks and verify GREEN**

Run: `npx vitest run packages/shared-ui/src/shared-ui.test.tsx`
Expected: PASS with no accessibility-query failures.

Run: `npm run typecheck --workspace @bang/shared-ui`
Expected: exit 0.

- [ ] **Step 5: Commit shared UI**

```bash
git add packages/shared-ui
git commit -m "feat(ui): add shared mobile card components"
```

## Task 4: Implement the Character Deck website

**Files:**
- Create: `apps/character-deck/package.json`
- Create: `apps/character-deck/tsconfig.json`
- Create: `apps/character-deck/vite.config.ts`
- Create: `apps/character-deck/react-router.config.ts`
- Create: `apps/character-deck/app/routes.ts`
- Create: `apps/character-deck/app/root.tsx`
- Create: `apps/character-deck/app/app.css`
- Create: `apps/character-deck/app/model.ts`
- Create: `apps/character-deck/app/storage.ts`
- Create: `apps/character-deck/app/routes/home.tsx`
- Test: `apps/character-deck/app/model.test.ts`
- Test: `apps/character-deck/app/routes/home.test.tsx`

**Interfaces:**
- Consumes: `CHARACTERS`, deck-core primitives, and shared UI.
- Produces: `CharacterState`, `createCharacterState(random?)`, `drawCharacter(state)`, `adjustHealth(state, delta)`, `replaceCharacter(state)`, and storage key `bang.character.v1`.

- [ ] **Step 1: Add failing character-model tests**

Test deterministic initialization without shuffling during SSR, first browser shuffle, no repeated draw before reset, base-health initialization, health clamped at zero, replacement from the remaining deck, confirmed reset, and state validation/restoration.

- [ ] **Step 2: Run character-model tests and verify RED**

Run: `npx vitest run apps/character-deck/app/model.test.ts`
Expected: FAIL because the character model does not exist.

- [ ] **Step 3: Implement the pure Character state machine and storage adapter**

Keep randomness injectable and storage access outside model functions. The route initializes deterministic markup, restores or shuffles only in `useEffect`, and saves subsequent valid state to `bang.character.v1`.

- [ ] **Step 4: Run model tests and verify GREEN**

Run: `npx vitest run apps/character-deck/app/model.test.ts`
Expected: PASS.

- [ ] **Step 5: Add failing Character route tests**

Test the empty prompt, Vietnamese character content, draw/replace controls, manual health buttons, remaining count, missing-image fallback, and reset confirmation.

- [ ] **Step 6: Implement the Character app shell and route**

Use a single-card mobile layout with a visible unofficial-translation note. Do not automate abilities or the Sheriff bonus.

- [ ] **Step 7: Verify and commit Character Deck**

Run: `npx vitest run apps/character-deck`
Expected: all Character tests PASS.

Run: `npm run typecheck --workspace @bang/character-deck && npm run build --workspace @bang/character-deck`
Expected: both commands exit 0.

```bash
git add apps/character-deck
git commit -m "feat(character): add translated character deck app"
```

## Task 5: Implement the private Role Deck website

**Files:**
- Create: `apps/role-deck/package.json`
- Create: `apps/role-deck/tsconfig.json`
- Create: `apps/role-deck/vite.config.ts`
- Create: `apps/role-deck/react-router.config.ts`
- Create: `apps/role-deck/app/routes.ts`
- Create: `apps/role-deck/app/root.tsx`
- Create: `apps/role-deck/app/app.css`
- Create: `apps/role-deck/app/model.ts`
- Create: `apps/role-deck/app/storage.ts`
- Create: `apps/role-deck/app/routes/home.tsx`
- Test: `apps/role-deck/app/model.test.ts`
- Test: `apps/role-deck/app/routes/home.test.tsx`

**Interfaces:**
- Consumes: `getRoleDefinitions`, deck-core primitives, and shared UI.
- Produces: `RoleState`, `createRoleState(playerCount, random?)`, `drawRole(state)`, `setRoleRevealed(state, revealed)`, `redrawRole(state)`, and storage key `bang.role.v1`.

- [ ] **Step 1: Add failing Role model tests**

Test valid player counts 4–7, deterministic pools, face-down initial state, draw/reveal/hide transitions, confirmed redraw, count changes resetting the local draw, and malformed-state fallback.

- [ ] **Step 2: Run Role model tests and verify RED**

Run: `npx vitest run apps/role-deck/app/model.test.ts`
Expected: FAIL because the Role model does not exist.

- [ ] **Step 3: Implement the pure Role state machine and storage adapter**

Do not add device synchronization or duplicate-role detection. Keep role artwork and translated objective hidden until explicit reveal.

- [ ] **Step 4: Run model tests and verify GREEN**

Run: `npx vitest run apps/role-deck/app/model.test.ts`
Expected: PASS.

- [ ] **Step 5: Add failing Role route tests**

Test player-count selection, privacy copy, draw, reveal/hide, Vietnamese objective, redraw confirmation, and restored hidden state.

- [ ] **Step 6: Implement the Role app shell and route**

Use a privacy-first face-down presentation; require an explicit press to reveal and provide a large “Ẩn vai trò” action before handing the device away.

- [ ] **Step 7: Verify and commit Role Deck**

Run: `npx vitest run apps/role-deck`
Expected: all Role tests PASS.

Run: `npm run typecheck --workspace @bang/role-deck && npm run build --workspace @bang/role-deck`
Expected: both commands exit 0.

```bash
git add apps/role-deck
git commit -m "feat(role): add private translated role deck app"
```

## Task 6: Implement Play Deck zones and card availability settings

**Files:**
- Create: `apps/play-deck/package.json`
- Create: `apps/play-deck/tsconfig.json`
- Create: `apps/play-deck/vite.config.ts`
- Create: `apps/play-deck/react-router.config.ts`
- Create: `apps/play-deck/app/routes.ts`
- Create: `apps/play-deck/app/root.tsx`
- Create: `apps/play-deck/app/app.css`
- Create: `apps/play-deck/app/model.ts`
- Create: `apps/play-deck/app/storage.ts`
- Create: `apps/play-deck/app/routes/home.tsx`
- Create: `apps/play-deck/app/routes/settings.tsx`
- Create: `apps/play-deck/app/components/card-zone.tsx`
- Test: `apps/play-deck/app/model.test.ts`
- Test: `apps/play-deck/app/routes/home.test.tsx`
- Test: `apps/play-deck/app/routes/settings.test.tsx`

**Interfaces:**
- Consumes: `PLAY_CARDS`, deck-core primitives, React Router navigation, and shared UI.
- Produces: `PlayState`, `PlaySettings`, `createPlayState(settings, random?)`, `drawToHand(state, count)`, `movePlayCard(state, from, to, uid)`, `adjustHealth(state, delta)`, `toggleCardEnabled(settings, id)`, storage keys `bang.play.v1` and `bang.play.settings.v1`.

- [ ] **Step 1: Add failing Play model tests**

Test an 80-card default deck, unique instance IDs, one/two-card draw, overdraw clamping, legal moves among hand/in-play/discard, missing-card no-op, health clamped at zero, conservation across all zones, persisted settings, disabled-copy removal, all-disabled empty deck, and active-game immutability after settings changes.

- [ ] **Step 2: Run Play model tests and verify RED**

Run: `npx vitest run apps/play-deck/app/model.test.ts`
Expected: FAIL because the Play model does not exist.

- [ ] **Step 3: Implement the Play state machine and two storage adapters**

`movePlayCard` accepts zone names `"deck" | "hand" | "inPlay" | "discard"`; only UI-allowed transitions are exposed by controls. Settings affect only `createPlayState`, never mutate an active state.

- [ ] **Step 4: Run model tests and verify GREEN**

Run: `npx vitest run apps/play-deck/app/model.test.ts`
Expected: PASS.

- [ ] **Step 5: Add failing Play route tests**

Test zone counts, draw-one/draw-two controls, disabled empty-deck actions, action-to-discard, equipment/weapon-to-in-play, in-play-to-discard, manual health, persisted restoration, and new-game confirmation listing disabled card names.

- [ ] **Step 6: Add failing Settings route tests**

Test the searchable 22-card list, independent enabled toggles, select-all/default restoration, all-disabled warning, persisted settings, and navigation back without modifying the active game.

- [ ] **Step 7: Implement Play and Settings routes**

Render touch-friendly horizontal or grid zones with translated card names and artwork. Do not infer legal targets, range, timing, effects, or character abilities.

- [ ] **Step 8: Verify and commit Play Deck**

Run: `npx vitest run apps/play-deck`
Expected: all Play tests PASS.

Run: `npm run typecheck --workspace @bang/play-deck && npm run build --workspace @bang/play-deck`
Expected: both commands exit 0.

```bash
git add apps/play-deck
git commit -m "feat(play): add personal play deck and card settings"
```

## Task 7: Migrate and persist the Event Deck website

**Files:**
- Create: `apps/event-deck/package.json`
- Create: `apps/event-deck/tsconfig.json`
- Create: `apps/event-deck/vite.config.ts`
- Create: `apps/event-deck/react-router.config.ts`
- Create: `apps/event-deck/app/routes.ts`
- Create: `apps/event-deck/app/root.tsx`
- Create: `apps/event-deck/app/app.css`
- Create: `apps/event-deck/app/model.ts`
- Create: `apps/event-deck/app/storage.ts`
- Create: `apps/event-deck/app/routes/home.tsx`
- Test: `apps/event-deck/app/model.test.ts`
- Test: `apps/event-deck/app/routes/home.test.tsx`
- Delete after migration: root `app/`, `public/`, `react-router.config.ts`, `vite.config.ts`, and `tsconfig.json`

**Interfaces:**
- Consumes: `EVENT_CARDS`, deck-core primitives, and shared UI.
- Produces: `EventState`, `createEventState(random?)`, `drawEvent(state)`, `resetEventState(random?)`, and storage key `bang.event.v1`.

- [ ] **Step 1: Add failing Event model tests**

Test 28-card initialization, unique draw order, newest-first history, empty-deck no-op, reset, versioned restoration, and deterministic server-safe fresh state.

- [ ] **Step 2: Run Event model tests and verify RED**

Run: `npx vitest run apps/event-deck/app/model.test.ts`
Expected: FAIL because the migrated Event model does not exist.

- [ ] **Step 3: Implement the Event state machine and storage adapter**

Reuse generic deck primitives and do not duplicate Event metadata or translation records in the app.

- [ ] **Step 4: Run model tests and verify GREEN**

Run: `npx vitest run apps/event-deck/app/model.test.ts`
Expected: PASS.

- [ ] **Step 5: Add failing Event route regression tests**

Pin the current statistics, artwork, Vietnamese overlay, effect badge, history strip, empty state, reset behavior, and new local restoration behavior.

- [ ] **Step 6: Migrate the Event UI and remove the root template app**

Preserve current visible behavior while adopting shared primitives where behavior remains unchanged. Make Event the standalone app index route rather than `/event`.

- [ ] **Step 7: Verify and commit Event Deck**

Run: `npx vitest run apps/event-deck`
Expected: all Event tests PASS.

Run: `npm run typecheck --workspace @bang/event-deck && npm run build --workspace @bang/event-deck`
Expected: both commands exit 0.

```bash
git add apps/event-deck app public react-router.config.ts vite.config.ts tsconfig.json
git commit -m "refactor(event): migrate event deck into standalone app"
```

## Task 8: Document, verify, and harden the complete workspace

**Files:**
- Modify: `README.md`
- Modify: root workspace scripts/configuration as required by verified failures
- Test: full repository suite and browser smoke checks

**Interfaces:**
- Consumes: all four apps and three shared packages.
- Produces: documented local development/build commands and a release-ready verified monorepo.

- [ ] **Step 1: Replace the template README**

Document the monorepo map, prerequisites, install command, four dev commands and ports, test/typecheck/build commands, each app's build output, local-only data behavior, unofficial translations, raw asset exclusion, and future merge path.

- [ ] **Step 2: Run the full automated suite**

Run: `npm test`
Expected: all package and application tests PASS with no unhandled errors.

Run: `npm run typecheck`
Expected: every workspace exits 0.

Run: `npm run build`
Expected: all four production builds exit 0.

- [ ] **Step 3: Run production asset and repository checks**

Run: `git ls-files 'Bang/**'`
Expected: no output.

Run: `find apps -path '*/public/cards/*' -type f | wc -l`
Expected: 70 referenced card images (16 Character + 4 Role + 22 Play + 28 Event).

Run: `git diff --check`
Expected: no output.

- [ ] **Step 4: Smoke-test all apps in a real browser**

At a narrow mobile viewport, verify each app loads without console errors, artwork resolves, controls are at least 44px, Vietnamese text does not overflow, local state survives reload, and reset confirmation prevents accidental loss.

- [ ] **Step 5: Fix only issues revealed by verification and rerun the failed command**

Any behavior bug receives a failing regression test before the fix. Repeat the full suite after targeted checks pass.

- [ ] **Step 6: Commit documentation and verified hardening**

```bash
git add README.md package.json package-lock.json apps packages
git commit -m "docs: document and verify deck module workspace"
```

- [ ] **Step 7: Push the reviewed commit series**

Run: `git status --short --branch`
Expected: only the intentionally ignored local `Bang/` archive is absent from status and the branch is ahead of `origin/master` by the new commits.

Run: `git push origin master`
Expected: all professional commit boundaries are published to `HTL2910/bang-cards-deck`.
