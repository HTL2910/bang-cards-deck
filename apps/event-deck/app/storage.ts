import { parseVersionedState, serializeVersionedState } from "@bang/deck-core";

import { isEventState, type EventState } from "./model";

export const EVENT_STORAGE_KEY = "bang.event.v1";
const EVENT_STORAGE_VERSION = 1;

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

export function loadEventState(storage: StorageReader): EventState | null {
  return parseVersionedState(
    storage.getItem(EVENT_STORAGE_KEY),
    EVENT_STORAGE_VERSION,
    isEventState,
  );
}

export function saveEventState(storage: StorageWriter, state: EventState): void {
  storage.setItem(EVENT_STORAGE_KEY, serializeVersionedState(EVENT_STORAGE_VERSION, state));
}
