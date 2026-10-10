import { parseVersionedState, serializeVersionedState } from "@bang/deck-core";

import {
  isPlaySettings,
  isPlayState,
  type PlaySettings,
  type PlayState,
} from "./model";

export const PLAY_STORAGE_KEY = "bang.play.v1";
export const PLAY_SETTINGS_STORAGE_KEY = "bang.play.settings.v1";
const STORAGE_VERSION = 1;

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

export function loadPlayState(storage: StorageReader): PlayState | null {
  return parseVersionedState(storage.getItem(PLAY_STORAGE_KEY), STORAGE_VERSION, isPlayState);
}

export function savePlayState(storage: StorageWriter, state: PlayState): void {
  storage.setItem(PLAY_STORAGE_KEY, serializeVersionedState(STORAGE_VERSION, state));
}

export function loadPlaySettings(storage: StorageReader): PlaySettings | null {
  return parseVersionedState(
    storage.getItem(PLAY_SETTINGS_STORAGE_KEY),
    STORAGE_VERSION,
    isPlaySettings,
  );
}

export function savePlaySettings(storage: StorageWriter, settings: PlaySettings): void {
  storage.setItem(
    PLAY_SETTINGS_STORAGE_KEY,
    serializeVersionedState(STORAGE_VERSION, settings),
  );
}
