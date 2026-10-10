import { PLAY_CARDS, type PlayCardDefinition } from "@bang/card-data";
import {
  drawCards,
  expandDeck,
  filterEnabledDefinitions,
  moveCard,
  shuffle,
  type CardInstance,
} from "@bang/deck-core";

export type PlayCard = CardInstance<PlayCardDefinition>;
export type PlayZone = "deck" | "hand" | "inPlay" | "discard";

export type PlaySettings = {
  disabledIds: string[];
};

export type PlayState = {
  deck: PlayCard[];
  hand: PlayCard[];
  inPlay: PlayCard[];
  discard: PlayCard[];
  health: number;
};

export function createDefaultPlaySettings(): PlaySettings {
  return { disabledIds: [] };
}

export function createPlayState(
  settings: PlaySettings,
  random?: () => number,
): PlayState {
  const enabled = filterEnabledDefinitions(PLAY_CARDS, new Set(settings.disabledIds));
  const deck = expandDeck(enabled);

  return {
    deck: random ? shuffle(deck, random) : deck,
    hand: [],
    inPlay: [],
    discard: [],
    health: 4,
  };
}

export function drawToHand(state: PlayState, count: number): PlayState {
  const { drawn, deck } = drawCards(state.deck, count);
  if (drawn.length === 0) return state;
  return { ...state, deck, hand: [...state.hand, ...drawn] };
}

export function movePlayCard(
  state: PlayState,
  from: PlayZone,
  to: PlayZone,
  uid: string,
): PlayState {
  if (from === to || !state[from].some((card) => card.uid === uid)) return state;
  const moved = moveCard(state[from], state[to], uid);
  return { ...state, [from]: moved.source, [to]: moved.target };
}

export function adjustHealth(state: PlayState, delta: number): PlayState {
  return { ...state, health: Math.max(0, state.health + delta) };
}

const playCardIds = new Set(PLAY_CARDS.map(({ id }) => id));

export function toggleCardEnabled(settings: PlaySettings, id: string): PlaySettings {
  if (!playCardIds.has(id)) return settings;
  const disabledIds = new Set(settings.disabledIds);
  if (disabledIds.has(id)) disabledIds.delete(id);
  else disabledIds.add(id);
  return { disabledIds: [...disabledIds] };
}

function isPlayCard(value: unknown): value is PlayCard {
  return (
    typeof value === "object" &&
    value !== null &&
    "uid" in value &&
    typeof value.uid === "string" &&
    "id" in value &&
    typeof value.id === "string" &&
    playCardIds.has(value.id) &&
    "category" in value &&
    (value.category === "action" || value.category === "equipment" || value.category === "weapon")
  );
}

export function isPlaySettings(value: unknown): value is PlaySettings {
  return (
    typeof value === "object" &&
    value !== null &&
    "disabledIds" in value &&
    Array.isArray(value.disabledIds) &&
    value.disabledIds.every((id) => typeof id === "string" && playCardIds.has(id)) &&
    new Set(value.disabledIds).size === value.disabledIds.length
  );
}

export function isPlayState(value: unknown): value is PlayState {
  if (
    typeof value !== "object" ||
    value === null ||
    !("deck" in value) ||
    !Array.isArray(value.deck) ||
    !("hand" in value) ||
    !Array.isArray(value.hand) ||
    !("inPlay" in value) ||
    !Array.isArray(value.inPlay) ||
    !("discard" in value) ||
    !Array.isArray(value.discard) ||
    !("health" in value) ||
    typeof value.health !== "number" ||
    !Number.isFinite(value.health) ||
    value.health < 0
  ) {
    return false;
  }

  const cards = [...value.deck, ...value.hand, ...value.inPlay, ...value.discard];
  return (
    cards.length <= 80 &&
    cards.every(isPlayCard) &&
    new Set(cards.map(({ uid }) => uid)).size === cards.length
  );
}
