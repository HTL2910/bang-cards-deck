import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import { createDefaultPlaySettings, createPlayState, drawToHand } from "../model";
import { loadPlaySettings, loadPlayState, savePlayState } from "../storage";
import PlaySettingsRoute from "./settings";

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={["/settings"]}>
      <Routes>
        <Route path="/" element={<p>Bàn chơi</p>} />
        <Route path="/settings" element={<PlaySettingsRoute />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Play settings route", () => {
  beforeEach(() => localStorage.clear());

  it("shows a searchable list of all 22 card types", () => {
    renderSettings();

    expect(screen.getAllByRole("checkbox")).toHaveLength(22);
    fireEvent.change(screen.getByRole("searchbox", { name: "Tìm lá bài" }), {
      target: { value: "Bia" },
    });
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.getByRole("checkbox", { name: /Bia/ })).toBeInTheDocument();
  });

  it("toggles card types independently and persists settings", () => {
    renderSettings();

    const bang = screen.getByRole("checkbox", { name: /BANG!/ });
    const missed = screen.getByRole("checkbox", { name: /TRƯỢT!/ });
    fireEvent.click(bang);

    expect(bang).not.toBeChecked();
    expect(missed).toBeChecked();
    expect(loadPlaySettings(localStorage)?.disabledIds).toEqual(["bang"]);
  });

  it("warns when all cards are disabled and restores the default selection", () => {
    renderSettings();

    fireEvent.click(screen.getByRole("button", { name: "Tắt tất cả" }));
    expect(screen.getByText(/ván mới sẽ có bộ bài rỗng/i)).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("checkbox")
        .every((checkbox) => !(checkbox as HTMLInputElement).checked),
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Bật tất cả" }));
    expect(screen.queryByText(/ván mới sẽ có bộ bài rỗng/i)).not.toBeInTheDocument();
    expect(loadPlaySettings(localStorage)).toEqual(createDefaultPlaySettings());
  });

  it("navigates back without changing the active game", () => {
    const active = drawToHand(createPlayState(createDefaultPlaySettings()), 2);
    savePlayState(localStorage, active);
    renderSettings();

    fireEvent.click(screen.getByRole("checkbox", { name: /BANG!/ }));
    fireEvent.click(screen.getByRole("link", { name: "Về bàn chơi" }));

    expect(screen.getByText("Bàn chơi")).toBeInTheDocument();
    expect(loadPlayState(localStorage)).toEqual(active);
  });
});
