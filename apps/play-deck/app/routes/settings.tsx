import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { PLAY_CARDS } from "@bang/card-data";
import { AppShell } from "@bang/shared-ui";

import {
  createDefaultPlaySettings,
  toggleCardEnabled,
} from "../model";
import { loadPlaySettings, savePlaySettings } from "../storage";

export default function PlaySettingsRoute() {
  const [settings, setSettings] = useState(createDefaultPlaySettings);
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(loadPlaySettings(localStorage) ?? createDefaultPlaySettings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePlaySettings(localStorage, settings);
  }, [hydrated, settings]);

  const visibleCards = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    if (!normalized) return PLAY_CARDS;
    return PLAY_CARDS.filter((card) =>
      `${card.nameVi} ${card.originalName}`.toLocaleLowerCase("vi").includes(normalized),
    );
  }, [query]);

  return (
    <AppShell
      title="Cài Đặt Lá Bài"
      subtitle="Thay đổi chỉ áp dụng khi bắt đầu ván mới"
      actions={<Link className="bang-button play-link" to="/">Về bàn chơi</Link>}
      note="Cấu hình được lưu riêng với ván đang chơi; quay lại sẽ không xóa hoặc thay đổi các vùng bài hiện tại."
    >
      <div className="settings-panel">
        <label className="settings-search">
          <span>Tìm lá bài</span>
          <input
            type="search"
            aria-label="Tìm lá bài"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="settings-actions">
          <button className="bang-button" type="button" onClick={() => setSettings(createDefaultPlaySettings())}>
            Bật tất cả
          </button>
          <button
            className="bang-button"
            type="button"
            onClick={() => setSettings({ disabledIds: PLAY_CARDS.map(({ id }) => id) })}
          >
            Tắt tất cả
          </button>
        </div>

        {settings.disabledIds.length === PLAY_CARDS.length ? (
          <p className="settings-warning" role="status">
            Tất cả loại bài đều bị tắt; ván mới sẽ có bộ bài rỗng.
          </p>
        ) : null}

        <div className="settings-list">
          {visibleCards.map((card) => {
            const enabled = !settings.disabledIds.includes(card.id);
            return (
              <label className="settings-card" key={card.id}>
                <input
                  type="checkbox"
                  aria-label={`${card.nameVi} — ${card.count ?? 1} lá`}
                  checked={enabled}
                  onChange={() => setSettings((value) => toggleCardEnabled(value, card.id))}
                />
                <span>
                  <strong>{card.nameVi}</strong>
                  <small>{card.originalName} · {card.count ?? 1} lá</small>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
