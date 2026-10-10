export type CardDefinition = {
  id: string;
  count?: number;
};

export type CardInstance<T extends CardDefinition> = Omit<T, "count"> & {
  uid: string;
};

export function expandDeck<T extends CardDefinition>(
  definitions: readonly T[],
): CardInstance<T>[] {
  return definitions.flatMap((definition) => {
    const { count = 1, ...card } = definition;
    const copies = Math.max(0, Math.floor(count));

    return Array.from({ length: copies }, (_, index) => ({
      ...card,
      uid: `${definition.id}#${index}`,
    })) as CardInstance<T>[];
  });
}

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function drawCards<T>(
  deck: readonly T[],
  count = 1,
): { drawn: T[]; deck: T[] } {
  const drawCount = Math.min(deck.length, Math.max(0, Math.floor(count)));

  return {
    drawn: deck.slice(0, drawCount),
    deck: deck.slice(drawCount),
  };
}

export function moveCard<T extends { uid: string }>(
  source: readonly T[],
  target: readonly T[],
  uid: string,
): { source: T[]; target: T[] } {
  const index = source.findIndex((card) => card.uid === uid);
  if (index === -1) {
    return { source: [...source], target: [...target] };
  }

  const card = source[index];
  return {
    source: [...source.slice(0, index), ...source.slice(index + 1)],
    target: [...target, card],
  };
}

export function filterEnabledDefinitions<T extends CardDefinition>(
  definitions: readonly T[],
  disabledIds: ReadonlySet<string>,
): T[] {
  return definitions.filter((definition) => !disabledIds.has(definition.id));
}
