import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCharacterState, drawCharacter } from "../model";
import { saveCharacterState } from "../storage";
import CharacterHome from "./home";

describe("Character Deck route", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
  });

  it("starts with an empty prompt and visible unofficial-translation note", () => {
    render(<CharacterHome />);

    expect(document.title).toBe("Bộ Nhân Vật BANG!");
    expect(screen.getByRole("heading", { name: "Bộ Nhân Vật" })).toBeInTheDocument();
    expect(screen.getByText("Chưa rút nhân vật")).toBeInTheDocument();
    expect(screen.getByText(/bản dịch không chính thức/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Còn lại: 16")).toBeInTheDocument();
  });

  it("draws translated content and exposes manual health controls", () => {
    render(<CharacterHome />);

    fireEvent.click(screen.getByRole("button", { name: "Rút nhân vật" }));

    expect(screen.getByRole("heading", { name: "Bart Cassidy" })).toBeInTheDocument();
    expect(screen.getByText("Mỗi khi mất 1 máu, bạn rút 1 lá bài từ chồng bài.")).toBeInTheDocument();
    expect(screen.getByLabelText("Máu: 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Giảm Máu" }));
    expect(screen.getByLabelText("Máu: 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tăng Máu" }));
    expect(screen.getByLabelText("Máu: 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Còn lại: 15")).toBeInTheDocument();
  });

  it("replaces the current character from the remaining deck", () => {
    render(<CharacterHome />);
    fireEvent.click(screen.getByRole("button", { name: "Rút nhân vật" }));

    fireEvent.click(screen.getByRole("button", { name: "Đổi nhân vật" }));

    expect(screen.getByRole("heading", { name: "Black Jack" })).toBeInTheDocument();
    expect(screen.getByLabelText("Còn lại: 14")).toBeInTheDocument();
  });

  it("shows translated fallback content when artwork fails", () => {
    render(<CharacterHome />);
    fireEvent.click(screen.getByRole("button", { name: "Rút nhân vật" }));

    fireEvent.error(screen.getByRole("img", { name: "Bart Cassidy" }));

    expect(screen.getByLabelText("Không tải được ảnh Bart Cassidy")).toBeInTheDocument();
  });

  it("requires confirmation before resetting the deck", () => {
    render(<CharacterHome />);
    fireEvent.click(screen.getByRole("button", { name: "Rút nhân vật" }));

    fireEvent.click(screen.getByRole("button", { name: "Bộ mới" }));
    expect(screen.getByRole("dialog", { name: "Bắt đầu bộ nhân vật mới?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(screen.getByRole("heading", { name: "Bart Cassidy" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Bộ mới" }));
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu lại" }));
    expect(screen.getByText("Chưa rút nhân vật")).toBeInTheDocument();
    expect(screen.getByLabelText("Còn lại: 16")).toBeInTheDocument();
  });

  it("restores a valid local character state after hydration", async () => {
    saveCharacterState(localStorage, drawCharacter(createCharacterState()));

    render(<CharacterHome />);

    expect(await screen.findByRole("heading", { name: "Bart Cassidy" })).toBeInTheDocument();
    expect(screen.getByLabelText("Máu: 4")).toBeInTheDocument();
  });
});
