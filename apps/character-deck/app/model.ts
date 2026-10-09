import { CHARACTERS, type CharacterDefinition } from "@bang/card-data";
import {
  drawCards,
  expandDeck,
  shuffle,
  type CardInstance,
} from "@bang/deck-core";

export type CharacterCard = CardInstance<CharacterDefinition>;

export type CharacterState = {
  deck: CharacterCard[];
  current: CharacterCard | null;
  history: CharacterCard[];
  health: number;
};

export function createCharacterState(random?: () => number): CharacterState {
  const deck = expandDeck(CHARACTERS);
  return {
    deck: random ? shuffle(deck, random) : deck,
    current: null,
    history: [],
    health: 0,
  };
}

export function drawCharacter(state: CharacterState): CharacterState {
  if (state.current || state.deck.length === 0) return state;

  const { drawn, deck } = drawCards(state.deck);
  const current = drawn[0];
  if (!current) return state;

  return {
    deck,
    current,
    history: [...state.history, current],
    health: current.baseHealth,
  };
}

export function adjustHealth(state: CharacterState, delta: number): CharacterState {
  return {
    ...state,
    health: Math.max(0, state.health + delta),
  };
}

export function replaceCharacter(state: CharacterState): CharacterState {
  if (!state.current || state.deck.length === 0) return state;

  const { drawn, deck } = drawCards(state.deck);
  const current = drawn[0];
  if (!current) return state;

  return {
    deck,
    current,
    history: [...state.history, current],
    health: current.baseHealth,
  };
}

const characterIds = new Set(CHARACTERS.map(({ id }) => id));

function isCharacterCard(value: unknown): value is CharacterCard {
  return (
    typeof value === "object" &&
    value !== null &&
    "uid" in value &&
    typeof value.uid === "string" &&
    "id" in value &&
    typeof value.id === "string" &&
    characterIds.has(value.id) &&
    "baseHealth" in value &&
    typeof value.baseHealth === "number"
  );
}

export function isCharacterState(value: unknown): value is CharacterState {
  if (
    typeof value !== "object" ||
    value === null ||
    !("deck" in value) ||
    !Array.isArray(value.deck) ||
    !value.deck.every(isCharacterCard) ||
    !("history" in value) ||
    !Array.isArray(value.history) ||
    !value.history.every(isCharacterCard) ||
    !("current" in value) ||
    !(value.current === null || isCharacterCard(value.current)) ||
    !("health" in value) ||
    typeof value.health !== "number" ||
    !Number.isFinite(value.health) ||
    value.health < 0
  ) {
    return false;
  }

  const deckUids = value.deck.map(({ uid }) => uid);
  const historyUids = value.history.map(({ uid }) => uid);
  const allUids = [...deckUids, ...historyUids];
  const currentMatchesHistory =
    value.current === null
      ? value.history.length === 0
      : value.history.at(-1)?.uid === value.current.uid;

  return (
    allUids.length === CHARACTERS.length &&
    new Set(allUids).size === allUids.length &&
    currentMatchesHistory
  );
}
