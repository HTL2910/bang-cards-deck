import { describe, expect, it } from "vitest";

import {
  createRoleState,
  drawRole,
  redrawRole,
  setRoleRevealed,
} from "./model";
import { loadRoleState, ROLE_STORAGE_KEY, saveRoleState } from "./storage";

function memoryStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
}

describe("Role model", () => {
  it.each([4, 5, 6, 7])("creates a deterministic %i-player pool face down", (playerCount) => {
    const state = createRoleState(playerCount);

    expect(state.playerCount).toBe(playerCount);
    expect(state.deck).toHaveLength(playerCount);
    expect(new Set(state.deck.map(({ uid }) => uid)).size).toBe(playerCount);
    expect(state.current).toBeNull();
    expect(state.revealed).toBe(false);
  });

  it.each([3, 8, 4.5])("rejects invalid player count %s", (playerCount) => {
    expect(() => createRoleState(playerCount)).toThrow(RangeError);
  });

  it("shuffles only when a random source is supplied", () => {
    expect(createRoleState(5, () => 0).deck.map(({ uid }) => uid)).not.toEqual(
      createRoleState(5).deck.map(({ uid }) => uid),
    );
  });

  it("draws face down, then reveals and hides the role", () => {
    const drawn = drawRole(createRoleState(4));

    expect(drawn.current?.role).toBe("sheriff");
    expect(drawn.deck).toHaveLength(3);
    expect(drawn.revealed).toBe(false);
    expect(setRoleRevealed(drawn, true).revealed).toBe(true);
    expect(setRoleRevealed(setRoleRevealed(drawn, true), false).revealed).toBe(false);
  });

  it("redraws another face-down role from the remaining pool", () => {
    const first = setRoleRevealed(drawRole(createRoleState(4)), true);
    const next = redrawRole(first);

    expect(next.current?.uid).not.toBe(first.current?.uid);
    expect(next.deck).toHaveLength(2);
    expect(next.revealed).toBe(false);
  });

  it("changing player count creates a new local draw", () => {
    const drawn = drawRole(createRoleState(4));
    const changed = createRoleState(7, () => 0.999999);

    expect(drawn.current).not.toBeNull();
    expect(changed.playerCount).toBe(7);
    expect(changed.deck).toHaveLength(7);
    expect(changed.current).toBeNull();
    expect(changed.revealed).toBe(false);
  });

  it("round-trips a valid hidden state using its isolated key", () => {
    const storage = memoryStorage();
    const state = drawRole(createRoleState(5));

    saveRoleState(storage, state);

    expect(ROLE_STORAGE_KEY).toBe("bang.role.v1");
    expect(loadRoleState(storage)).toEqual(state);
  });

  it("rejects corrupt and malformed persisted state", () => {
    expect(loadRoleState(memoryStorage("{"))).toBeNull();
    expect(
      loadRoleState(
        memoryStorage(
          JSON.stringify({
            version: 1,
            state: { playerCount: 9, deck: [], current: null, revealed: false },
          }),
        ),
      ),
    ).toBeNull();
  });
});
