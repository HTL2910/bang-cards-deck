import { useCallback, useEffect, useState } from "react";

import type { Route } from "./+types/event";
import {
  buildDeck,
  shuffle,
  EVENT_EFFECT_BADGE_STYLES,
  EVENT_EFFECT_FRAME_STYLES,
  EVENT_EFFECT_LABELS,
  type EventCard,
} from "../data/cards";
import { EVENT_CARD_TEXT_VI } from "../data/translations";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Event Cards" },
    { name: "description", content: "Rút thẻ sự kiện Positive hoặc Negative" },
  ];
}

export default function Event() {
  /** Xáo sau khi mount để kết quả SSR và lần render đầu ở client giống nhau. */
  const [game, setGame] = useState(() => ({
    deck: buildDeck(),
    drawn: [] as EventCard[],
  }));

  const reset = useCallback(() => {
    setGame({ deck: shuffle(buildDeck()), drawn: [] });
  }, []);

  useEffect(() => reset(), [reset]);

  const draw = useCallback(() => {
    setGame((currentGame) => {
      if (currentGame.deck.length === 0) return currentGame;
      const [next, ...deck] = currentGame.deck;
      return { deck, drawn: [next, ...currentGame.drawn] };
    });
  }, []);

  const { deck, drawn } = game;
  const current = drawn[0];
  const isEmpty = deck.length === 0;
  const total = drawn.length + deck.length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-950 text-gray-100">
      <header className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
            Event deck
          </p>
          <h1 className="text-lg font-semibold tracking-tight">Thẻ sự kiện</h1>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-400 ring-1 ring-gray-800 transition active:scale-95 active:bg-gray-800"
        >
          Chơi lại
        </button>
      </header>

      <div className="grid grid-cols-3 gap-2 px-5">
        <Stat label="Đã rút" value={drawn.length} />
        <Stat label="Còn lại" value={deck.length} accent />
        <Stat label="Tổng" value={total} />
      </div>

      <section className="flex flex-1 items-center justify-center px-5 py-6">
        {current ? (
          <EventCardFace key={current.uid} card={current} />
        ) : (
          <EmptySlot label={isEmpty ? "Hết thẻ sự kiện" : "Nhấn nút bên dưới để rút thẻ đầu tiên"} />
        )}
      </section>

      {drawn.length > 1 && (
        <section className="pb-4">
          <h2 className="px-5 pb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Đã rút
          </h2>
          <ol className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {drawn.slice(1).map((card) => (
              <li key={card.uid} className="shrink-0 snap-start">
                <EventCardThumb card={card} />
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="sticky bottom-0 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <button
          type="button"
          onClick={draw}
          disabled={isEmpty}
          className="w-full rounded-2xl bg-gray-100 py-4 text-base font-semibold text-gray-950 shadow-lg transition active:scale-[0.98] active:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none"
        >
          {isEmpty ? "Hết thẻ" : `Rút thẻ sự kiện (${deck.length})`}
        </button>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-gray-900 px-3 py-2.5 text-center">
      <div
        className={`text-2xl font-semibold tabular-nums ${accent ? "text-sky-400" : "text-gray-100"}`}
      >
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide text-gray-500">
        {label}
      </div>
    </div>
  );
}

function EventCardFace({ card }: { card: EventCard }) {
  const translation = EVENT_CARD_TEXT_VI[card.id];

  return (
    <figure className="animate-[flip-in_320ms_ease-out] w-full">
      <div
        className={`relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-gray-900 shadow-2xl ring-2 ${EVENT_EFFECT_FRAME_STYLES[card.effect]}`}
      >
        <EventCardArtwork card={card} translation={translation} />
      </div>
      <figcaption className="flex items-center justify-center gap-2 pt-3">
        <span className="text-base font-medium">{translation?.name ?? card.name}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${EVENT_EFFECT_BADGE_STYLES[card.effect]}`}
        >
          {EVENT_EFFECT_LABELS[card.effect]}
        </span>
      </figcaption>
    </figure>
  );
}

function EventCardThumb({ card }: { card: EventCard }) {
  return (
    <div
      className={`aspect-[2/3] w-16 overflow-hidden rounded-lg bg-gray-900 ring-1 ${EVENT_EFFECT_FRAME_STYLES[card.effect]}`}
    >
      <EventCardArtwork card={card} compact />
    </div>
  );
}

function EventCardArtwork({
  card,
  compact = false,
  translation,
}: {
  card: EventCard;
  compact?: boolean;
  translation?: { name: string; text: string };
}) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center px-2 text-center ${
          card.effect === "positive"
            ? "bg-gradient-to-br from-emerald-950 to-gray-950"
            : "bg-gradient-to-br from-red-950 to-gray-950"
        }`}
      >
        <span
          className={`mb-2 rounded-full px-2 py-0.5 font-semibold uppercase ${
            compact ? "text-[6px]" : "text-[10px]"
          } ${EVENT_EFFECT_BADGE_STYLES[card.effect]}`}
        >
          {EVENT_EFFECT_LABELS[card.effect]}
        </span>
        <span className={compact ? "text-[8px] font-semibold" : "text-2xl font-semibold"}>
          {translation?.name ?? card.name}
        </span>
        {!compact && (
          <span className="mt-2 text-xs text-gray-500">
            Thêm ảnh vào public/cards/events
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <img
        src={card.image}
        alt={translation?.name ?? card.name}
        className="h-full w-full object-contain"
        draggable={false}
        onError={() => setMissing(true)}
      />
      {!compact && translation && <CardTranslationOverlay {...translation} />}
    </>
  );
}

function CardTranslationOverlay({ name, text }: { name: string; text: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 text-black" lang="vi">
      <div className="absolute inset-x-[14%] top-[10%] flex h-[15%] items-center justify-center bg-white px-1 text-center">
        <h2 className="text-[clamp(1rem,5.3vw,1.45rem)] font-black uppercase leading-[0.95] tracking-[-0.04em]">
          {name}
        </h2>
      </div>
      <div className="absolute inset-x-[13%] bottom-[10%] flex h-[25%] items-center bg-white px-[3%] py-1 rounded-b-2xl">
        <p className="text-left text-[clamp(0.63rem,4vw,1rem)] font-medium leading-[1.18]">
          {text}
        </p>
      </div>
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="flex aspect-[2/3] w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-800 px-6 text-center text-sm text-gray-600">
      {label}
    </div>
  );
}
