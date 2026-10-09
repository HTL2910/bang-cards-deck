import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEventState, drawEvent } from "../model";
import { saveEventState } from "../storage";
import EventHome from "./home";

describe("Event Deck route", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
  });

  it("shows the current statistics and initial empty prompt", () => {
    render(<EventHome />);

    expect(screen.getByLabelText("Đã rút: 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Còn lại: 28")).toBeInTheDocument();
    expect(screen.getByLabelText("Tổng: 28")).toBeInTheDocument();
    expect(screen.getByText("Nhấn nút bên dưới để rút thẻ đầu tiên")).toBeInTheDocument();
  });

  it("draws artwork with Vietnamese overlay and an effect badge", () => {
    render(<EventHome />);
    fireEvent.click(screen.getByRole("button", { name: "Rút thẻ sự kiện (28)" }));

    expect(screen.getByRole("img", { name: "Cơn Khát" })).toHaveAttribute(
      "src",
      "/cards/events/sete.png",
    );
    expect(screen.getByRole("heading", { name: "Cơn Khát" })).toBeInTheDocument();
    expect(
      screen.getByText("Mỗi người chơi chỉ rút lá đầu tiên, không rút lá thứ hai, trong lượt rút bài của mình."),
    ).toBeInTheDocument();
    expect(screen.getByText("Negative")).toBeInTheDocument();
  });

  it("shows previous cards in a newest-first history strip", () => {
    render(<EventHome />);
    const draw = screen.getByRole("button", { name: /Rút thẻ sự kiện/ });
    fireEvent.click(draw);
    fireEvent.click(draw);

    expect(screen.getByRole("heading", { name: "Cò Quay Nga" })).toBeInTheDocument();
    const history = screen.getByRole("region", { name: "Đã rút" });
    expect(within(history).getByRole("img", { name: "Cơn Khát" })).toBeInTheDocument();
  });

  it("disables drawing and shows the exhausted state after the last card", () => {
    render(<EventHome />);
    const draw = screen.getByRole("button", { name: /Rút thẻ sự kiện/ });
    for (let index = 0; index < 28; index += 1) fireEvent.click(draw);

    expect(screen.getByRole("button", { name: "Hết thẻ" })).toBeDisabled();
    expect(screen.getByLabelText("Còn lại: 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Đã rút: 28")).toBeInTheDocument();
  });

  it("resets the deck and history with the existing play-again action", () => {
    render(<EventHome />);
    fireEvent.click(screen.getByRole("button", { name: /Rút thẻ sự kiện/ }));

    fireEvent.click(screen.getByRole("button", { name: "Chơi lại" }));

    expect(screen.getByLabelText("Đã rút: 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Còn lại: 28")).toBeInTheDocument();
    expect(screen.getByText("Nhấn nút bên dưới để rút thẻ đầu tiên")).toBeInTheDocument();
  });

  it("restores local event history after hydration", async () => {
    saveEventState(localStorage, drawEvent(createEventState()));

    render(<EventHome />);

    expect(await screen.findByRole("heading", { name: "Cơn Khát" })).toBeInTheDocument();
    expect(screen.getByLabelText("Đã rút: 1")).toBeInTheDocument();
  });

  it("uses translated fallback content when artwork is missing", () => {
    render(<EventHome />);
    fireEvent.click(screen.getByRole("button", { name: /Rút thẻ sự kiện/ }));

    fireEvent.error(screen.getByRole("img", { name: "Cơn Khát" }));

    expect(screen.getByLabelText("Không tải được ảnh Cơn Khát")).toBeInTheDocument();
  });
});
