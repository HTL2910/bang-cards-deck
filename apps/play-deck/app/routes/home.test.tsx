import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createDefaultPlaySettings,
  createPlayState,
  drawToHand,
  movePlayCard,
} from "../model";
import { savePlaySettings, savePlayState } from "../storage";
import PlayHome from "./home";

function renderHome() {
  return render(
    <MemoryRouter>
      <PlayHome />
    </MemoryRouter>,
  );
}

function stateWithCardsInHand(ids: string[]) {
  let state = createPlayState(createDefaultPlaySettings());
  for (const id of ids) {
    const card = state.deck.find((item) => item.id === id);
    if (!card) throw new Error(`Missing fixture card ${id}`);
    state = movePlayCard(state, "deck", "hand", card.uid);
  }
  return state;
}

describe("Play Deck route", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
  });

  it("shows zone counts and draws one or two cards", () => {
    renderHome();

    expect(screen.getByLabelText("Chồng rút: 80")).toBeInTheDocument();
    expect(screen.getByLabelText("Trên tay: 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Đang dùng: 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Đã bỏ: 0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rút 1 lá" }));
    expect(screen.getByLabelText("Trên tay: 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Rút 2 lá" }));
    expect(screen.getByLabelText("Trên tay: 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Chồng rút: 77")).toBeInTheDocument();
  });

  it("disables drawing and explains an intentionally empty deck", () => {
    savePlaySettings(localStorage, {
      disabledIds: [
        "bang", "missed", "beer", "cat-balou", "panic", "stagecoach", "wells-fargo",
        "general-store", "indians", "gatling", "duel", "saloon", "barrel", "dynamite",
        "jail", "mustang", "scope", "volcanic", "schofield", "remington", "rev-carabine",
        "winchester",
      ],
    });

    renderHome();

    expect(screen.getByRole("button", { name: "Rút 1 lá" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Rút 2 lá" })).toBeDisabled();
    expect(screen.getByText(/không có lá nào được bật/i)).toBeInTheDocument();
  });

  it("moves action cards to discard and equipment through the in-play zone", async () => {
    savePlayState(localStorage, stateWithCardsInHand(["bang", "barrel"]));
    renderHome();

    expect(await screen.findByRole("button", { name: "Bỏ BANG!" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ BANG!" }));
    expect(screen.getByLabelText("Đã bỏ: 1")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Bài đã bỏ" })).getByRole("heading", {
        name: "BANG!",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Đặt Thùng Gỗ" }));
    expect(screen.getByLabelText("Đang dùng: 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ Thùng Gỗ" }));
    expect(screen.getByLabelText("Đang dùng: 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Đã bỏ: 2")).toBeInTheDocument();
  });

  it("restores persisted health and keeps health controls manual", async () => {
    savePlayState(
      localStorage,
      { ...drawToHand(createPlayState(createDefaultPlaySettings()), 2), health: 2 },
    );
    renderHome();

    expect(await screen.findByLabelText("Máu: 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Giảm Máu" }));
    expect(screen.getByLabelText("Máu: 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tăng Máu" }));
    expect(screen.getByLabelText("Máu: 2")).toBeInTheDocument();
  });

  it("lists disabled card names before confirming a new game", () => {
    savePlaySettings(localStorage, { disabledIds: ["bang", "beer"] });
    savePlayState(localStorage, drawToHand(createPlayState(createDefaultPlaySettings()), 2));
    renderHome();

    fireEvent.click(screen.getByRole("button", { name: "Ván mới" }));

    const dialog = screen.getByRole("dialog", { name: "Bắt đầu ván mới?" });
    expect(dialog).toHaveTextContent("BANG!");
    expect(dialog).toHaveTextContent("Bia");
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu ván mới" }));
    expect(screen.getByLabelText("Chồng rút: 49")).toBeInTheDocument();
    expect(screen.getByLabelText("Trên tay: 0")).toBeInTheDocument();
  });
});
