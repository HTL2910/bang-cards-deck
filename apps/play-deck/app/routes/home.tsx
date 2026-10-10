import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PLAY_CARDS } from "@bang/card-data";
import { AppShell, ConfirmDialog, Counter, DeckStats } from "@bang/shared-ui";

import { CardZone } from "../components/card-zone";
import {
  adjustHealth,
  createDefaultPlaySettings,
  createPlayState,
  drawToHand,
  movePlayCard,
} from "../model";
import {
  loadPlaySettings,
  loadPlayState,
  savePlayState,
} from "../storage";

export default function PlayHome() {
  const [settings, setSettings] = useState(createDefaultPlaySettings);
  const [state, setState] = useState(() => createPlayState(createDefaultPlaySettings()));
  const [hydrated, setHydrated] = useState(false);
  const [confirmingNewGame, setConfirmingNewGame] = useState(false);

  useEffect(() => {
    const storedSettings = loadPlaySettings(localStorage) ?? createDefaultPlaySettings();
    setSettings(storedSettings);
    setState(loadPlayState(localStorage) ?? createPlayState(storedSettings, Math.random));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePlayState(localStorage, state);
  }, [hydrated, state]);

  const disabledCards = PLAY_CARDS.filter(({ id }) => settings.disabledIds.includes(id));
  const allZonesEmpty =
    state.deck.length + state.hand.length + state.inPlay.length + state.discard.length === 0;
  const disabledSummary = disabledCards.length
    ? `Sẽ loại: ${disabledCards.map(({ nameVi }) => nameVi).join(", ")}.`
    : "Tất cả loại bài đang được bật.";

  return (
    <>
      <title>Bộ Bài Chơi BANG!</title>
      <AppShell
        title="Bộ Bài Chơi"
      subtitle="Quản lý bài cá nhân — luật được áp dụng thủ công"
      note="Ứng dụng không kiểm tra mục tiêu, khoảng cách, thời điểm, sát thương hay năng lực nhân vật."
      actions={<Link className="bang-button play-link" to="/settings">Cài đặt</Link>}
    >
      <div className="play-panel">
        <DeckStats
          stats={[
            { label: "Chồng rút", value: state.deck.length },
            { label: "Trên tay", value: state.hand.length },
            { label: "Đang dùng", value: state.inPlay.length },
            { label: "Đã bỏ", value: state.discard.length },
          ]}
        />

        <div className="play-toolbar">
          <Counter
            label="Máu"
            value={state.health}
            decreaseDisabled={state.health === 0}
            onDecrease={() => setState((value) => adjustHealth(value, -1))}
            onIncrease={() => setState((value) => adjustHealth(value, 1))}
          />
          <div className="play-toolbar__draw">
            <button className="bang-button" type="button" disabled={state.deck.length === 0} onClick={() => setState((value) => drawToHand(value, 1))}>
              Rút 1 lá
            </button>
            <button className="bang-button" type="button" disabled={state.deck.length === 0} onClick={() => setState((value) => drawToHand(value, 2))}>
              Rút 2 lá
            </button>
          </div>
        </div>

        {state.deck.length === 0 ? (
          <p className="play-empty-deck" role="status">
            {allZonesEmpty
              ? "Không có lá nào được bật. Hãy thay đổi Cài đặt rồi bắt đầu ván mới."
              : "Chồng bài rút đã hết."}
          </p>
        ) : null}

        <CardZone
          title="Bài trên tay"
          cards={state.hand}
          emptyText="Chưa có lá nào trên tay."
          actionFor={(card) =>
            card.category === "action"
              ? {
                  label: `Bỏ ${card.nameVi}`,
                  onClick: () => setState((value) => movePlayCard(value, "hand", "discard", card.uid)),
                }
              : {
                  label: `Đặt ${card.nameVi}`,
                  onClick: () => setState((value) => movePlayCard(value, "hand", "inPlay", card.uid)),
                }
          }
        />
        <CardZone
          title="Bài đang dùng"
          cards={state.inPlay}
          emptyText="Chưa có trang bị hoặc vũ khí."
          actionFor={(card) => ({
            label: `Bỏ ${card.nameVi}`,
            onClick: () => setState((value) => movePlayCard(value, "inPlay", "discard", card.uid)),
          })}
        />
        <CardZone
          title="Bài đã bỏ"
          cards={state.discard}
          emptyText="Chưa có lá nào trong chồng bỏ."
        />

        <button className="bang-button play-new-game" type="button" onClick={() => setConfirmingNewGame(true)}>
          Ván mới
        </button>
      </div>

      <ConfirmDialog
        open={confirmingNewGame}
        title="Bắt đầu ván mới?"
        description={`${disabledSummary} Bài, máu và các vùng hiện tại sẽ được đặt lại.`}
        confirmLabel="Bắt đầu ván mới"
        onCancel={() => setConfirmingNewGame(false)}
        onConfirm={() => {
          setState(createPlayState(settings, Math.random));
          setConfirmingNewGame(false);
        }}
      />
      </AppShell>
    </>
  );
}
