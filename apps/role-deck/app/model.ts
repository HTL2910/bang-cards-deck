import { getRoleDefinitions, ROLES, type RoleDefinition } from "@bang/card-data";
import { drawCards, expandDeck, shuffle, type CardInstance } from "@bang/deck-core";

export type RoleCard = CardInstance<RoleDefinition>;

export type RoleState = {
  playerCount: number;
  deck: RoleCard[];
  current: RoleCard | null;
  revealed: boolean;
};

export function createRoleState(playerCount: number, random?: () => number): RoleState {
  const pool = getRoleDefinitions(playerCount);
  const definitions = pool.reduce<RoleDefinition[]>((result, role) => {
    const existing = result.find(({ id }) => id === role.id);
    if (existing) existing.count = (existing.count ?? 1) + 1;
    else result.push({ ...role, count: 1 });
    return result;
  }, []);
  const deck = expandDeck(definitions);

  return {
    playerCount,
    deck: random ? shuffle(deck, random) : deck,
    current: null,
    revealed: false,
  };
}

export function drawRole(state: RoleState): RoleState {
  if (state.current || state.deck.length === 0) return state;

  const { drawn, deck } = drawCards(state.deck);
  const current = drawn[0];
  return current ? { ...state, deck, current, revealed: false } : state;
}

export function setRoleRevealed(state: RoleState, revealed: boolean): RoleState {
  if (!state.current) return { ...state, revealed: false };
  return { ...state, revealed };
}

export function redrawRole(state: RoleState): RoleState {
  if (!state.current || state.deck.length === 0) return state;

  const { drawn, deck } = drawCards(state.deck);
  const current = drawn[0];
  return current ? { ...state, deck, current, revealed: false } : state;
}

const roleIds = new Set(ROLES.map(({ id }) => id));

function isRoleCard(value: unknown): value is RoleCard {
  return (
    typeof value === "object" &&
    value !== null &&
    "uid" in value &&
    typeof value.uid === "string" &&
    "id" in value &&
    typeof value.id === "string" &&
    roleIds.has(value.id) &&
    "role" in value &&
    typeof value.role === "string"
  );
}

export function isRoleState(value: unknown): value is RoleState {
  if (
    typeof value !== "object" ||
    value === null ||
    !("playerCount" in value) ||
    typeof value.playerCount !== "number" ||
    !Number.isInteger(value.playerCount) ||
    value.playerCount < 4 ||
    value.playerCount > 7 ||
    !("deck" in value) ||
    !Array.isArray(value.deck) ||
    !value.deck.every(isRoleCard) ||
    !("current" in value) ||
    !(value.current === null || isRoleCard(value.current)) ||
    !("revealed" in value) ||
    typeof value.revealed !== "boolean"
  ) {
    return false;
  }

  const uids = value.deck.map(({ uid }) => uid);
  if (value.current) uids.push(value.current.uid);

  return (
    value.deck.length + (value.current ? 1 : 0) <= value.playerCount &&
    new Set(uids).size === uids.length &&
    (value.current !== null || value.revealed === false)
  );
}
