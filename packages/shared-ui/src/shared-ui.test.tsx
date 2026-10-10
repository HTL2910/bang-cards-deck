import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import "./styles.css";
import { CardArtwork, ConfirmDialog, Counter, DeckStats } from "./index";

describe("shared mobile card UI", () => {
  it("gives counter controls accessible names and 44px touch targets", () => {
    render(
      <Counter
        label="Máu"
        value={3}
        onDecrease={() => undefined}
        onIncrease={() => undefined}
      />,
    );

    const decrease = screen.getByRole("button", { name: "Giảm Máu" });
    const increase = screen.getByRole("button", { name: "Tăng Máu" });
    expect(decrease).toHaveStyle({ minWidth: "44px", minHeight: "44px" });
    expect(increase).toHaveStyle({ minWidth: "44px", minHeight: "44px" });
    expect(screen.getByText("3")).toHaveAccessibleName("Máu: 3");
  });

  it("labels the confirmation dialog and initially focuses the safe action", () => {
    render(
      <ConfirmDialog
        open
        title="Bắt đầu lại?"
        description="Tiến trình hiện tại sẽ bị xóa."
        confirmLabel="Bắt đầu lại"
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Bắt đầu lại?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy" })).toHaveFocus();
  });

  it("calls explicit cancel and confirm actions", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Xác nhận"
        description="Không thể hoàn tác."
        confirmLabel="Đồng ý"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    fireEvent.click(screen.getByRole("button", { name: "Đồng ý" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("exposes deck statistics with their labels", () => {
    render(
      <DeckStats
        stats={[
          { label: "Còn lại", value: 12 },
          { label: "Đã rút", value: 4 },
        ]}
      />,
    );

    expect(screen.getByLabelText("Còn lại: 12")).toBeInTheDocument();
    expect(screen.getByLabelText("Đã rút: 4")).toBeInTheDocument();
  });

  it("replaces broken artwork with translated text", () => {
    render(
      <CardArtwork
        src="/cards/characters/missing.png"
        alt="Bart Cassidy"
        name="Bart Cassidy"
        text="Mỗi khi mất máu, rút một lá."
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Bart Cassidy" }));

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Mỗi khi mất máu, rút một lá.")).toBeInTheDocument();
    expect(screen.getByLabelText("Không tải được ảnh Bart Cassidy")).toBeInTheDocument();
  });
});
