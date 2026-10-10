import { describe, expect, it } from "vitest";

import {
  adjustHealth,
  createCharacterState,
  drawCharacter,
  replaceCharacter,
} from "./model";
import {
  CHARACTER_STORAGE_KEY,
  loadCharacterState,
  saveCharacterState,
} from "./storage";

function memoryStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
}

describe("Character model", () => {
  it("creates deterministic server-safe state when no random source is supplied", () => {
    const state = createCharacterState();

    expect(state.current).toBeNull();
    expect(state.health).toBe(0);
    expect(state.history).toEqual([]);
    expect(state.deck).toHaveLength(16);
    expect(state.deck[0].id).toBe("bart-cassidy");
  });

  it("shuffles the first browser state when a random source is supplied", () => {
    const state = createCharacterState(() => 0);

    expect(state.deck.map(({ id }) => id)).not.toEqual(
      createCharacterState().deck.map(({ id }) => id),
    );
  });

  it("draws every character once before the deck is exhausted", () => {
    let state = drawCharacter(createCharacterState());
    while (state.deck.length > 0) state = replaceCharacter(state);

    expect(state.history).toHaveLength(16);
    expect(new Set(state.history.map(({ id }) => id)).size).toBe(16);
    expect(replaceCharacter(state)).toEqual(state);
  });

  it("initializes health from the drawn character", () => {
    const state = drawCharacter(createCharacterState());

    expect(state.current?.id).toBe("bart-cassidy");
    expect(state.health).toBe(state.current?.baseHealth);
  });

  it("adjusts health manually and clamps it at zero", () => {
    const state = drawCharacter(createCharacterState());

    expect(adjustHealth(state, 2).health).toBe(6);
    expect(adjustHealth(state, -99).health).toBe(0);
  });

  it("replaces the current character from the remaining deck", () => {
    const first = drawCharacter(createCharacterState());
    const next = replaceCharacter(first);

    expect(next.current?.id).toBe("black-jack");
    expect(next.health).toBe(4);
    expect(next.deck).toHaveLength(14);
    expect(next.history.map(({ id }) => id)).toEqual(["bart-cassidy", "black-jack"]);
  });

  it("creates a fresh full deck for a confirmed reset", () => {
    const played = replaceCharacter(drawCharacter(createCharacterState()));
    const reset = createCharacterState(() => 0.5);

    expect(played.deck).toHaveLength(14);
    expect(reset.deck).toHaveLength(16);
    expect(reset.current).toBeNull();
    expect(reset.history).toEqual([]);
  });

  it("round-trips valid state using its isolated storage key", () => {
    const storage = memoryStorage();
    const state = drawCharacter(createCharacterState());

    saveCharacterState(storage, state);

    expect(CHARACTER_STORAGE_KEY).toBe("bang.character.v1");
    expect(loadCharacterState(storage)).toEqual(state);
  });

  it("falls back from corrupt or malformed stored state", () => {
    expect(loadCharacterState(memoryStorage("not-json"))).toBeNull();
    expect(
      loadCharacterState(
        memoryStorage(JSON.stringify({ version: 1, state: { deck: [], health: "four" } })),
      ),
    ).toBeNull();
  });
});
