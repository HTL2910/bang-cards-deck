import { describe, expect, it } from "vitest";

import {
  drawCards,
  expandDeck,
  filterEnabledDefinitions,
  moveCard,
  shuffle,
} from "./deck";

describe("deck primitives", () => {
  it("expands duplicate definitions into stable unique instances", () => {
    expect(expandDeck([{ id: "bang", count: 2 }])).toEqual([
      { id: "bang", uid: "bang#0" },
      { id: "bang", uid: "bang#1" },
    ]);
  });

  it("shuffles without mutating or losing instances", () => {
    const input = ["a", "b", "c", "d"] as const;
    const original = [...input];
    const randomValues = [0.1, 0.8, 0.3];
    let index = 0;

    const result = shuffle(input, () => randomValues[index++] ?? 0);

    expect(input).toEqual(original);
    expect(result).not.toBe(input);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it.each([
    { count: -2, drawn: [], remaining: ["a", "b"] },
    { count: 5, drawn: ["a", "b"], remaining: [] },
  ])("clamps a draw of $count cards", ({ count, drawn, remaining }) => {
    expect(drawCards(["a", "b"], count)).toEqual({
      drawn,
      deck: remaining,
    });
  });

  it("moves one card while conserving the source and target cards", () => {
    const source = [{ uid: "a" }, { uid: "b" }];
    const target = [{ uid: "c" }];

    const result = moveCard(source, target, "b");

    expect(result).toEqual({
      source: [{ uid: "a" }],
      target: [{ uid: "c" }, { uid: "b" }],
    });
    expect(source).toHaveLength(2);
    expect(target).toHaveLength(1);
  });

  it("leaves both zones unchanged when the requested card is missing", () => {
    const source = [{ uid: "a" }];
    const target = [{ uid: "b" }];

    expect(moveCard(source, target, "missing")).toEqual({ source, target });
  });

  it("filters every copy of disabled definitions before expansion", () => {
    const definitions = [
      { id: "bang", count: 25 },
      { id: "missed", count: 12 },
    ];

    expect(filterEnabledDefinitions(definitions, new Set(["bang"]))).toEqual([
      { id: "missed", count: 12 },
    ]);
  });
});
