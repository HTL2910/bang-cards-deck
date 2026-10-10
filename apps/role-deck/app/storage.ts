import { parseVersionedState, serializeVersionedState } from "@bang/deck-core";

import { isRoleState, type RoleState } from "./model";

export const ROLE_STORAGE_KEY = "bang.role.v1";
const ROLE_STORAGE_VERSION = 1;

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

export function loadRoleState(storage: StorageReader): RoleState | null {
  return parseVersionedState(
    storage.getItem(ROLE_STORAGE_KEY),
    ROLE_STORAGE_VERSION,
    isRoleState,
  );
}

export function saveRoleState(storage: StorageWriter, state: RoleState): void {
  storage.setItem(ROLE_STORAGE_KEY, serializeVersionedState(ROLE_STORAGE_VERSION, state));
}
