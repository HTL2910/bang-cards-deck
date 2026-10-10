import { useEffect, useState } from "react";
import { AppShell, CardArtwork, ConfirmDialog, DeckStats } from "@bang/shared-ui";

import {
  createRoleState,
  drawRole,
  redrawRole,
  setRoleRevealed,
} from "../model";
import { loadRoleState, saveRoleState } from "../storage";

export default function RoleHome() {
  const [state, setState] = useState(() => createRoleState(4));
  const [hydrated, setHydrated] = useState(false);
  const [confirmingRedraw, setConfirmingRedraw] = useState(false);

  useEffect(() => {
    setState(loadRoleState(localStorage) ?? createRoleState(4, Math.random));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveRoleState(localStorage, state);
  }, [hydrated, state]);

  const current = state.current;

  return (
    <>
      <title>Bộ Vai Trò BANG!</title>
      <AppShell
        title="Bộ Vai Trò"
      subtitle="Rút riêng trên thiết bị của bạn"
      note="Bản dịch không chính thức. Nhóm chơi tự xử lý vai trò trùng giữa các thiết bị."
    >
      <div className="role-panel">
        <label className="role-settings">
          <span>Số người chơi</span>
          <select
            aria-label="Số người chơi"
            value={state.playerCount}
            onChange={(event) =>
              setState(createRoleState(Number(event.target.value), Math.random))
            }
          >
            {[4, 5, 6, 7].map((count) => (
              <option key={count} value={count}>{count} người</option>
            ))}
          </select>
        </label>

        <p className="role-private-note">
          Kết quả chỉ lưu trên máy này và không đồng bộ với thiết bị khác. Hãy che màn hình trước khi rút.
        </p>

        <DeckStats stats={[{ label: "Còn lại", value: state.deck.length }]} />

        {current && state.revealed ? (
          <article className="role-card">
            <CardArtwork
              className="role-card__art"
              src={current.image}
              alt={current.nameVi}
              name={current.nameVi}
              text={current.textVi}
            />
            <div>
              <h2>{current.nameVi}</h2>
              <p>{current.originalName}</p>
              <p className="role-card__objective">{current.textVi}</p>
            </div>
          </article>
        ) : (
          <section className="role-facedown">
            <div>
              <h2>{current ? "Vai trò đang úp" : "Chưa rút vai trò"}</h2>
              <p>{current ? "Chỉ mở khi màn hình đang hướng về phía bạn." : "Chọn số người chơi rồi rút một lá."}</p>
            </div>
          </section>
        )}

        <div className="role-actions">
          {!current ? (
            <button className="bang-button role-actions__primary" type="button" onClick={() => setState(drawRole)}>
              Rút vai trò
            </button>
          ) : state.revealed ? (
            <>
              <button
                className="bang-button role-actions__primary"
                type="button"
                onClick={() => setState((value) => setRoleRevealed(value, false))}
              >
                Ẩn vai trò
              </button>
              <button
                className="bang-button"
                type="button"
                disabled={state.deck.length === 0}
                onClick={() => setConfirmingRedraw(true)}
              >
                Rút lại
              </button>
            </>
          ) : (
            <button
              className="bang-button role-actions__primary"
              type="button"
              onClick={() => setState((value) => setRoleRevealed(value, true))}
            >
              Xem vai trò
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmingRedraw}
        title="Rút lại vai trò?"
        description="Vai trò hiện tại sẽ bị bỏ khỏi bộ cục bộ trên thiết bị này."
        confirmLabel="Rút vai trò khác"
        onCancel={() => setConfirmingRedraw(false)}
        onConfirm={() => {
          setState(redrawRole);
          setConfirmingRedraw(false);
        }}
      />
      </AppShell>
    </>
  );
}
