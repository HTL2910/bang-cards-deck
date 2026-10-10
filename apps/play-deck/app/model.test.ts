import { describe, expect, it } from "vitest";

import {
  adjustHealth,
  createDefaultPlaySettings,
  createPlayState,
  drawToHand,
  movePlayCard,
  toggleCardEnabled,
  type PlayState,
} from "./model";
import {
  loadPlaySettings,
  loadPlayState,
  PLAY_SETTINGS_STORAGE_KEY,
  PLAY_STORAGE_KEY,
  savePlaySettings,
  savePlayState,
} from "./storage";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

function putInHand(state: PlayState, id: string): PlayState {
  const card = state.deck.find((item) => item.id === id);
  if (!card) throw new Error(`Missing fixture card ${id}`);
  return movePlayCard(state, "deck", "hand", card.uid);
}

function totalCards(state: PlayState) {
  return state.deck.length + state.hand.length + state.inPlay.length + state.discard.length;
}

describe("Play model", () => {
  it("creates the default 80-card deck with unique instance IDs", () => {
    const state = createPlayState(createDefaultPlaySettings());

    expect(state.deck).toHaveLength(80);
    expect(new Set(state.deck.map(({ uid }) => uid)).size).toBe(80);
    expect(state.hand).toEqual([]);
    expect(state.inPlay).toEqual([]);
    expect(state.discard).toEqual([]);
  });

  it("draws one or two cards to hand without mutating its input", () => {
    const initial = createPlayState(createDefaultPlaySettings());
    const one = drawToHand(initial, 1);
    const two = drawToHand(one, 2);

    expect(initial.deck).toHaveLength(80);
    expect(one.hand).toHaveLength(1);
    expect(one.deck).toHaveLength(79);
    expect(two.hand).toHaveLength(3);
    expect(two.deck).toHaveLength(77);
  });

  it("clamps overdraw to the remaining deck", () => {
    const state = createPlayState({ disabledIds: [
      "missed", "beer", "cat-balou", "panic", "stagecoach", "wells-fargo",
      "general-store", "indians", "gatling", "duel", "saloon", "barrel",
      "dynamite", "jail", "mustang", "scope", "volcanic", "schofield",
      "remington", "rev-carabine", "winchester",
    ] });

    const result = drawToHand(state, 99);
    expect(result.deck).toEqual([]);
    expect(result.hand).toHaveLength(25);
  });

  it("moves action cards from hand to discard", () => {
    const state = putInHand(createPlayState(createDefaultPlaySettings()), "bang");
    const result = movePlayCard(state, "hand", "discard", state.hand[0].uid);

    expect(result.hand).toEqual([]);
    expect(result.discard.map(({ id }) => id)).toEqual(["bang"]);
  });

  it("moves equipment into play and later to discard", () => {
    const state = putInHand(createPlayState(createDefaultPlaySettings()), "barrel");
    const equipped = movePlayCard(state, "hand", "inPlay", state.hand[0].uid);
    const discarded = movePlayCard(equipped, "inPlay", "discard", equipped.inPlay[0].uid);

    expect(equipped.inPlay.map(({ id }) => id)).toEqual(["barrel"]);
    expect(discarded.inPlay).toEqual([]);
    expect(discarded.discard.map(({ id }) => id)).toEqual(["barrel"]);
  });

  it("ignores a missing card and conserves all cards across zones", () => {
    const state = drawToHand(createPlayState(createDefaultPlaySettings()), 2);

    expect(movePlayCard(state, "hand", "discard", "missing")).toEqual(state);
    expect(totalCards(state)).toBe(80);
    expect(totalCards(movePlayCard(state, "hand", "discard", state.hand[0].uid))).toBe(80);
  });

  it("adjusts health manually and clamps it at zero", () => {
    const state = createPlayState(createDefaultPlaySettings());

    expect(adjustHealth(state, 2).health).toBe(6);
    expect(adjustHealth(state, -100).health).toBe(0);
  });

  it("removes every copy of disabled cards from a new game", () => {
    const settings = toggleCardEnabled(createDefaultPlaySettings(), "bang");
    const state = createPlayState(settings);

    expect(state.deck).toHaveLength(55);
    expect(state.deck.some(({ id }) => id === "bang")).toBe(false);
  });

  it("allows every card type to be disabled for an explicitly empty deck", () => {
    const settings = { disabledIds: [
      "bang", "missed", "beer", "cat-balou", "panic", "stagecoach", "wells-fargo",
      "general-store", "indians", "gatling", "duel", "saloon", "barrel",
      "dynamite", "jail", "mustang", "scope", "volcanic", "schofield",
      "remington", "rev-carabine", "winchester",
    ] };

    expect(createPlayState(settings).deck).toEqual([]);
  });

  it("does not mutate an active game when settings change", () => {
    const state = createPlayState(createDefaultPlaySettings());
    const settings = toggleCardEnabled(createDefaultPlaySettings(), "bang");

    expect(settings.disabledIds).toEqual(["bang"]);
    expect(state.deck).toHaveLength(80);
  });

  it("persists valid game and settings documents under separate keys", () => {
    const storage = memoryStorage();
    const state = drawToHand(createPlayState(createDefaultPlaySettings()), 2);
    const settings = toggleCardEnabled(createDefaultPlaySettings(), "bang");

    savePlayState(storage, state);
    savePlaySettings(storage, settings);

    expect(PLAY_STORAGE_KEY).toBe("bang.play.v1");
    expect(PLAY_SETTINGS_STORAGE_KEY).toBe("bang.play.settings.v1");
    expect(loadPlayState(storage)).toEqual(state);
    expect(loadPlaySettings(storage)).toEqual(settings);
  });

  it("rejects malformed persisted game and settings documents", () => {
    const storage = memoryStorage({
      [PLAY_STORAGE_KEY]: JSON.stringify({ version: 1, state: { deck: [], health: "4" } }),
      [PLAY_SETTINGS_STORAGE_KEY]: JSON.stringify({ version: 1, state: { disabledIds: [42] } }),
    });

    expect(loadPlayState(storage)).toBeNull();
    expect(loadPlaySettings(storage)).toBeNull();
  });
});
