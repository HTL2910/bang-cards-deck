# BANG! Deck Modules Monorepo Design

**Date:** 2026-10-09
**Status:** Approved for implementation planning

## 1. Purpose

Turn the existing Event-card website into a monorepo containing four independently buildable and deployable websites for in-person BANG! play:

1. Character Deck
2. Role Deck
3. Play Deck
4. Event Deck

Each player uses their own device and manages their own game state. The websites do not coordinate players, validate the full rules, or synchronize a match. Players are responsible for applying card effects, character abilities, role-specific health changes, damage, and other rules correctly.

The four applications must remain separate now while sharing enough code and data to make a future combined application possible without rewriting the deck engine.

## 2. Product Principles

- Mobile-first: the primary device is a phone held during an in-person game.
- Local-first: no account, backend, room, network synchronization, or server-owned game state.
- Player-controlled: the UI provides deck and state-management tools without acting as a rules referee.
- Independent apps: each website has its own entry point, build, deployment, and browser state.
- Shared foundations: deck behavior, card metadata, and reusable UI live in workspace packages.
- Vietnamese-first: Character, Role, and Event content includes Vietnamese names and rules text. Existing Italian or English artwork remains visible where appropriate.
- Curated assets: only assets required by the four apps are committed; the raw 878 MB `Bang/` archive is not committed.

## 3. Repository Architecture

The repository will use npm workspaces.

```text
bang-boardgame-modules/
├── apps/
│   ├── character-deck/
│   ├── role-deck/
│   ├── play-deck/
│   └── event-deck/
├── packages/
│   ├── deck-core/
│   ├── card-data/
│   └── shared-ui/
├── docs/
├── package.json
└── package-lock.json
```

### 3.1 Applications

Each application is a React Router Framework Mode application with its own route configuration, metadata, assets, build output, and local-storage namespace. The applications may be deployed to separate domains because they do not exchange browser state.

### 3.2 Shared packages

#### `packages/deck-core`

Pure TypeScript domain functions and types for:

- expanding card definitions into unique card instances;
- Fisher-Yates shuffling without mutating the source array;
- drawing one or more cards;
- moving cards between deck, hand, in-play, and discard zones;
- resetting a deck;
- filtering disabled card definitions before a game begins;
- serializing and validating persisted state.

The package must not import React, browser APIs, application routes, or specific BANG! card data.

#### `packages/card-data`

Typed metadata for the base BANG! set and the current Event set:

- stable identifier;
- original name;
- Vietnamese name;
- Vietnamese description or rules text;
- category and subtype;
- image path;
- number of copies in the deck;
- base health for characters when available.

The initial release covers the base BANG! set from `id_01_bang` plus the Event cards already implemented. Expansion selection is explicitly deferred.

#### `packages/shared-ui`

Reusable presentation components and tokens, including card artwork, missing-image fallback, counters, deck statistics, confirmation dialogs, app header, empty states, and common buttons. It must not own application state or game rules.

## 4. Application Behavior

### 4.1 Character Deck

The Character website lets one player manage their own character.

Required behavior:

- Build and shuffle the base-set character deck.
- Draw one character at a time without repeating a character until reset.
- Display the original artwork, Vietnamese name, and Vietnamese ability text.
- Initialize the health counter from the character's printed base health.
- Let the player increase or decrease health manually.
- Let the player discard the current character and draw another from the remaining deck.
- Let the player start a new character deck after confirmation.
- Persist the remaining deck, current character, draw history, and health locally.

The application does not know the player's Role. A Sheriff manually adds the role bonus to the health counter. Character abilities are explained in Vietnamese but are applied by the player rather than enforced by software.

### 4.2 Role Deck

The Role website privately draws a role for one player.

Required behavior:

- Let the player select a table size from four through seven players.
- Build the standard base-game role distribution for the selected table size.
- Draw one role locally.
- Keep the result face down until the player explicitly reveals it.
- Let the player hide the role again.
- Display the Vietnamese role name and Vietnamese objective text when revealed.
- Let the player redraw after confirmation when the group detects a duplicate or otherwise coordinates a replacement.
- Persist the selected player count, local deck, current role, and reveal state locally.

There is no synchronization between players. Separate devices can draw conflicting roles; the group resolves conflicts manually.

### 4.3 Play Deck

The Play website is a personal card-management tool. It does not act as a full BANG! rules engine.

Required zones:

- draw pile;
- hand;
- cards in play (equipment and weapons);
- discard pile.

Required behavior:

- Build the base-game play deck using the correct copy count for each card definition.
- Shuffle the deck and draw one or two cards on demand.
- Show the player's hand as a touch-friendly card list or grid.
- Move action cards from hand to discard when the player uses or removes them.
- Move equipment and weapon cards from hand to the in-play zone.
- Move cards from the in-play zone to discard.
- Provide a manual health counter.
- Show counts for the draw pile, hand, in-play zone, and discard pile.
- Prevent a draw when the draw pile is empty and show a clear empty-deck state.
- Start a new game only after confirmation.
- Persist deck zones, health, and settings locally.

The application does not validate targets, distance, turn order, response timing, once-per-turn limits, card effects, damage, or character abilities. Players manually apply those rules.

#### Card availability settings

The Play website includes a Settings screen that lists every play-card definition in the base set.

- Each card type can be enabled or disabled independently.
- Disabled card types are excluded, including all of their copies, the next time a new game is created.
- Settings changes do not silently remove cards from an active game.
- Starting a new game shows a summary of disabled card types before confirmation.
- The player can restore the default configuration in which all base cards are enabled.
- The availability configuration persists independently from the active game.

### 4.4 Event Deck

The existing Event experience is migrated rather than redesigned.

Required behavior:

- Preserve deck shuffling, single-card drawing, statistics, history, reset, artwork, effect badges, and Vietnamese overlays.
- Move generic deck operations to `deck-core`.
- Move Event metadata and translations to `card-data`.
- Persist Event state locally, which is an improvement over the current in-memory-only behavior.
- Retain the current responsive dark presentation while adopting shared primitives where doing so does not change behavior.

## 5. State and Persistence

Each application owns a versioned local-storage document under a unique key:

```text
bang.character.v1
bang.role.v1
bang.play.v1
bang.play.settings.v1
bang.event.v1
```

On load, an application validates the stored schema before using it. Missing, malformed, or unsupported data falls back to a fresh state without crashing. Resetting one app must not erase another app's state.

Random shuffling occurs only in the browser after hydration so server-rendered markup and the first client render remain consistent.

## 6. Data and Asset Strategy

The untracked `Bang/` directory is a source archive, not part of the product repository. Implementation copies only selected artwork into the owning application's `public/cards/<deck>/` directory: characters belong to Character Deck, roles to Role Deck, play cards to Play Deck, and Events to Event Deck. Shared metadata uses stable app-relative paths such as `/cards/characters/bart-cassidy.png`.

Asset requirements:

- Use stable, normalized filenames rather than retaining inconsistent downloaded names where practical.
- Preserve image aspect ratio and never stretch card artwork.
- Provide an accessible text fallback when an image is missing.
- Avoid committing box art, logos, duplicate catalog images, unrelated games, or unused expansion artwork.
- Do not depend on files outside the repository at build or runtime.

Card metadata, including play-deck copy counts and role distributions, must be represented as typed data and covered by automated tests. Vietnamese text is an unofficial translation and should be labeled as such in the applications.

## 7. User Experience

All four applications share a restrained Western card-table visual language while remaining distinguishable by accent color. The UI prioritizes one-handed phone operation:

- minimum 44-by-44-pixel interactive targets;
- safe-area-aware top and bottom spacing;
- high contrast and readable Vietnamese text;
- clear card-zone labels and numeric counts;
- confirmation before destructive resets;
- visible disabled states instead of buttons that fail silently;
- no hover-only controls;
- meaningful image alternative text and semantic buttons.

The first release does not require desktop-specific layouts beyond responsive scaling.

## 8. Error Handling

- Missing artwork renders a styled text card with the translated name.
- Empty decks disable drawing and explain why.
- Invalid persisted state is discarded per application and replaced with valid fresh state.
- A requested move involving a card not present in the source zone leaves state unchanged.
- Card settings that disable every play-card type are allowed, but new-game creation must clearly warn that the resulting deck is empty.

## 9. Testing and Verification

### Unit tests

- Deck expansion produces the expected instance count and unique IDs.
- Shuffle does not mutate its input and preserves all instances.
- Draw and zone moves preserve card conservation.
- Invalid zone moves are no-ops.
- Disabled definitions are excluded from new decks.
- Default role distributions are correct for four, five, six, and seven players.
- Base character, role, play, and Event datasets have expected counts and required translations.
- Persistence validation accepts supported documents and rejects malformed or unsupported versions.

### Application tests

- Character drawing, health adjustment, replacement, reset, and restoration.
- Role reveal/hide, redraw confirmation, player-count selection, and restoration.
- Play drawing, zone transitions, settings persistence, new-game filtering, and empty-deck handling.
- Event drawing, reset, history, and restoration.

### Release verification

- Run the full workspace test suite.
- Run type checking for every workspace.
- Produce a production build for all four applications.
- Exercise each application at a narrow mobile viewport in a real browser and check for console errors, broken images, overflow, and inaccessible controls.

## 10. Migration Strategy

1. Establish the npm-workspace structure and shared packages without changing the existing Event behavior.
2. Move deck primitives and typed Event data into shared packages.
3. Migrate the current Event application into `apps/event-deck`.
4. Add Character, Role, and Play applications as independent deliverables.
5. Copy only the assets referenced by typed card metadata.
6. Replace the root template scripts with workspace-wide development, test, type-check, and build commands.

Each stage must be committed separately so the monorepo conversion and individual modules remain reviewable.

## 11. Deployment

Each application must be buildable and deployable independently. The initial implementation does not select a hosting provider or publish production deployments. Workspace documentation will identify the command and output directory for each app.

The future combined game may consume `deck-core`, `card-data`, and `shared-ui` directly. No present application may depend on another application.

## 12. Non-Goals

- Online rooms, matchmaking, or realtime synchronization
- User accounts or cloud persistence
- Cross-domain state sharing
- Automated enforcement of the complete BANG! rules
- Automatic character abilities or Sheriff health bonus
- Opponent state, shared table state, or anti-cheat behavior
- Expansion selection in the initial release
- Importing the complete raw `Bang/` archive
- Native mobile applications

## 13. Planned Commit Boundaries

Implementation will use reviewable commits in this order:

1. Monorepo workspace and shared deck foundations
2. Shared base-game metadata, translations, and curated assets
3. Character Deck website
4. Role Deck website
5. Play Deck website and card-availability settings
6. Event Deck migration and persistence
7. Workspace documentation and final verification fixes
