import { EVENT_CARDS, type EventCardDefinition } from "@bang/card-data";
import { drawCards, expandDeck, shuffle, type CardInstance } from "@bang/deck-core";

export type EventCard = CardInstance<EventCardDefinition>;

export type EventState = {
  deck: EventCard[];
  history: EventCard[];
};

export function createEventState(random?: () => number): EventState {
  const deck = expandDeck(EVENT_CARDS);
  return { deck: random ? shuffle(deck, random) : deck, history: [] };
}

export function drawEvent(state: EventState): EventState {
  const { drawn, deck } = drawCards(state.deck);
  const current = drawn[0];
  return current ? { deck, history: [current, ...state.history] } : state;
}

export function resetEventState(random?: () => number): EventState {
  return createEventState(random);
}

const eventIds = new Set(EVENT_CARDS.map(({ id }) => id));

function isEventCard(value: unknown): value is EventCard {
  return (
    typeof value === "object" &&
    value !== null &&
    "uid" in value &&
    typeof value.uid === "string" &&
    "id" in value &&
    typeof value.id === "string" &&
    eventIds.has(value.id) &&
    "effect" in value &&
    (value.effect === "positive" || value.effect === "negative")
  );
}

export function isEventState(value: unknown): value is EventState {
  if (
    typeof value !== "object" ||
    value === null ||
    !("deck" in value) ||
    !Array.isArray(value.deck) ||
    !("history" in value) ||
    !Array.isArray(value.history)
  ) {
    return false;
  }

  const cards = [...value.deck, ...value.history];
  return (
    cards.length === EVENT_CARDS.length &&
    cards.every(isEventCard) &&
    new Set(cards.map(({ uid }) => uid)).size === cards.length
  );
}
