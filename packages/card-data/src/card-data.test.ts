import { describe, expect, it } from "vitest";

import {
  CHARACTERS,
  EVENT_CARDS,
  getRoleDefinitions,
  PLAY_CARDS,
  ROLES,
} from "./index";

const allCards = () => [...CHARACTERS, ...ROLES, ...PLAY_CARDS, ...EVENT_CARDS];

describe("base card catalog", () => {
  it("contains 16 unique translated characters with valid base health", () => {
    expect(CHARACTERS).toHaveLength(16);
    expect(new Set(CHARACTERS.map(({ id }) => id)).size).toBe(16);
    expect(CHARACTERS.every(({ baseHealth }) => baseHealth === 3 || baseHealth === 4)).toBe(true);
  });

  it("contains the four translated role definitions", () => {
    expect(ROLES.map(({ role }) => role).sort()).toEqual([
      "deputy",
      "outlaw",
      "renegade",
      "sheriff",
    ]);
  });

  it.each([
    [4, { sheriff: 1, deputy: 0, outlaw: 2, renegade: 1 }],
    [5, { sheriff: 1, deputy: 1, outlaw: 2, renegade: 1 }],
    [6, { sheriff: 1, deputy: 1, outlaw: 3, renegade: 1 }],
    [7, { sheriff: 1, deputy: 2, outlaw: 3, renegade: 1 }],
  ] as const)("builds the standard %i-player role pool", (playerCount, expected) => {
    const pool = getRoleDefinitions(playerCount);
    const counts = Object.fromEntries(
      ["sheriff", "deputy", "outlaw", "renegade"].map((role) => [
        role,
        pool.filter((card) => card.role === role).length,
      ]),
    );

    expect(pool).toHaveLength(playerCount);
    expect(counts).toEqual(expected);
  });

  it.each([3, 8, 4.5])("rejects unsupported player count %s", (playerCount) => {
    expect(() => getRoleDefinitions(playerCount)).toThrow(RangeError);
  });

  it("contains 22 play-card definitions totaling 80 instances", () => {
    expect(PLAY_CARDS).toHaveLength(22);
    expect(new Set(PLAY_CARDS.map(({ id }) => id)).size).toBe(22);
    expect(PLAY_CARDS.reduce((total, { count = 1 }) => total + count, 0)).toBe(80);
  });

  it("contains all 28 translated Event definitions", () => {
    expect(EVENT_CARDS).toHaveLength(28);
    expect(new Set(EVENT_CARDS.map(({ id }) => id)).size).toBe(28);
  });

  it("provides app-relative artwork and non-empty Vietnamese content", () => {
    for (const card of allCards()) {
      expect(card.image).toMatch(/^\/cards\/(characters|roles|play|events)\/[a-z0-9-]+\.png$/);
      expect(card.nameVi.trim()).not.toBe("");
      expect(card.textVi.trim()).not.toBe("");
    }
  });
});
