/**
 * Định nghĩa deck Event. Để thêm card:
 *   1. Bỏ ảnh vào public/cards/events/<tên file>
 *   2. Thêm một dòng vào EVENT_CARD_DEFS bên dưới
 *
 * `count` = số bản sao của lá đó trong deck.
 * Attribute chi tiết của card sẽ được bổ sung sau.
 */

export type EventEffect = "positive" | "negative";

export type EventCardDef = {
  /** Định danh duy nhất, dùng làm key và prefix cho instance id */
  id: string;
  /** Loại card hiện tại luôn là Event */
  type: "event";
  name: string;
  /** Positive dùng màu xanh, Negative dùng màu đỏ */
  effect: EventEffect;
  /** Đường dẫn ảnh, tính từ thư mục public/ */
  image: string;
  /** Số bản sao trong deck (mặc định 1) */
  count?: number;
};

/** Một lá Event cụ thể trong deck (đã nhân bản theo `count`) */
export type EventCard = Omit<EventCardDef, "count"> & {
  /** Duy nhất cho từng bản sao, ví dụ "positive-01#0" */
  uid: string;
};

export const EVENT_EFFECT_LABELS: Record<EventEffect, string> = {
  positive: "Positive",
  negative: "Negative",
};

export const EVENT_EFFECT_BADGE_STYLES: Record<EventEffect, string> = {
  positive: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40",
  negative: "bg-red-500/15 text-red-300 ring-red-500/40",
};

export const EVENT_EFFECT_FRAME_STYLES: Record<EventEffect, string> = {
  positive: "ring-emerald-500/60 shadow-emerald-500/20",
  negative: "ring-red-500/60 shadow-red-500/20",
};

export const EVENT_CARD_DEFS: EventCardDef[] = [
  {
    id: "sete",
    type: "event",
    name: "Sete",
    effect: "negative",
    image: "/cards/events/05_sete.png",
  },
  {
    id: "roulette-russa",
    type: "event",
    name: "Roulette Russa",
    effect: "positive",
    image: "/cards/events/05_rouletterussa.png",
  },
  {
    id: "agguato",
    type: "event",
    name: "Agguato",
    effect: "positive",
    image: "/cards/events/05_agguato.png",
  },
  {
    id: "sermone",
    type: "event",
    name: "Sermone",
    effect: "negative",
    image: "/cards/events/05_sermone.png",
  },
  {
    id: "vendetta",
    type: "event",
    name: "Vendetta",
    effect: "positive",
    image: "/cards/events/05_vendetta.png",
  },
  {
    id: "il-dottore",
    type: "event",
    name: "Il Dottore",
    effect: "negative",
    image: "/cards/events/05_ildottore.png",
  },
  {
    id: "liquore-forte",
    type: "event",
    name: "Liquore Forte",
    effect: "positive",
    image: "/cards/events/05_liquoreforte.png",
  },
  {
    id: "corsa-all-oro",
    type: "event",
    name: "Corsa all'Oro",
    effect: "negative",
    image: "/cards/events/05_corsaalloro.png",
  },
  {
    id: "il-treno",
    type: "event",
    name: "Il Treno",
    effect: "negative",
    image: "/cards/events/05_iltreno.png",
  },
  {
    id: "i-dalton",
    type: "event",
    name: "I Dalton",
    effect: "negative",
    image: "/cards/events/05_idalton.png",
  },
  {
    id: "fratelli-di-sangue",
    type: "event",
    name: "Fratelli di Sangue",
    effect: "positive",
    image: "/cards/events/05_fratellidisangue.png",
  },
  {
    id: "mezzogiorno-di-fuoco",
    type: "event",
    name: "Mezzogiorno di Fuoco",
    effect: "negative",
    image: "/cards/events/05_mezzogiornodifuoco.png",
  },
  {
    id: "ranch",
    type: "event",
    name: "Ranch",
    effect: "positive",
    image: "/cards/events/05_ranch.png",
  },
  {
    id: "il-giudice",
    type: "event",
    name: "Il Giudice",
    effect: "positive",
    image: "/cards/events/05_ilgiudice.png",
  },
  {
    id: "benedizione",
    type: "event",
    name: "Benedizione",
    effect: "negative",
    image: "/cards/events/05_benedizione.png",
  },
  {
    id: "cecchino",
    type: "event",
    name: "Cecchino",
    effect: "positive",
    image: "/cards/events/05_cecchino.png",
  },
  {
    id: "peyote",
    type: "event",
    name: "Peyote",
    effect: "positive",
    image: "/cards/events/05_peyote.png",
  },
  {
    id: "sbornia",
    type: "event",
    name: "Sbornia",
    effect: "negative",
    image: "/cards/events/05_sbornia.png",
  },
  {
    id: "citta-fantasma",
    type: "event",
    name: "Città Fantasma",
    effect: "negative",
    image: "/cards/events/05_cittafantasma.png",
  },
  {
    id: "per-un-pugno-di-carte",
    type: "event",
    name: "Per un Pugno di Carte",
    effect: "positive",
    image: "/cards/events/05_perunpugnodicarte.png",
  },
  {
    id: "il-reverendo",
    type: "event",
    name: "Il Reverendo",
    effect: "negative",
    image: "/cards/events/05_ilreverendo.png",
  },
  {
    id: "rimbalzo",
    type: "event",
    name: "Rimbalzo",
    effect: "positive",
    image: "/cards/events/05_rimbalzo.png",
  },
  {
    id: "miniera-abbandonata",
    type: "event",
    name: "Miniera Abbandonata",
    effect: "positive",
    image: "/cards/events/05_minieraabbandonata.png",
  },
  {
    id: "sparatoria",
    type: "event",
    name: "Sparatoria",
    effect: "negative",
    image: "/cards/events/05_sparatoria.png",
  },
  {
    id: "maledizione",
    type: "event",
    name: "Maledizione",
    effect: "negative",
    image: "/cards/events/05_maledizione.png",
  },
  {
    id: "dead-man",
    type: "event",
    name: "Dead Man",
    effect: "positive",
    image: "/cards/events/05_deadman.png",
  },
  {
    id: "lazo",
    type: "event",
    name: "Lazo",
    effect: "positive",
    image: "/cards/events/05_lazo.png",
  },
  {
    id: "legge-del-west",
    type: "event",
    name: "Legge del West",
    effect: "positive",
    image: "/cards/events/05_leggedelwest.png",
  },
];

/** Bung EVENT_CARD_DEFS thành danh sách từng lá theo `count` */
export function buildDeck(defs: EventCardDef[] = EVENT_CARD_DEFS): EventCard[] {
  return defs.flatMap(({ count = 1, ...def }) =>
    Array.from({ length: count }, (_, i) => ({ ...def, uid: `${def.id}#${i}` })),
  );
}

/** Fisher–Yates, không sửa mảng gốc */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
