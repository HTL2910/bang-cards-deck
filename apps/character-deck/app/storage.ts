import { parseVersionedState, serializeVersionedState } from "@bang/deck-core";

import { isCharacterState, type CharacterState } from "./model";

export const CHARACTER_STORAGE_KEY = "bang.character.v1";
const CHARACTER_STORAGE_VERSION = 1;

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

export function loadCharacterState(storage: StorageReader): CharacterState | null {
  return parseVersionedState(
    storage.getItem(CHARACTER_STORAGE_KEY),
    CHARACTER_STORAGE_VERSION,
    isCharacterState,
  );
}

export function saveCharacterState(storage: StorageWriter, state: CharacterState): void {
  storage.setItem(
    CHARACTER_STORAGE_KEY,
    serializeVersionedState(CHARACTER_STORAGE_VERSION, state),
  );
}
