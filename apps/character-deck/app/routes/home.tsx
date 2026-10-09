import { useEffect, useState } from "react";
import {
  AppShell,
  CardArtwork,
  ConfirmDialog,
  Counter,
  DeckStats,
} from "@bang/shared-ui";

import {
  adjustHealth,
  createCharacterState,
  drawCharacter,
  replaceCharacter,
} from "../model";
import { loadCharacterState, saveCharacterState } from "../storage";

const TRANSLATION_NOTE =
  "Bản dịch không chính thức. Người chơi tự áp dụng năng lực và tự cộng máu cho Cảnh Sát Trưởng.";

export default function CharacterHome() {
  const [state, setState] = useState(() => createCharacterState());
  const [hydrated, setHydrated] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    setState(loadCharacterState(localStorage) ?? createCharacterState(Math.random));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCharacterState(localStorage, state);
  }, [hydrated, state]);

  const current = state.current;

  return (
    <AppShell
      title="Bộ Nhân Vật"
      subtitle="Rút và quản lý nhân vật trên thiết bị này"
      note={TRANSLATION_NOTE}
      actions={
        <button className="bang-button" type="button" onClick={() => setConfirmingReset(true)}>
          Bộ mới
        </button>
      }
    >
      <div className="character-panel">
        <DeckStats
          stats={[
            { label: "Còn lại", value: state.deck.length },
            { label: "Đã rút", value: state.history.length },
          ]}
        />

        {current ? (
          <article className="character-card">
            <CardArtwork
              className="character-card__art"
              src={current.image}
              alt={current.nameVi}
              name={current.nameVi}
              text={current.textVi}
            />
            <div className="character-card__details">
              <h2>{current.nameVi}</h2>
              <p className="character-card__name-original">{current.originalName}</p>
              <p className="character-card__ability">{current.textVi}</p>
              <Counter
                label="Máu"
                value={state.health}
                decreaseDisabled={state.health === 0}
                onDecrease={() => setState((value) => adjustHealth(value, -1))}
                onIncrease={() => setState((value) => adjustHealth(value, 1))}
              />
            </div>
          </article>
        ) : (
          <section className="character-empty">
            <div>
              <h2>Chưa rút nhân vật</h2>
              <p>Nhấn nút bên dưới để bắt đầu với một nhân vật ngẫu nhiên.</p>
            </div>
          </section>
        )}

        <div className="character-actions">
          {current ? (
            <button
              className="bang-button"
              type="button"
              disabled={state.deck.length === 0}
              onClick={() => setState(replaceCharacter)}
            >
              Đổi nhân vật
            </button>
          ) : (
            <button
              className="bang-button"
              type="button"
              disabled={state.deck.length === 0}
              onClick={() => setState(drawCharacter)}
            >
              Rút nhân vật
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmingReset}
        title="Bắt đầu bộ nhân vật mới?"
        description="Nhân vật hiện tại, máu và lịch sử rút trên thiết bị này sẽ bị xóa."
        confirmLabel="Bắt đầu lại"
        onCancel={() => setConfirmingReset(false)}
        onConfirm={() => {
          setState(createCharacterState(Math.random));
          setConfirmingReset(false);
        }}
      />
    </AppShell>
  );
}
