import { describe, expect, it } from "vitest";

import { parseVersionedState, serializeVersionedState } from "./persistence";

type CounterState = { count: number };

function isCounterState(value: unknown): value is CounterState {
  return (
    typeof value === "object" &&
    value !== null &&
    "count" in value &&
    typeof value.count === "number"
  );
}

describe("versioned persistence", () => {
  it("parses a supported envelope whose state passes validation", () => {
    const raw = JSON.stringify({ version: 1, state: { count: 3 } });

    expect(parseVersionedState(raw, 1, isCounterState)).toEqual({ count: 3 });
  });

  it.each([
    { name: "missing input", raw: null },
    { name: "invalid JSON", raw: "{" },
    { name: "wrong version", raw: JSON.stringify({ version: 2, state: { count: 3 } }) },
    { name: "failed validation", raw: JSON.stringify({ version: 1, state: { count: "3" } }) },
  ])("returns null for $name", ({ raw }) => {
    expect(parseVersionedState(raw, 1, isCounterState)).toBeNull();
  });

  it("serializes state in a versioned envelope without browser APIs", () => {
    expect(serializeVersionedState(4, { count: 7 })).toBe(
      '{"version":4,"state":{"count":7}}',
    );
  });
});
