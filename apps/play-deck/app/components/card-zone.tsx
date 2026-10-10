import { CardArtwork } from "@bang/shared-ui";

import type { PlayCard } from "../model";

export type CardAction = {
  label: string;
  onClick: () => void;
};

export type CardZoneProps = {
  title: string;
  cards: readonly PlayCard[];
  emptyText: string;
  actionFor?: (card: PlayCard) => CardAction;
};

export function CardZone({ title, cards, emptyText, actionFor }: CardZoneProps) {
  return (
    <section className="play-zone" aria-label={title}>
      <h2>{title}</h2>
      {cards.length === 0 ? (
        <p className="play-zone__empty">{emptyText}</p>
      ) : (
        <div className="play-zone__cards">
          {cards.map((card) => {
            const action = actionFor?.(card);
            return (
              <article className="play-card" key={card.uid}>
                <CardArtwork
                  src={card.image}
                  alt={card.nameVi}
                  name={card.nameVi}
                  text={card.textVi}
                />
                <h3>{card.nameVi}</h3>
                <p>{card.textVi}</p>
                {action ? (
                  <button className="bang-button" type="button" onClick={action.onClick}>
                    {action.label}
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
