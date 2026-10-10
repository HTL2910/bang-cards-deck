# BANG! Online Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the Character, Role, Play, and Event modules into one mobile-first online BANG! game where 4–7 players join the same room from separate devices and the server enforces the base rules.

**Architecture:** Keep the existing React Router app stack for one unified client. Add a pure TypeScript `game-engine`, a runtime-validated `game-protocol`, and a Node game server using Socket.IO and PostgreSQL; the server commits every command before broadcasting separately filtered public and per-seat private views. The optional Event variant is a separate release-gated slice.

**Tech Stack:** Existing npm workspaces, React 19, React Router 8, TypeScript, Vitest, Testing Library; add Zod for protocol validation, Socket.IO for realtime transport, and `pg` for PostgreSQL. Use Node built-in crypto for random draws and credential generation.

**Spec:** `docs/superpowers/specs/2026-10-10-online-bang-game-design.md`

## Global Constraints

- Four to seven people join one invite-only room from their own phones with live synchronization.
- The server owns authoritative state, role assignment, card draws, turn order, legal actions, outcomes, and persistence.
- Other players’ roles and hands never appear in a seat’s public snapshot, private payload, error response, or logs.
- The Sheriff role is public from the start; other roles are revealed only when rules require it.
- The base BANG! game is the default mode. The existing 28-card Event deck remains optional and cannot be exposed until its full effect matrix passes.
- Players join as guests. No public matchmaking, account profiles, chat, bots, spectator mode, payments, tournaments, or other expansion content is included.
- Use only the repository’s existing curated artwork; public deployment requires a separate rights review.
- WebSocket commands are authenticated, runtime-validated, revision-checked, and idempotent by command ID.
- Persist a state transition before broadcasting it; never trust client-supplied game state or random seeds.
- All UI controls remain keyboard-operable, have accessible names, and meet the existing 44×44 px mobile touch-target baseline.

## Review Focus

- Two simultaneous commands at the same match revision must commit at most one transition; the other seat receives a recoverable stale-revision response. Pin this with a concurrent repository/command test in Task 5.
- Reconnecting with a revoked, expired, or copied credential must not restore a seat or disclose private state. Pin this with credential lifecycle tests in Task 4.
- A multi-step response chain that eliminates its source or target must resolve exactly once without resurrecting a player or duplicating cards. Pin this with elimination/response tests in Task 2.
- Unicode, RTL marks, and oversized display names must render as plain text or be rejected without markup injection or layout-breaking content. Pin this in Task 6.
- If PostgreSQL commits but the socket disconnects before acknowledgement, retrying the same command ID must return the committed result without applying the effect twice. Pin this in Task 5.

---

## File Map

```text
packages/game-engine/                  pure authoritative BANG! state machine and rules
packages/game-protocol/                Zod command, room, and redacted-view contracts
apps/game-server/                      HTTP room API, Socket.IO gateway, PostgreSQL repository
apps/online-game/                      unified React Router lobby and match UI
docker-compose.yml                     local web, game-server, and PostgreSQL services
Dockerfile.web                         production unified web client
Dockerfile.server                      production game server
```

## Task 1: Define the game-engine contract and base-game setup

**Files:**
- Create: `packages/game-engine/package.json`
- Create: `packages/game-engine/tsconfig.json`
- Create: `packages/game-engine/src/types.ts`
- Create: `packages/game-engine/src/setup.ts`
- Create: `packages/game-engine/src/views.ts`
- Create: `packages/game-engine/src/setup.test.ts`
- Create: `packages/game-engine/src/views.test.ts`
- Modify: root `package.json`, `package-lock.json`, `vitest.config.ts`

**Interfaces:**
- Consumes: `CHARACTERS`, `getRoleDefinitions`, `PLAY_CARDS`, `CardInstance`, `expandDeck`, and `shuffle` from existing workspace packages.
- Produces: `createMatch(input: CreateMatchInput, randomInt: RandomInt): MatchState`; `publicMatchView(state: MatchState): PublicMatchView`; `privateSeatView(state: MatchState, seatId: SeatId): PrivateSeatView`; exported types `MatchState`, `PublicMatchView`, `PrivateSeatView`, `SeatId`, `RandomInt`, `CreateMatchInput`.

- [ ] **Step 1: Write failing setup and privacy-view tests**

  Add tests named `creates_4_to_7_player_role_distributions`, `reveals_only_the_sheriff_at_setup`, `deals_character_health_and_starting_hand`, `uses_unique_server_generated_instance_ids`, and `private_view_contains_only_requesting_seat_hand_and_role`. Assert exact role counts for 4–7 players, Sheriff +1 starting/max health, initial hand size equals health, and no other seat’s role/hand is serialized in either view.

- [ ] **Step 2: Run setup tests and verify RED**

  Run: `npm test -- --run packages/game-engine/src/setup.test.ts packages/game-engine/src/views.test.ts`
  Expected: FAIL because `@bang/game-engine` and its public types do not exist.

- [ ] **Step 3: Implement state types, match setup, and filtered views**

  Put the full authoritative `MatchState` in the engine only. Use distinct `PublicMatchView` and `PrivateSeatView` types; do not expose the private-state map through public view helpers. Define `RandomInt = (upperExclusive: number) => number`; the server injects `node:crypto.randomInt(0, upperExclusive)` so tests remain deterministic and shuffles use bounded integer draws.

- [ ] **Step 4: Run setup tests and verify GREEN**

  Run: `npm test -- --run packages/game-engine/src/setup.test.ts packages/game-engine/src/views.test.ts`
  Expected: all setup, distribution, and privacy projection tests pass.

- [ ] **Step 5: Typecheck and commit the engine contract**

  Run: `npm run typecheck --workspace @bang/game-engine`
  Expected: exit 0.

  ```bash
  git add package.json package-lock.json vitest.config.ts packages/game-engine
  git commit -m "feat(engine): add match setup and private state views"
  ```

## Task 2: Implement base turns, card effects, character abilities, and win conditions

**Files:**
- Create: `packages/game-engine/src/commands.ts`
- Create: `packages/game-engine/src/effects/play-cards.ts`
- Create: `packages/game-engine/src/effects/characters.ts`
- Create: `packages/game-engine/src/invariants.ts`
- Create: `packages/game-engine/src/commands.test.ts`
- Create: `packages/game-engine/src/effects/play-cards.test.ts`
- Create: `packages/game-engine/src/effects/characters.test.ts`
- Create: `packages/game-engine/src/invariants.test.ts`
- Modify: `packages/game-engine/src/index.ts`, `packages/game-engine/src/types.ts`

**Interfaces:**
- Consumes: Task 1 `MatchState`, `SeatId`, `RandomInt`, and view types.
- Produces: `applyGameCommand(state: MatchState, seatId: SeatId, command: GameCommand, randomInt: RandomInt): CommandResult`; `GameCommand`; `CommandResult`; `assertMatchInvariants(state: MatchState): void`; legal action descriptions for the requesting seat.

- [ ] **Step 1: Write failing tests for phases, turn order, conservation, and commands**

  Add tests named `starts_sheriff_draw_phase`, `draws_two_then_enters_play_phase`, `ends_turn_after_discarding_to_current_health`, `skips_eliminated_seats_clockwise`, `rejects_out_of_turn_and_wrong_phase_commands`, `rejects_nonowned_card_and_invalid_target`, and `conserves_each_card_instance_across_zones`. Include exhaustion and discard-pile reshuffle; revision checks belong to the server gateway in Task 5.

- [ ] **Step 2: Run command tests and verify RED**

  Run: `npm test -- --run packages/game-engine/src/commands.test.ts`
  Expected: FAIL because the command reducer is not implemented.

- [ ] **Step 3: Implement draw/play/discard phases and match invariants**

  Implement immutable transitions. Every transition preserves one owner per card UID and validates phase, current seat, alive status, card ownership, and target before mutation.

- [ ] **Step 4: Write failing tests for all 22 base play-card definitions**

  Add a table-driven test `resolves_each_base_card_effect` covering BANG!, MISSED!, Beer, Cat Balou, Panic!, Stagecoach, Wells Fargo, General Store, Indians!, Gatling, Duel, Saloon, Barrel, Dynamite, Jail, Mustang, Scope, Volcanic, Schofield, Remington, Rev. Carabine, and Winchester. Assert pending private choices, targets, distance, duration, responses, and discard effects as applicable. Also test one BANG! limit, Volcanic, one weapon, duplicate in-play names, and end-turn hand limit.

- [ ] **Step 5: Run play-card tests and verify RED**

  Run: `npm test -- --run packages/game-engine/src/effects/play-cards.test.ts`
  Expected: FAIL for the unimplemented typed effect registry and effect cases.

- [ ] **Step 6: Implement typed play-card effects and response chains**

  Add a discriminated effect type separate from `textVi`. Model target selection, General Store picks, BANG!/MISSED! response, Duel, Indians!, Barrel draws, Dynamite timing, Jail timing, life changes, and death as explicit pending resolutions. The server RNG chooses cards; user choices remain commands from the appropriate seat.

- [ ] **Step 7: Write failing tests for all 16 character abilities and terminal conditions**

  Add table-driven tests `applies_each_character_ability_at_its_trigger`, plus `sheriff_penalty_discards_all_owned_cards`, `outlaw_elimination_rewards_three_cards`, `renegade_wins_only_as_last_alive_after_sheriff_death`, `law_wins_when_all_outlaws_and_renegade_are_eliminated`, and `response_chain_elimination_is_applied_once`. Verify abilities trigger exactly at their documented timing and card ownership remains conserved if an actor dies mid-resolution.

- [ ] **Step 8: Run character/win tests and verify RED**

  Run: `npm test -- --run packages/game-engine/src/effects/characters.test.ts`
  Expected: FAIL for missing character triggers and victory resolution.

- [ ] **Step 9: Implement character triggers, elimination, rewards, and victories**

  Implement the 16 cataloged abilities as typed triggers. Resolve last-life Beer responses before elimination; apply Sheriff/Outlaw consequences and role-based victory only after the current effect chain reaches a stable state.

- [ ] **Step 10: Run the whole engine suite and typecheck**

  Run: `npm test -- --run packages/game-engine`
  Expected: all engine tests pass with card-conservation invariants intact.

  Run: `npm run typecheck --workspace @bang/game-engine`
  Expected: exit 0.

- [ ] **Step 11: Commit the playable base-game engine**

  ```bash
  git add packages/game-engine
  git commit -m "feat(engine): implement base Bang rules and card effects"
  ```

## Task 3: Add runtime protocol schemas and PostgreSQL persistence

**Files:**
- Create: `packages/game-protocol/package.json`
- Create: `packages/game-protocol/tsconfig.json`
- Create: `packages/game-protocol/src/index.ts`
- Create: `packages/game-protocol/src/schemas.ts`
- Create: `packages/game-protocol/src/views.ts`
- Create: `packages/game-protocol/src/schemas.test.ts`
- Create: `apps/game-server/package.json`
- Create: `apps/game-server/tsconfig.json`
- Create: `apps/game-server/src/db/pool.ts`
- Create: `apps/game-server/src/db/migrations/001_rooms.sql`
- Create: `apps/game-server/src/db/postgres-room-repository.ts`
- Create: `apps/game-server/src/db/postgres-room-repository.test.ts`
- Create: `apps/game-server/src/db/room-repository.contract.test.ts`
- Create: `apps/game-server/src/db/room-repository.ts`
- Modify: root workspace and test configuration; add `zod` to protocol dependencies and `pg` plus `@types/pg` to game-server dependencies

**Interfaces:**
- Consumes: Task 1 public/private view types and Task 2 `MatchState`/`GameCommand`.
- Produces: Zod schemas `createRoomSchema`, `joinRoomSchema`, `clientCommandSchema`; `RoomRepository` with transactional `create`, `join`, `getSeatSession`, `commitCommand`, `loadRoom`, `expireRooms`; `PostgresRoomRepository` implementing that interface.

- [ ] **Step 1: Write failing protocol-schema tests**

  Add tests named `accepts_only_known_game_commands`, `rejects_oversized_or_unknown_payload_fields`, `requires_valid_room_and_seat_ids`, `keeps_public_and_private_view_shapes_disjoint`, and `rejects_client_random_seed_or_full_state_fields`.

- [ ] **Step 2: Run protocol tests and verify RED**

  Run: `npm test -- --run packages/game-protocol/src/schemas.test.ts`
  Expected: FAIL because `@bang/game-protocol` is not yet defined.

- [ ] **Step 3: Implement protocol contracts and runtime validation**

  Use Zod discriminated unions matching Task 2 commands. Strip or reject unknown fields; impose explicit string/array/message-size limits. Keep public and private view schemas separate.

- [ ] **Step 4: Write failing repository tests**

  Add repository contract tests named `creates_and_joins_room_transactionally`, `serializes_concurrent_revision_commits`, `deduplicates_command_ids`, `loads_only_requested_private_seat_view`, and `expires_abandoned_rooms` in `room-repository.contract.test.ts`. Run the same contract against an in-memory fixture; reserve PostgreSQL locking/migration checks for Task 8's database-backed acceptance suite.

- [ ] **Step 5: Run repository tests and verify RED**

  Run: `npm test -- --run apps/game-server/src/db/room-repository.contract.test.ts`
  Expected: FAIL because repository contracts and SQL schema do not exist.

- [ ] **Step 6: Implement migration, repository, and transaction boundaries**

  Use PostgreSQL row locks or equivalent serializable transactions to compare expected revisions, record idempotency keys, append committed events, and update room state atomically. Store reconnect-token hashes and seat-private game data in server-only columns/tables. Never query private data into a public projection.

- [ ] **Step 7: Run protocol/repository tests and typecheck**

  Run: `npm test -- --run packages/game-protocol apps/game-server/src/db/room-repository.contract.test.ts`
  Expected: all schema and repository contract tests pass.

  Run: `npm run typecheck --workspace @bang/game-protocol && npm run typecheck --workspace @bang/game-server`
  Expected: exit 0.

- [ ] **Step 8: Commit protocol and persistence**

  ```bash
  git add package.json package-lock.json vitest.config.ts packages/game-protocol apps/game-server
  git commit -m "feat(server): add validated room persistence"
  ```

## Task 4: Implement guest rooms, credentials, and lobby lifecycle

**Files:**
- Create: `apps/game-server/src/rooms/room-service.ts`
- Create: `apps/game-server/src/rooms/room-service.test.ts`
- Create: `apps/game-server/src/security/credentials.ts`
- Create: `apps/game-server/src/security/credentials.test.ts`
- Create: `apps/game-server/src/http/app.ts`
- Create: `apps/game-server/src/http/routes.ts`
- Create: `apps/game-server/src/http/routes.test.ts`
- Create: `apps/game-server/src/server.ts`
- Modify: `apps/game-server/package.json`, root scripts; add Socket.IO to server dependencies and `tsx` to server development dependencies

**Interfaces:**
- Consumes: Task 3 schemas and `RoomRepository`; Task 1 `createMatch`.
- Produces: `RoomService.createRoom`, `joinRoom`, `startMatch`, `leaveRoom`, `reconnect`, `transferHost`; HTTP endpoints `POST /api/rooms`, `POST /api/rooms/:code/join`, `GET /api/rooms/:code`, `POST /api/rooms/:code/start`, and `POST /api/rooms/:code/leave`.

- [ ] **Step 1: Write failing room-flow and credential tests**

  Test `creates_invite_room_with_unpredictable_code`, `joins_up_to_seven_distinct_seats`, `rejects_eighth_seat_and_invalid_names`, `only_host_can_change_mode_or_start`, `starts_when_configured_player_count_is_present`, `reconnects_with_valid_token`, `rejects_expired_or_revoked_token`, `transfers_host_deterministically`, and `expires_abandoned_lobby`. Include Unicode, RTL marks, whitespace-only, and oversized names.

- [ ] **Step 2: Run room tests and verify RED**

  Run: `npm test -- --run apps/game-server/src/rooms apps/game-server/src/security`
  Expected: FAIL because guest room and credential services do not exist.

- [ ] **Step 3: Implement credentials and lobby service**

  Generate room identifiers and seat reconnect credentials using `node:crypto`; persist only token hashes. Treat display names as text, normalize/limit them, and never render as HTML. Default to one active room session per browser credential.

- [ ] **Step 4: Add HTTP endpoints with authentication and rate limits**

  Use Node's built-in HTTP server shared with Socket.IO. Validate every request with Task 3 schemas, rate-limit room creation/join failures/invalid commands, set the reconnect credential in a Secure/HttpOnly/SameSite cookie in production, and check request Origin on state-changing cookie-authenticated endpoints to prevent CSRF. Use an explicit local-development cookie setting only in development.

- [ ] **Step 5: Run room/security tests and typecheck**

  Run: `npm test -- --run apps/game-server/src/rooms apps/game-server/src/security apps/game-server/src/http`
  Expected: all room, credential, and endpoint tests pass.

  Run: `npm run typecheck --workspace @bang/game-server`
  Expected: exit 0.

- [ ] **Step 6: Commit guest room lifecycle**

  ```bash
  git add apps/game-server package.json
  git commit -m "feat(server): add guest room lifecycle"
  ```

## Task 5: Add authenticated realtime commands and redacted synchronization

**Files:**
- Create: `apps/game-server/src/realtime/gateway.ts`
- Create: `apps/game-server/src/realtime/gateway.test.ts`
- Create: `apps/game-server/src/realtime/payload-redaction.test.ts`
- Create: `apps/game-server/src/observability/redact.ts`
- Modify: `apps/game-server/src/server.ts`, `apps/game-server/package.json`; add Socket.IO client to online-game dependencies

**Interfaces:**
- Consumes: Task 2 `applyGameCommand` and views; Task 3 protocol/repository; Task 4 session authentication.
- Produces: Socket.IO namespace `/game`; client events `room:subscribe`, `game:command`; server events `room:snapshot`, `game:update`, `game:rejected`; all payloads use versioned Task 3 schemas.

- [ ] **Step 1: Write failing realtime authorization, privacy, and concurrency tests**

  Test `sends_public_view_to_every_seat`, `sends_private_view_only_to_matching_seat`, `rejects_nonmember_subscription`, `rejects_malformed_and_oversized_commands`, `rejects_stale_revision_without_mutation`, `same_command_id_commits_once_after_lost_ack`, `concurrent_same_revision_commands_commit_once`, `pauses_pending_private_response_until_reconnecting_seat_returns`, and `redacts_tokens_roles_and_hands_from_logs` using at least two simulated Socket.IO clients.

- [ ] **Step 2: Run gateway tests and verify RED**

  Run: `npm test -- --run apps/game-server/src/realtime`
  Expected: FAIL because the authenticated realtime gateway does not exist.

- [ ] **Step 3: Implement authenticated socket sessions and room subscriptions**

  Authenticate from the room-scoped reconnect cookie/session exchange. Join only the verified room/seat channel. Emit public and private data as separate events and compute each payload from the current committed revision.

- [ ] **Step 4: Implement command handling, idempotency, and durable broadcast order**

  Validate payload, seat, command ID, expected revision, phase, and ownership; call the engine; persist atomically; then acknowledge and broadcast. On duplicate ID return the prior result. On stale revision return a newly filtered snapshot. Log only redacted metadata.

- [ ] **Step 5: Run realtime/privacy tests and typecheck**

  Run: `npm test -- --run apps/game-server/src/realtime`
  Expected: all multi-client authorization, privacy, and concurrency tests pass.

  Run: `npm run typecheck --workspace @bang/game-server`
  Expected: exit 0.

- [ ] **Step 6: Commit realtime synchronization**

  ```bash
  git add apps/game-server
  git commit -m "feat(server): synchronize private multiplayer match state"
  ```

## Task 6: Build the unified online-game lobby and match interface

**Files:**
- Create: `apps/online-game/package.json`
- Create: `apps/online-game/react-router.config.ts`
- Create: `apps/online-game/vite.config.ts`
- Create: `apps/online-game/tsconfig.json`
- Create: `apps/online-game/app/root.tsx`
- Create: `apps/online-game/app/routes.ts`
- Create: `apps/online-game/app/routes/home.tsx`
- Create: `apps/online-game/app/routes/lobby.tsx`
- Create: `apps/online-game/app/routes/match.tsx`
- Create: `apps/online-game/app/client/room-client.ts`
- Create: `apps/online-game/app/client/room-client.test.ts`
- Create: route component tests under `apps/online-game/app/routes/`
- Create: `apps/online-game/app/app.css`
- Modify: root workspace scripts and `package-lock.json`; add `socket.io-client` and `@playwright/test` as appropriate workspace dependencies

**Interfaces:**
- Consumes: Task 3 protocol/view schemas and Task 5 Socket.IO events.
- Produces: `RoomClient.createRoom`, `joinRoom`, `subscribe`, `sendCommand`, `reconnect`, and routes `/`, `/room/:code`, `/room/:code/game`.

- [ ] **Step 1: Write failing lobby and client tests**

  Test `creates_room_and_copies_join_link`, `joins_room_with_display_name`, `shows_seats_and_connection_status`, `only_host_sees_start_action`, `shows_full_room_error`, `reconnects_without_revealing_private_data_early`, and `escapes_unicode_display_name_as_text`.

- [ ] **Step 2: Run client/lobby tests and verify RED**

  Run: `npm test -- --run apps/online-game`
  Expected: FAIL because the unified client package and routes do not exist.

- [ ] **Step 3: Implement room client and lobby routes**

  Use protocol schemas at the client boundary and expose only serializable public/private view models. Keep the join code visible and copyable; present seat occupancy and reconnect states accessibly. The host can start once the configured seat count is filled.

- [ ] **Step 4: Write failing match-screen tests**

  Test `renders_public_player_order_health_and_equipment`, `renders_only_local_role_and_hand`, `shows_active_phase_and_pending_response`, `sends_only_selected_card_command`, `shows_server_rejection_without_optimistic_state_mutation`, `hides_private_area_until_player_reveals_it`, `uses_keyboard_accessible_controls_with_44px_touch_targets`, `announces_phase_and_connection_without_private_content`, and `supports_safe_area_in_portrait_and_landscape`.

- [ ] **Step 5: Run match-screen tests and verify RED**

  Run: `npm test -- --run apps/online-game/app/routes/match.test.tsx`
  Expected: FAIL because the authoritative match view is not rendered.

- [ ] **Step 6: Implement responsive lobby and match UI**

  Render public board information separately from the local seat’s private panel. Cover draw/play/discard, card targets, BANG!/MISSED! responses, General Store selection, end-turn hand-limit discards, health changes, Event indicator, reconnect state, and terminal winner reveal using server legal-action descriptions.

- [ ] **Step 7: Run UI tests and typecheck**

  Run: `npm test -- --run apps/online-game`
  Expected: all lobby, privacy, error, keyboard, and touch-target assertions pass.

  Run: `npm run typecheck --workspace @bang/online-game`
  Expected: exit 0.

- [ ] **Step 8: Commit the unified client**

  ```bash
  git add package.json package-lock.json apps/online-game
  git commit -m "feat(web): add unified online game client"
  ```

## Task 7: Integrate the optional Event variant

**Files:**
- Create: `packages/game-engine/src/effects/events.ts`
- Create: `packages/game-engine/src/effects/events.test.ts`
- Modify: `packages/card-data/src/types.ts`, `packages/card-data/src/events.ts`, `packages/game-engine/src/types.ts`, `packages/game-engine/src/commands.ts`, `apps/game-server`, `apps/online-game`

**Interfaces:**
- Consumes: Task 2 base engine and existing `EVENT_CARDS`; Tasks 3–6 protocol/server/client interfaces.
- Produces: typed `EventEffect`, `eventEnabled` match configuration, event advancement/resolution commands, and public current-event state.

- [ ] **Step 1: Write failing effect tests for every Event card**

  Add table-driven `resolves_all_28_event_effects_at_documented_timing`; add focused tests for persistent modifiers, extra turns, direction changes, simultaneous effects, player death during event resolution, and interactions with pending BANG!/Duel responses. Assert unsupported effects cannot be enabled.

- [ ] **Step 2: Run Event tests and verify RED**

  Run: `npm test -- --run packages/game-engine/src/effects/events.test.ts`
  Expected: FAIL because Event cards have display text but no executable effect contract.

- [ ] **Step 3: Add typed Event effects and implement effect resolution**

  Keep event display text out of the rules engine. Encode exact effect timing and duration from the chosen official Event rules, and make event draws/reveals server-authoritative.

- [ ] **Step 4: Add lobby selection and match UI for the variant**

  Only the host chooses the variant before start. Keep the control disabled with an explanation until the complete Event test matrix passes. When enabled, publish the current event and its duration without exposing private player data.

- [ ] **Step 5: Run all Event and full game-engine tests**

  Run: `npm test -- --run packages/game-engine apps/online-game`
  Expected: all 28 Event cases and base-engine/client tests pass.

  Run: `npm run typecheck --workspace @bang/game-engine && npm run typecheck --workspace @bang/online-game`
  Expected: exit 0.

- [ ] **Step 6: Commit the Event variant**

  ```bash
  git add packages/card-data packages/game-engine apps/game-server apps/online-game
  git commit -m "feat(events): add optional synchronized event mode"
  ```

## Task 8: Package local deployment and complete multi-client acceptance

**Files:**
- Create: `Dockerfile.web`
- Create: `Dockerfile.server`
- Create: `docker-compose.yml`
- Create: `apps/game-server/src/health.ts`
- Create: `apps/game-server/src/health.test.ts`
- Create: `apps/online-game/e2e/full-match.spec.ts`
- Create: `playwright.config.ts`
- Create: `apps/game-server/src/db/postgres-migrations.test.ts`
- Create: `apps/game-server/src/db/postgres-room-repository.test.ts`
- Modify: root `package.json`, `.gitignore`, `README.md`

**Interfaces:**
- Consumes: all preceding packages/apps and their health/state contracts.
- Produces: root scripts `dev:web`, `dev:server`, `db:up`, `db:down`, `test:e2e`; `/health/live` and `/health/ready`; reproducible local full-stack startup.

- [ ] **Step 1: Write failing health and browser acceptance checks**

  Test `reports_live_without_database_and_ready_only_with_database`, PostgreSQL room-repository transaction/concurrency/idempotency behavior, and `postgres_migrations_recover_committed_rooms_after_server_restart`. Add a multi-context browser scenario `four_players_complete_base_match_and_reconnect`: create room, join three additional clients, assign private roles, finish turns, resolve BANG!/MISSED!, eliminate a player, award Outlaw reward, disconnect/reconnect a seat, complete a win, and reveal roles. Include a network assertion that no client receives another seat’s private role/hand.

- [ ] **Step 2: Run acceptance checks and verify RED**

  Run: `npm run test:e2e`
  Expected: FAIL because health routes, deployment services, and browser flow are not implemented.

- [ ] **Step 3: Add readiness/liveness and container orchestration**

  Provide PostgreSQL health checks, run migrations before accepting traffic, keep secrets in environment configuration, expose only the web port by default, and use an internal network for the database.

- [ ] **Step 4: Run the full-stack browser scenario on phone-sized viewports**

  Run: `npm run test:e2e`
  Expected: the four-client match reaches a terminal result without console/network errors or private-state leakage.

- [ ] **Step 5: Run release verification and document setup**

  Run: `npm test && npm run typecheck && npm run build`
  Expected: all unit/integration suites pass, every workspace typechecks, and both production images build.

- [ ] **Step 6: Document deployment and privacy behavior**

  Document environment variables, PostgreSQL setup, local start commands, room/credential lifecycle, match expiration, supported player counts, base rules, optional Event release gate, and public-launch rights review.

- [ ] **Step 7: Commit deployable release**

  ```bash
  git add README.md package.json package-lock.json .gitignore Dockerfile.web Dockerfile.server docker-compose.yml apps packages
  git commit -m "chore(deploy): package online Bang game for local hosting"
  ```

## Final verification

- Run `npm test`, `npm run typecheck`, and `npm run build` from the repository root.
- Start the full stack from a clean checkout and verify web, game server, and database readiness.
- Run the four-client browser acceptance flow and inspect private network payloads, console output, and mobile layouts.
- Confirm no files from `/Bang/` or unreferenced card artwork entered Git.
- Run `git diff --check` and a final read-only review of the full implementation range.
