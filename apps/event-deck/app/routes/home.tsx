import { useEffect, useState } from "react";
import { CardArtwork } from "@bang/shared-ui";

import {
  createEventState,
  drawEvent,
  resetEventState,
  type EventCard,
} from "../model";
import { loadEventState, saveEventState } from "../storage";

const EFFECT_LABELS = { positive: "Positive", negative: "Negative" } as const;

export default function EventHome() {
  const [state, setState] = useState(() => createEventState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadEventState(localStorage) ?? createEventState(Math.random));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveEventState(localStorage, state);
  }, [hydrated, state]);

  const current = state.history[0];
  const isEmpty = state.deck.length === 0;

  return (
    <main className="event-shell">
      <title>Thẻ sự kiện BANG!</title>
      <header className="event-header">
        <div>
          <p>Event deck</p>
          <h1>Thẻ sự kiện</h1>
        </div>
        <button type="button" onClick={() => setState(resetEventState(Math.random))}>
          Chơi lại
        </button>
      </header>

      <dl className="event-stats">
        <Stat label="Đã rút" value={state.history.length} />
        <Stat label="Còn lại" value={state.deck.length} accent />
        <Stat label="Tổng" value={state.history.length + state.deck.length} />
      </dl>

      <section className="event-current">
        {current ? (
          <EventCardFace key={current.uid} card={current} />
        ) : (
          <div className="event-empty-slot">
            {isEmpty ? "Hết thẻ sự kiện" : "Nhấn nút bên dưới để rút thẻ đầu tiên"}
          </div>
        )}
      </section>

      {state.history.length > 1 ? (
        <section className="event-history" aria-label="Đã rút">
          <h2>Đã rút</h2>
          <ol>
            {state.history.slice(1).map((card) => (
              <li key={card.uid}>
                <CardArtwork
                  className={`event-thumb event-frame--${card.effect}`}
                  src={card.image}
                  alt={card.nameVi}
                  name={card.nameVi}
                  text={card.textVi}
                />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="event-draw-bar">
        <button type="button" disabled={isEmpty} onClick={() => setState(drawEvent)}>
          {isEmpty ? "Hết thẻ" : `Rút thẻ sự kiện (${state.deck.length})`}
        </button>
      </div>
    </main>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div aria-label={`${label}: ${value}`} className={accent ? "event-stat event-stat--accent" : "event-stat"}>
      <dd>{value}</dd>
      <dt>{label}</dt>
    </div>
  );
}

function EventCardFace({ card }: { card: EventCard }) {
  return (
    <figure className="event-card-face">
      <div className={`event-card-frame event-frame--${card.effect}`}>
        <CardArtwork
          src={card.image}
          alt={card.nameVi}
          name={card.nameVi}
          text={card.textVi}
        />
        <div className="event-translation" lang="vi">
          <h2>{card.nameVi}</h2>
          <p>{card.textVi}</p>
        </div>
      </div>
      <figcaption>
        <span>{card.nameVi}</span>
        <span className={`event-badge event-badge--${card.effect}`}>
          {EFFECT_LABELS[card.effect]}
        </span>
      </figcaption>
    </figure>
  );
}
