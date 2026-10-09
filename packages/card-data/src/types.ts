import type { CardDefinition } from "@bang/deck-core";

export type LocalizedCardDefinition = CardDefinition & {
  originalName: string;
  nameVi: string;
  textVi: string;
  image: string;
};

export type CharacterDefinition = LocalizedCardDefinition & {
  category: "character";
  baseHealth: number;
};

export type RoleDefinition = LocalizedCardDefinition & {
  category: "role";
  role: "sheriff" | "deputy" | "outlaw" | "renegade";
};

export type PlayCardDefinition = LocalizedCardDefinition & {
  category: "action" | "equipment" | "weapon";
};

export type EventCardDefinition = LocalizedCardDefinition & {
  category: "event";
  effect: "positive" | "negative";
};
