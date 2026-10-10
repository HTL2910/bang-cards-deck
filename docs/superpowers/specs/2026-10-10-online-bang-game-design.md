# BANG! Online — Design Specification

**Date:** 2026-10-10  
**Status:** Draft for user review  
**Replaces:** The local-only product boundary in `2026-10-09-bang-deck-monorepo-design.md` for the unified-game work only.

## 1. Purpose

Turn the four existing deck tools into one mobile-first web game. Four to seven people join the same room from their own phones, receive private information only on their own device, and play one synchronized BANG! base-game match. The server owns the authoritative match state and enforces legal actions so reconnecting players see the same game.

The existing Character, Role, Play, and Event modules become parts of the room setup and match experience rather than separate websites. The base BANG! game is the default mode; the existing 28-card Event deck is an optional match variant.

## 2. Decisions and assumptions to review

- “Online” means multiple players in one invite-only room on separate devices, with live synchronization.
- “Complete game” is interpreted as an automated game engine for the base set: turn order, legal card plays, targets, responses, damage, elimination, rewards, and victory. This is a scope assumption, not yet confirmed by the user.
- Rooms support 4–7 players. Players join as guests; no account or public matchmaking is required for the first release.
- A room host creates the room and starts the match when the required player count is present. If the host disconnects, the room remains available and host control transfers to a connected player.
- The current 28 Event cards are an optional advanced variant. Their event rules are represented as typed effects and tested individually; unsupported or ambiguous effects must block starting that variant rather than silently behave incorrectly.
- The implementation is provider-neutral: a Node.js authoritative server, WebSocket transport, and PostgreSQL persistence are the recommended starting architecture. Public hosting provider, domain, and production credentials remain deployment choices.
- The project’s existing card illustrations are retained for the prototype. A public launch requires a rights review for the name, artwork, and card text; no additional artwork is added by this project.

## 3. Approaches considered

### A. Authoritative Node server with WebSockets and PostgreSQL — recommended

Use the existing React Router application as the web client and add a server-side game module. Clients send commands; the server validates them, updates the match transactionally, and sends each seat a public snapshot plus only that seat’s private hand and role. PostgreSQL supports room recovery and persistent matches. This has more implementation work but gives one clear security boundary for hidden information and rule enforcement.

### B. Managed realtime database

Use a managed service such as Supabase or Firebase for room storage and subscriptions. This can reduce infrastructure work, but hidden roles and hands depend on carefully enforced per-seat access rules and server-side validation. It also introduces provider-specific policies and deployment decisions.

### C. Browser-hosted peer-to-peer room

Let one player’s browser coordinate the room over peer connections. This avoids a persistent server, but host disconnects, reconnection, authority, and hidden-state protection are weaker. It is not recommended for a complete rules-enforced game.

## 4. Product experience

### 4.1 Room flow

1. A player creates a room and receives a short room code plus a shareable join link.
2. Other players join from their own devices and choose a display name.
3. The lobby shows seats, connection status, selected mode, and the host’s start controls. Roles and cards are not assigned until the host starts.
4. The host starts a 4–7 player match. The server shuffles and assigns roles and characters, then privately delivers each player’s role and hand.
5. The match screen shows public player order, character, health, equipment, discard pile, current turn and public event. Each player sees their own role and hand privately.
6. Players submit actions from their own device. The server rejects invalid, stale, out-of-turn, or unauthorized actions with a recoverable explanation.
7. When a victory condition is reached, the server ends the match, reveals roles, and displays the winning side and match summary. The host can start a rematch in the same room.

### 4.2 Privacy

- Role, hand, choices that must remain private, and any unrevealed draw results are private to that seat.
- The Sheriff role is public from the start; other roles are revealed only when the official rules require it, including elimination and game end.
- A public state update must never contain another player’s private role or hand, even if the UI does not render those fields.
- Role assignment, drawing, and shuffling occur on the server. Clients cannot choose or predict the server’s random result through a supplied seed.
- Joining a room requires both the room code and a per-seat reconnect credential. Room codes are for discovery, not authorization.

## 5. Rules and match scope

### 5.1 Base-game setup

- Support the standard 4–7 player role distributions: 4: Sheriff, 2 Outlaws, Renegade; 5: add 1 Deputy; 6: use 3 Outlaws and 1 Deputy; 7: use 3 Outlaws and 2 Deputies.
- Assign one role face down per player; reveal the Sheriff.
- Assign one character per player and use that character’s printed health/ability. The Sheriff receives one additional maximum and starting health.
- Deal starting cards equal to current health.
- The Sheriff takes the first turn. Turns normally proceed clockwise among living players.

### 5.2 Turn phases and shared rules

- A turn has draw, play, and discard phases. Normally draw two cards, play any legal number of cards, then discard down to current health.
- Reshuffle the discard pile into the draw pile when a draw is required and the draw pile is empty.
- Enforce one BANG! card per turn unless an active card/character/event rule changes the limit; a player may have only one weapon and no duplicate named blue card in play.
- Compute circular distance using living seats, weapon range, Mustang, and Scope. Card effects that ignore distance must be modeled explicitly.
- Resolve responses as server-managed pending actions. Only the target seat can answer a private response; timeout/disconnect policy must not silently pick a response that changes game outcome.
- Resolve elimination, discard/equipment handling, Sheriff penalty for eliminating a Deputy, Outlaw reward, and victory conditions on the server.
- Implement every one of the 22 current base-play definitions and 16 character abilities as typed, testable effects. Rules text is display content, not executable logic.

### 5.3 Event variant

- Let the host enable or disable the existing 28-card Event deck before the match starts.
- When enabled, the server advances and applies an event at the documented point in the round, including persistent turn-order/rule modifiers and triggered event effects.
- Event effects must be individually represented as typed operations over match state, with tests for duration, trigger timing, player elimination, and interactions with pending responses.
- The Event variant must pass its full effect test matrix before it is exposed as playable. Until then, it remains disabled in release builds; the base game remains playable.

### 5.4 Explicit exclusions for the first release

- Expansion content other than the currently cataloged Event set, custom cards, bots, public matchmaking, spectators, chat, voice/video, payments, ratings, and tournaments.
- Cross-room identity, long-lived accounts, and player profiles.
- Supporting rule variants that are not represented by the official base rules or the chosen Event rules.

## 6. Architecture and data flow

### 6.1 Components

- **Unified React Router client:** one route family for home, lobby, match, and rematch; mobile-first public board plus seat-private panels.
- **Room API:** create/join/leave room, select mode, ready status, start match, and reconnect.
- **Authoritative game service:** pure TypeScript commands and reducers for setup, turns, card effects, responses, events, elimination, and victory. It has no browser dependencies.
- **Realtime gateway:** authenticated WebSocket seat connection; publishes versioned public and private state updates.
- **PostgreSQL:** stores room metadata, seats, match state, event log, reconnect credential hashes, and schema version. Secrets and private state are never placed in public room rows or public event payloads.
- **Shared packages:** reuse `deck-core`, `card-data`, and `shared-ui`; extend card data with typed effects and validation instead of encoding rules in React components.

### 6.2 Command and event contract

- Each client command includes room ID, seat credential, expected match revision, command ID, and a typed action payload.
- The server authenticates the seat, checks room membership and revision, validates turn/phase/target/card ownership, applies one transition, persists it, then emits updates.
- Repeated command IDs are idempotent. A stale revision returns the current seat-appropriate snapshot and a conflict message.
- Public state and each seat’s private state are serialized separately. Logs and diagnostics redact reconnect credentials, role identities before reveal, and card contents from private hands.
- Store a bounded event history for recovery and audit. The server must not trust a client-supplied full state.

### 6.3 Reconnection and lifecycle

- A reload or temporary network loss reconnects to the same seat with its credential and restores current public/private state.
- Disconnecting does not forfeit a player immediately. The lobby marks them disconnected; active matches pause at required private decisions or use an explicitly configured host policy.
- Room expiration and abandoned-room cleanup use documented TTLs. Completed match summaries remain available only while the room exists.
- Host transfer is deterministic and does not change turn order, roles, cards, or match revision beyond the lifecycle event.

## 7. Security and abuse handling

- Use high-entropy reconnect tokens, store only their hashes, and never put them in room URLs, logs, or analytics.
- Rate-limit room creation, join attempts, and invalid commands; make room codes resistant to enumeration.
- Validate all payloads on the server with runtime schemas and enforce per-action authorization.
- Restrict room reads to members; enforce role/hand privacy at the server boundary, not only through frontend filtering.
- Use secure same-site cookies or a short-lived credential exchange appropriate to the deployment; protect state-changing HTTP endpoints from CSRF.
- Bound message sizes, event-history size, and room duration. Avoid accepting executable or arbitrary rule data from clients.
- Define data deletion and retention for expired rooms; collect no personal data beyond display name and short-lived room credentials.

## 8. Error handling and fairness

- The server is the source of truth for randomness, card ownership, turn order, and outcomes.
- Invalid actions leave state unchanged and return a localized reason.
- If persistence fails, do not broadcast an uncommitted state transition.
- If a seat reconnects after an action, its snapshot reflects exactly one committed transition.
- Match state is versioned. Unsupported saved versions are not silently coerced; the room is marked unavailable with an actionable recovery message.
- Do not invent automatic choices for private decisions such as selecting a General Store card, target, response, or event choice. Pause and wait for that player; expose host recovery only as an explicit, visible rule.

## 9. Accessibility and responsive behavior

- Vietnamese is the default interface language; card artwork remains as provided with accessible Vietnamese text.
- All controls have semantic labels, keyboard operation, focus indicators, and at least 44×44 px touch targets.
- The active player, phase, pending response, and connection state are announced as status updates without exposing private information on shared screens.
- Provide a deliberate “hide private area” interaction for players using a shared physical space; never reveal private content automatically after reconnect.
- Support narrow phone screens first, then tablet/desktop layouts for the public board.

## 10. Testing and release criteria

### Domain tests

- Property/invariant tests for card conservation, one owner per card instance, legal state transitions, turn progression, and reproducible replay from a committed event log.
- Table-driven rules tests for all 22 play-card effects, all 16 character abilities, all role distributions, damage/response chains, penalties/rewards, and both victory conditions.
- Event variant tests per card, including duration and interactions. The variant stays hidden unless all tests pass.
- Rejection tests for out-of-turn actions, invalid targets/range, duplicate equipment, illegal responses, stale revisions, duplicate command IDs, and attempts to move another seat’s private card.

### Security and integration tests

- Two or more simulated clients prove roles and hands are never included in another seat’s HTTP response, WebSocket payload, replay, or error details.
- Room tests cover create/join/full room, wrong credentials, disconnection/reconnect, host transfer, expiry, persistence restart, and concurrent commands.
- Run the server and clients from a clean install; production container must start with its database dependency and health checks.

### Browser acceptance

- Complete a 4-player match from separate browser contexts on mobile-sized viewports, including secret role draw, BANG!/MISSED! response, turn end/discard, elimination/reward, reconnect, and win reveal.
- Confirm that an unauthorized client cannot inspect another player’s hand or role through DOM, network payloads, or browser storage.
- Confirm all routes work on refresh, no console/network errors occur during a complete match, and controls remain usable in portrait and landscape.

### Release gate

The base mode is releasable only when every base card/character rule is implemented and the multiplayer privacy/integration/browser acceptance checks pass. Event mode is separately gated by the Event effect matrix. Public hosting is a separate deployment decision after a target environment and rights review are confirmed.

## 11. Open decisions for review

1. Confirm that “game hoàn thiện” means the server automatically enforces the base-game rules and effects, as assumed here.
2. Confirm whether the Event variant must ship in the first playable release or may follow after the base mode.
3. Confirm the proposed anonymous room model and hosting-agnostic server/PostgreSQL architecture, or name a preferred hosting/backend provider.

## 12. Rules reference

Base rules source: [Official BANG! Fourth Edition English rulebook](https://www.dvgiochi.com/giochi/bang/download/Bang_rules_ENG.pdf). Vietnamese application text remains an unofficial translation. The implementation must encode rules in original, testable code and must not copy large passages from the rulebook.
