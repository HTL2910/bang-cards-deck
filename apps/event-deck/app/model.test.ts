import { describe, expect, it } from "vitest";

import { createEventState, drawEvent, resetEventState } from "./model";
import { EVENT_STORAGE_KEY, loadEventState, saveEventState } from "./storage";

function memoryStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
}

describe("Event model", () => {
  it("creates deterministic server-safe state with all 28 unique cards", () => {
    const state = createEventState();

    expect(state.deck).toHaveLength(28);
    expect(new Set(state.deck.map(({ uid }) => uid)).size).toBe(28);
    expect(state.deck[0].id).toBe("sete");
    expect(state.history).toEqual([]);
  });

  it("shuffles only when a random source is supplied", () => {
    expect(createEventState(() => 0).deck.map(({ id }) => id)).not.toEqual(
      createEventState().deck.map(({ id }) => id),
    );
  });

  it("draws every event once and records newest history first", () => {
    const first = drawEvent(createEventState());
    const second = drawEvent(first);

    expect(second.history.map(({ id }) => id)).toEqual(["roulette-russa", "sete"]);

    let exhausted = second;
    while (exhausted.deck.length > 0) exhausted = drawEvent(exhausted);
    expect(exhausted.history).toHaveLength(28);
    expect(new Set(exhausted.history.map(({ uid }) => uid)).size).toBe(28);
    expect(drawEvent(exhausted)).toBe(exhausted);
  });

  it("resets to a fresh shuffled 28-card state", () => {
    const played = drawEvent(createEventState());
    const reset = resetEventState(() => 0.999999);

    expect(played.history).toHaveLength(1);
    expect(reset.deck).toHaveLength(28);
    expect(reset.history).toEqual([]);
  });

  it("round-trips valid versioned state under its isolated key", () => {
    const storage = memoryStorage();
    const state = drawEvent(createEventState());

    saveEventState(storage, state);

    expect(EVENT_STORAGE_KEY).toBe("bang.event.v1");
    expect(loadEventState(storage)).toEqual(state);
  });

  it("falls back from corrupt, old, and malformed documents", () => {
    expect(loadEventState(memoryStorage("not-json"))).toBeNull();
    expect(loadEventState(memoryStorage(JSON.stringify({ version: 2, state: {} })))).toBeNull();
    expect(
      loadEventState(
        memoryStorage(JSON.stringify({ version: 1, state: { deck: [], history: "none" } })),
      ),
    ).toBeNull();
  });
});
